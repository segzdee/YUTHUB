import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { ConfidentialClientApplication } from "@azure/msal-node";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import { users, userAuthMethods, userSessions, authAuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Multi-method authentication configuration
export class MultiAuthManager {
  private msalApp: ConfidentialClientApplication | null = null;

  constructor() {
    // Initialize Microsoft Auth if credentials are available
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
      this.msalApp = new ConfidentialClientApplication({
        auth: {
          clientId: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          authority: "https://login.microsoftonline.com/common",
        },
      });
    }
  }

  // Configure Google OAuth Strategy
  configureGoogleAuth() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.log("Google OAuth credentials not configured - skipping Google auth");
      return;
    }

    passport.use(
      new GoogleStrategy(
        {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await this.handleOAuthLogin({
              provider: "GOOGLE",
              providerId: profile.id,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
            });
            return done(null, user);
          } catch (error) {
            console.error("Google auth error:", error);
            return done(error, null);
          }
        }
      )
    );
  }

  // Configure local email/password strategy
  configureLocalAuth() {
    passport.use(
      new LocalStrategy(
        {
          usernameField: "email",
          passwordField: "password",
        },
        async (email, password, done) => {
          try {
            const user = await this.handleEmailLogin(email, password);
            return done(null, user);
          } catch (error) {
            console.error("Local auth error:", error);
            return done(error, null);
          }
        }
      )
    );
  }

  // Handle OAuth login (Google, Microsoft, Apple)
  async handleOAuthLogin(authData: {
    provider: string;
    providerId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    const { provider, providerId, email } = authData;

    // Check if user exists by provider ID
    const [existingAuthMethod] = await db
      .select()
      .from(userAuthMethods)
      .where(
        and(
          eq(userAuthMethods.provider, provider),
          eq(userAuthMethods.providerId, providerId)
        )
      );

    let user;
    if (existingAuthMethod) {
      // Update existing auth method
      await db
        .update(userAuthMethods)
        .set({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          tokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
          updatedAt: new Date(),
        })
        .where(eq(userAuthMethods.id, existingAuthMethod.id));

      // Get user
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, existingAuthMethod.userId));
    } else {
      // Check if user exists by email for account linking
      let existingUser;
      if (email) {
        [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
      }

      if (existingUser) {
        // Link new auth method to existing user
        await db.insert(userAuthMethods).values({
          userId: existingUser.id,
          provider,
          providerId,
          providerEmail: email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          tokenExpiresAt: new Date(Date.now() + 3600000),
          providerData: authData,
        });
        user = existingUser;
      } else {
        // Create new user
        const newUserId = crypto.randomUUID();
        [user] = await db
          .insert(users)
          .values({
            id: newUserId,
            email,
            firstName: authData.firstName,
            lastName: authData.lastName,
            profileImageUrl: authData.profileImageUrl,
            primaryAuthMethod: provider,
            emailVerified: true, // OAuth emails are pre-verified
          })
          .returning();

        // Add auth method
        await db.insert(userAuthMethods).values({
          userId: newUserId,
          provider,
          providerId,
          providerEmail: email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          tokenExpiresAt: new Date(Date.now() + 3600000),
          providerData: authData,
        });
      }
    }

    // Log authentication event
    await this.logAuthEvent(user.id, "LOGIN", provider, true);
    
    return user;
  }

  // Handle email/password login
  async handleEmailLogin(email: string, password: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      await this.logAuthEvent(null, "FAILED_LOGIN", "EMAIL", false, "User not found");
      throw new Error("Invalid credentials");
    }

    if (user.accountLocked) {
      await this.logAuthEvent(user.id, "FAILED_LOGIN", "EMAIL", false, "Account locked");
      throw new Error("Account is locked");
    }

    if (!user.passwordHash) {
      await this.logAuthEvent(user.id, "FAILED_LOGIN", "EMAIL", false, "No password set");
      throw new Error("Please use social login or reset password");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      await db
        .update(users)
        .set({
          failedLoginAttempts: user.failedLoginAttempts + 1,
          ...(user.failedLoginAttempts >= 4 && {
            accountLocked: true,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          }),
        })
        .where(eq(users.id, user.id));

      await this.logAuthEvent(user.id, "FAILED_LOGIN", "EMAIL", false, "Invalid password");
      throw new Error("Invalid credentials");
    }

    // Reset failed login attempts on successful login
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await this.logAuthEvent(user.id, "LOGIN", "EMAIL", true);
    return user;
  }

  // Register new user with email/password
  async registerUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    subscriptionTier?: string;
  }) {
    const { email, password, firstName, lastName, subscriptionTier } = userData;

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const newUserId = crypto.randomUUID();
    const [user] = await db
      .insert(users)
      .values({
        id: newUserId,
        email,
        firstName,
        lastName,
        passwordHash,
        primaryAuthMethod: "EMAIL",
        emailVerificationToken,
        subscriptionTier: subscriptionTier || "trial",
      })
      .returning();

    // Add email auth method
    await db.insert(userAuthMethods).values({
      userId: newUserId,
      provider: "EMAIL",
      providerId: email,
      providerEmail: email,
    });

    await this.logAuthEvent(user.id, "REGISTER", "EMAIL", true);
    return user;
  }

  // Generate and store session token
  async createSession(userId: string, deviceInfo: any) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(userSessions).values({
      userId,
      sessionToken,
      deviceInfo,
      expiresAt,
    });

    return sessionToken;
  }

  // Validate session token
  async validateSession(sessionToken: string) {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          eq(userSessions.isActive, true)
        )
      );

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update last activity
    await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.id, session.id));

    return session;
  }

  // Log authentication events
  async logAuthEvent(
    userId: string | null,
    action: string,
    provider: string,
    success: boolean,
    failureReason?: string,
    metadata?: any
  ) {
    await db.insert(authAuditLog).values({
      userId,
      action,
      provider,
      success,
      failureReason,
      metadata,
    });
  }

  // Get user's authentication methods
  async getUserAuthMethods(userId: string) {
    return await db
      .select()
      .from(userAuthMethods)
      .where(
        and(
          eq(userAuthMethods.userId, userId),
          eq(userAuthMethods.isActive, true)
        )
      );
  }

  // Remove authentication method
  async removeAuthMethod(userId: string, methodId: number) {
    // Ensure user has at least one auth method remaining
    const methods = await this.getUserAuthMethods(userId);
    if (methods.length <= 1) {
      throw new Error("Cannot remove the last authentication method");
    }

    await db
      .update(userAuthMethods)
      .set({ isActive: false })
      .where(
        and(
          eq(userAuthMethods.id, methodId),
          eq(userAuthMethods.userId, userId)
        )
      );

    await this.logAuthEvent(userId, "AUTH_METHOD_REMOVED", "SYSTEM", true);
  }

  // Microsoft OAuth redirect URL
  getMicrosoftAuthUrl(state: string) {
    if (!this.msalApp) {
      throw new Error("Microsoft auth not configured");
    }

    return this.msalApp.getAuthCodeUrl({
      scopes: ["user.read", "email", "profile"],
      redirectUri: `${process.env.APP_URL}/auth/microsoft/callback`,
      state,
    });
  }

  // Handle Microsoft OAuth callback
  async handleMicrosoftCallback(code: string, state: string) {
    if (!this.msalApp) {
      throw new Error("Microsoft auth not configured");
    }

    try {
      const tokenResponse = await this.msalApp.acquireTokenByCode({
        code,
        scopes: ["user.read", "email", "profile"],
        redirectUri: `${process.env.APP_URL}/auth/microsoft/callback`,
      });

      const { account } = tokenResponse;
      
      return await this.handleOAuthLogin({
        provider: "MICROSOFT",
        providerId: account?.homeAccountId || "",
        email: account?.username,
        firstName: account?.name?.split(" ")[0],
        lastName: account?.name?.split(" ").slice(1).join(" "),
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      });
    } catch (error) {
      console.error("Microsoft auth error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiAuthManager = new MultiAuthManager();

// Authentication middleware
export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Setup multi-method authentication
export async function setupMultiAuth(app: Express) {
  const authManager = multiAuthManager;
  
  // Configure strategies
  authManager.configureGoogleAuth();
  authManager.configureLocalAuth();

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login?error=auth_failed" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.post("/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.post("/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, subscriptionTier } = req.body;
      
      const user = await authManager.registerUser({
        email,
        password,
        firstName,
        lastName,
        subscriptionTier,
      });

      res.json({ success: true, user, needsEmailVerification: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/auth/microsoft", (req, res) => {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      req.session.microsoftState = state;
      const authUrl = authManager.getMicrosoftAuthUrl(state);
      res.redirect(authUrl);
    } catch (error) {
      res.redirect("/login?error=microsoft_config");
    }
  });

  app.get("/auth/microsoft/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (state !== req.session.microsoftState) {
        return res.redirect("/login?error=invalid_state");
      }

      const user = await authManager.handleMicrosoftCallback(code as string, state as string);
      req.login(user, (err) => {
        if (err) {
          return res.redirect("/login?error=login_failed");
        }
        res.redirect("/dashboard");
      });
    } catch (error) {
      console.error("Microsoft callback error:", error);
      res.redirect("/login?error=auth_failed");
    }
  });

  app.post("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Get user's auth methods
  app.get("/auth/methods", requireAuth, async (req, res) => {
    try {
      const methods = await authManager.getUserAuthMethods((req.user as any).id);
      res.json(methods.map(m => ({
        id: m.id,
        provider: m.provider,
        providerEmail: m.providerEmail,
        createdAt: m.createdAt,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auth methods" });
    }
  });

  // Remove auth method
  app.delete("/auth/methods/:id", requireAuth, async (req, res) => {
    try {
      await authManager.removeAuthMethod((req.user as any).id, parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
}