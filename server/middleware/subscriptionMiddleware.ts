import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface SubscriptionInfo {
  organizationId: string;
  subscriptionTier: 'trial' | 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused';
  features: Record<string, boolean>;
  limits: {
    maxResidents: number;
    maxProperties: number;
    currentResidents: number;
    currentProperties: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      subscription?: SubscriptionInfo;
      organizationId?: string;
      userRole?: string;
    }
  }
}

export async function loadSubscriptionInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next();
    }

    const result = await db.execute(sql`
      SELECT
        o.id as organization_id,
        o.subscription_tier,
        o.subscription_status,
        o.features_enabled,
        o.max_residents,
        o.max_properties,
        o.current_resident_count,
        o.current_property_count,
        o.trial_end_date,
        o.subscription_end_date,
        uo.role as user_role
      FROM user_organizations uo
      JOIN organizations o ON o.id = uo.organization_id
      WHERE uo.user_id = ${userId}
        AND uo.status = 'active'
        AND (uo.is_primary = true OR uo.organization_id = (
          SELECT organization_id FROM user_organizations
          WHERE user_id = ${userId} AND status = 'active'
          ORDER BY is_primary DESC, created_at ASC
          LIMIT 1
        ))
      LIMIT 1
    `);

    if (result.rows && result.rows.length > 0) {
      const org = result.rows[0] as any;

      const now = new Date();
      let subscriptionStatus = org.subscription_status;

      if (org.subscription_tier === 'trial' && org.trial_end_date && new Date(org.trial_end_date as string) < now) {
        subscriptionStatus = 'cancelled';
      }

      if (org.subscription_end_date && new Date(org.subscription_end_date as string) < now) {
        subscriptionStatus = 'cancelled';
      }

      req.subscription = {
        organizationId: org.organization_id as string,
        subscriptionTier: org.subscription_tier as 'trial' | 'starter' | 'professional' | 'enterprise',
        subscriptionStatus: subscriptionStatus as 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused',
        features: (org.features_enabled as Record<string, boolean>) || {},
        limits: {
          maxResidents: org.max_residents as number,
          maxProperties: org.max_properties as number,
          currentResidents: org.current_resident_count as number,
          currentProperties: org.current_property_count as number,
        },
      };

      req.organizationId = org.organization_id as string;
      req.userRole = org.user_role as string;
    }

    next();
  } catch (error) {
    console.error('Error loading subscription info:', error);
    next();
  }
}

export function requireActiveSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.subscription) {
    res.status(403).json({
      error: 'No active subscription found',
      message: 'Please subscribe to access this feature.',
    });
    return;
  }

  const { subscriptionStatus } = req.subscription;

  if (subscriptionStatus === 'cancelled' || subscriptionStatus === 'past_due') {
    res.status(403).json({
      error: 'Subscription inactive',
      message: 'Your subscription is not active. Please update your payment method or renew your subscription.',
      subscriptionStatus,
    });
    return;
  }

  next();
}

export function requireFeature(featureName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.subscription) {
      res.status(403).json({
        error: 'No subscription found',
        message: 'Please subscribe to access this feature.',
      });
      return;
    }

    const { subscriptionTier, features } = req.subscription;

    if (features[featureName] !== true) {
      res.status(403).json({
        error: 'Feature not available',
        message: `This feature is not available in your current plan (${subscriptionTier}). Please upgrade to access it.`,
        featureName,
        currentTier: subscriptionTier,
        requiredUpgrade: true,
      });
      return;
    }

    next();
  };
}

export function requireTier(minTier: 'starter' | 'professional' | 'enterprise') {
  const tierLevels = {
    starter: 1,
    professional: 2,
    enterprise: 3,
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.subscription) {
      res.status(403).json({
        error: 'No subscription found',
        message: 'Please subscribe to access this feature.',
      });
      return;
    }

    const { subscriptionTier } = req.subscription;
    const userTierLevel = tierLevels[subscriptionTier as keyof typeof tierLevels] || 0;
    const requiredTierLevel = tierLevels[minTier];

    if (userTierLevel < requiredTierLevel) {
      res.status(403).json({
        error: 'Insufficient subscription tier',
        message: `This feature requires ${minTier} plan or higher. You are currently on ${subscriptionTier} plan.`,
        currentTier: subscriptionTier,
        requiredTier: minTier,
        requiredUpgrade: true,
      });
      return;
    }

    next();
  };
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(403).json({
        error: 'Role not found',
        message: 'User role information is missing.',
      });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        currentRole: req.userRole,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}

export async function checkResidentLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.subscription) {
    res.status(403).json({
      error: 'No subscription found',
      message: 'Please subscribe to continue.',
    });
    return;
  }

  const { limits } = req.subscription;

  if (limits.currentResidents >= limits.maxResidents) {
    res.status(403).json({
      error: 'Resident limit reached',
      message: `You have reached your resident limit (${limits.maxResidents}). Please upgrade your plan to add more residents.`,
      currentCount: limits.currentResidents,
      maxAllowed: limits.maxResidents,
      requiredUpgrade: true,
    });
    return;
  }

  next();
}

export async function checkPropertyLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.subscription) {
    res.status(403).json({
      error: 'No subscription found',
      message: 'Please subscribe to continue.',
    });
    return;
  }

  const { limits } = req.subscription;

  if (limits.currentProperties >= limits.maxProperties) {
    res.status(403).json({
      error: 'Property limit reached',
      message: `You have reached your property limit (${limits.maxProperties}). Please upgrade your plan to add more properties.`,
      currentCount: limits.currentProperties,
      maxAllowed: limits.maxProperties,
      requiredUpgrade: true,
    });
    return;
  }

  next();
}
