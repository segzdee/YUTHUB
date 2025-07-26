import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import memoize from "memoizee";
import passport from "passport";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    // Use default Replit OIDC issuer if not specified
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    console.log(`🔧 Using OIDC issuer: ${issuerUrl}`);
    return await client.discovery(
      new URL(issuerUrl),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Always false for development, will be set to true in production SSL
      maxAge: sessionTtl,
      sameSite: 'lax', // Helps with CSRF protection
      domain: undefined, // Let browser handle domain automatically
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    primaryAuthMethod: "REPLIT",
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      console.log('🟢 Authentication verify called with claims:', claims);
      
      const user = {
        id: claims.sub,
        email: claims.email,
        firstName: claims.first_name,
        lastName: claims.last_name,
        profileImageUrl: claims.profile_image_url,
      };
      updateUserSession(user, tokens);
      await upsertUser(claims);
      
      console.log('🟢 User object prepared for session:', user);
      verified(null, user);
    } catch (error) {
      console.error('🔴 Authentication verification failed:', error);
      verified(error, null);
    }
  };

  // Register strategies for production and development domains
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add stable production domains
  const productionDomains = [
    'yuthub.replit.app',  // Primary Replit domain
    'yuthub.com',         // Custom domain
    'www.yuthub.com'      // Custom domain with www
  ];
  
  productionDomains.forEach(domain => {
    if (!domains.includes(domain)) {
      domains.push(domain);
    }
  });
  
  // Add localhost for development if not already present
  if (process.env.NODE_ENV === 'development' && !domains.includes('localhost')) {
    domains.push('localhost');
  }
  
  console.log('Registering authentication strategies for domains:', domains);
  
  for (const domain of domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: domain === 'localhost' ? `http://localhost:5000/api/callback` : `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: any, cb) => {
    console.log('🔍 SERIALIZING USER:', user);
    // Extract user ID from different possible structures
    const userId = user.id || user.claims?.sub || user.sub || user;
    console.log('🔍 SERIALIZED USER ID:', userId);
    cb(null, userId);
  });
  
  passport.deserializeUser(async (id: any, cb) => {
    console.log('🔍 DESERIALIZING USER ID:', id);
    try {
      // Handle cases where the serialized data might be complex
      const userId = typeof id === 'string' ? id : (id.claims?.sub || id.sub || id.id || id);
      console.log('🔍 EXTRACTED USER ID:', userId);
      
      const user = await storage.getUser(userId);
      console.log('🔍 DESERIALIZED USER:', user);
      cb(null, user);
    } catch (error) {
      console.log('❌ DESERIALIZE ERROR:', error);
      cb(error, null);
    }
  });

  app.get("/api/login", (req, res, next) => {
    // Use the correct domain for authentication
    let authDomain = req.hostname === 'localhost' ? 'localhost' : req.hostname;
    
    // Handle both yuthub.com and www.yuthub.com
    if (authDomain === 'yuthub.com' || authDomain === 'www.yuthub.com') {
      // Try both variants to find which one has a registered strategy
      const strategies = Object.keys(passport._strategies);
      if (strategies.includes('replitauth:www.yuthub.com')) {
        authDomain = 'www.yuthub.com';
      } else if (strategies.includes('replitauth:yuthub.com')) {
        authDomain = 'yuthub.com';
      }
    }
    
    console.log(`Attempting authentication with domain: ${authDomain}, available strategies:`, Object.keys(passport._strategies));
    
    // Check if strategy exists
    if (!passport._strategies[`replitauth:${authDomain}`]) {
      console.error(`No authentication strategy found for domain: ${authDomain}`);
      
      // For development, provide helpful error with instructions
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          error: `Authentication not configured for domain: ${authDomain}`,
          message: "This domain needs to be registered with the OAuth provider. Please add the callback URL to your OAuth configuration.",
          availableStrategies: Object.keys(passport._strategies),
          requiredRedirectURI: `https://${authDomain}/api/callback`,
          configurationHelp: "Run 'node scripts/configure-oauth.js' for setup instructions"
        });
      }
      
      return res.status(500).json({ error: `Authentication not configured for domain: ${authDomain}` });
    }
    
    passport.authenticate(`replitauth:${authDomain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Use the correct domain for authentication callback
    let authDomain = req.hostname === 'localhost' ? 'localhost' : req.hostname;
    
    // Handle both yuthub.com and www.yuthub.com
    if (authDomain === 'yuthub.com' || authDomain === 'www.yuthub.com') {
      // Try both variants to find which one has a registered strategy
      const strategies = Object.keys(passport._strategies);
      if (strategies.includes('replitauth:www.yuthub.com')) {
        authDomain = 'www.yuthub.com';
      } else if (strategies.includes('replitauth:yuthub.com')) {
        authDomain = 'yuthub.com';
      }
    }
    
    console.log(`🟡 Processing callback for domain: ${authDomain}`);
    
    passport.authenticate(`replitauth:${authDomain}`, (err, user, info) => {
      if (err) {
        console.error('🔴 Authentication error:', err);
        return res.redirect("/api/login");
      }
      
      if (!user) {
        console.error('🔴 No user returned from authentication');
        return res.redirect("/api/login");
      }
      
      console.log('🟢 Authentication successful, logging in user:', user);
      
      req.logIn(user, (err) => {
        if (err) {
          console.error('🔴 Login error:', err);
          return res.redirect("/api/login");
        }
        
        console.log('🔍 AUTH CALLBACK - req.user:', req.user);
        console.log('🔍 AUTH CALLBACK - req.isAuthenticated():', req.isAuthenticated());
        console.log('🔍 AUTH CALLBACK - session:', req.session);
        
        // CRITICAL: Force session save before redirect with timing fix
        req.session.save((err) => {
          if (err) {
            console.log('❌ Session save error:', err);
            return res.redirect("/api/login?error=session");
          }
          
          console.log('✅ Session saved successfully');
          console.log('🔄 Session ID:', req.sessionID);
          console.log('🔄 Cookie will be set to:', req.session.cookie);
          
          // Ensure cookie is properly set before redirect
          res.setHeader('Set-Cookie', `connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${req.session.cookie.maxAge}`);
          
          // Add small delay to ensure cookie is properly set in browser
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard after session save');
            res.redirect("/");
          }, 100);
        });
      });
    })(req, res, next);
  });

  // Test endpoint to verify session persistence fix
  app.get("/api/test-session", (req, res) => {
    console.log('🧪 Session test endpoint called');
    console.log('🧪 Session ID:', req.sessionID);
    console.log('🧪 Session data:', req.session);
    console.log('🧪 User authenticated:', req.isAuthenticated());
    console.log('🧪 User object:', req.user);
    
    res.json({
      sessionId: req.sessionID,
      authenticated: req.isAuthenticated(),
      user: req.user,
      sessionData: req.session
    });
  });

  // Development test login endpoint to verify session persistence fix
  app.get("/api/test-login", async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    console.log('🧪 Test login endpoint called');
    
    const testUser = {
      id: 'test-user-session-fix',
      email: 'sessiontest@example.com',
      firstName: 'Session',
      lastName: 'Test',
      profileImageUrl: 'https://example.com/test-avatar.jpg',
    };
    
    // Ensure test user exists in database
    try {
      await upsertUser({
        sub: testUser.id,
        email: testUser.email,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        profile_image_url: testUser.profileImageUrl,
      });
      console.log('✅ Test user created/updated in database');
    } catch (error) {
      console.error('❌ Failed to create test user:', error);
    }
    
    // Simulate the fixed authentication flow
    req.logIn(testUser, (err) => {
      if (err) {
        console.error('🔴 Test login error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      console.log('🧪 TEST LOGIN - req.user:', req.user);
      console.log('🧪 TEST LOGIN - req.isAuthenticated():', req.isAuthenticated());
      console.log('🧪 TEST LOGIN - session:', req.session);
      
      // Apply the exact same session save fix from the real callback
      req.session.save((err) => {
        if (err) {
          console.log('❌ Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }
        
        console.log('✅ Session saved successfully');
        console.log('🔄 Session ID:', req.sessionID);
        console.log('🔄 Cookie will be set to:', req.session.cookie);
        
        // Ensure cookie is properly set before redirect
        res.setHeader('Set-Cookie', `connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${req.session.cookie.maxAge}`);
        
        // Add small delay to ensure cookie is properly set in browser
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard after session save');
          res.redirect("/");
        }, 100);
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

// Mock authentication for development
export async function setupDevAuth(app: Express) {
  app.use((req: AuthenticatedRequest, res, next) => {
    // Add mock user for development
    req.user = {
      id: 'dev-user-1',
      claims: {
        sub: 'dev-user-1'
      },
      email: 'dev@yuthub.com',
      firstName: 'Development',
      lastName: 'User'
    };
    
    req.isAuthenticated = () => true;
    next();
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if user is authenticated via Passport
  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // If no expires_at, assume token is valid (fresh authentication)
  if (!user.expires_at) {
    return next();
  }

  const now = Math.floor(Date.now() / 1000);
  
  // Add buffer time (5 minutes) to prevent edge cases and allow for clock drift
  if (now < (user.expires_at - 300)) {
    return next();
  }

  // Token is close to expiry or expired, attempt refresh
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    // Clear the session if refresh token is missing
    req.logout((err) => {
      if (err) console.error('Logout error:', err);
    });
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear the session if refresh fails
    req.logout((err) => {
      if (err) console.error('Logout error:', err);
    });
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return isAuthenticated(req, res, next);
}
