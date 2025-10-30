import { Request, Response, NextFunction } from 'express';
import { enhancedJwtService, EnhancedTokenPayload } from '../services/enhancedJwtService';

declare global {
  namespace Express {
    interface Request {
      user?: EnhancedTokenPayload;
      organizationId?: number;
      userId?: string;
      userRole?: string;
      subscriptionTier?: string;
      subscriptionStatus?: string;
      tenantContext?: {
        primaryOrganizationId: number;
        organizations: Array<{
          organizationId: number;
          organizationName: string;
          role: string;
          isPrimary: boolean;
        }>;
      };
    }
  }
}

export const extractTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const payload = enhancedJwtService.verifyAccessToken(token);

    req.user = payload;
    req.userId = payload.userId;
    req.organizationId = payload.primaryOrganizationId;
    req.userRole = payload.role;
    req.subscriptionTier = payload.subscriptionTier;
    req.subscriptionStatus = payload.subscriptionStatus;
    req.tenantContext = {
      primaryOrganizationId: payload.primaryOrganizationId,
      organizations: payload.organizations,
    };

    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

export const requireActiveSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.user.subscriptionStatus !== 'active') {
    return res.status(403).json({
      error: 'Subscription Inactive',
      message: 'An active subscription is required to access this feature',
      subscriptionStatus: req.user.subscriptionStatus,
    });
  }

  next();
};

export const requireFeature = (featureName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!req.user.features?.[featureName]) {
      return res.status(403).json({
        error: 'Feature Not Available',
        message: `Feature '${featureName}' is not available with your subscription tier`,
        subscriptionTier: req.user.subscriptionTier,
      });
    }

    next();
  };
};

export const checkOrganizationAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  const requestedOrgId = parseInt(
    req.params.organizationId || (req.query.organizationId as string),
    10
  );

  if (!requestedOrgId) {
    req.organizationId = req.user.primaryOrganizationId;
    return next();
  }

  const hasAccess = req.user.organizations.some(
    (org) => org.organizationId === requestedOrgId
  );

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this organization',
    });
  }

  req.organizationId = requestedOrgId;
  next();
};

export const handleTokenRefresh = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  enhancedJwtService
    .refreshAccessToken(refreshToken)
    .then((tokens) => {
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      const payload = enhancedJwtService.verifyAccessToken(tokens.accessToken);
      req.user = payload;
      req.userId = payload.userId;
      req.organizationId = payload.primaryOrganizationId;
      req.userRole = payload.role;

      next();
    })
    .catch((error) => {
      console.error('Token refresh failed:', error.message);
      next();
    });
};

export const tenantContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    if (!req.organizationId) {
      req.organizationId = req.user.primaryOrganizationId;
    }

    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('X-Tenant-Organization-Id', req.organizationId.toString());
      res.setHeader('X-Tenant-User-Id', req.userId || '');
      res.setHeader('X-Tenant-Subscription-Tier', req.subscriptionTier || '');
    }
  }

  next();
};
