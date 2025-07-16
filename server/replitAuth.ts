import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
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
      secure: process.env.NODE_ENV === 'production', // Only require HTTPS in production
      maxAge: sessionTtl,
      sameSite: 'lax', // Helps with CSRF protection
      domain: process.env.NODE_ENV === 'production' ? '.yuthub.com' : undefined, // Allow cookies for all yuthub.com subdomains in production
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

  // Register strategies for both production and development
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add production domains for yuthub.com
  if (!domains.includes('www.yuthub.com')) {
    domains.push('www.yuthub.com');
  }
  if (!domains.includes('yuthub.com')) {
    domains.push('yuthub.com');
  }
  
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
    cb(null, user.id || user);
  });
  
  passport.deserializeUser(async (id: any, cb) => {
    console.log('🔍 DESERIALIZING USER ID:', id);
    try {
      const user = await storage.getUser(id);
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
        
        // Force session save
        req.session.save((err) => {
          if (err) {
            console.log('❌ Session save error:', err);
            return res.redirect("/api/login");
          } else {
            console.log('✅ Session saved successfully');
          }
          res.redirect("/");
        });
      });
    })(req, res, next);
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
