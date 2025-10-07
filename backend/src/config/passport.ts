import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OIDCStrategy } from 'passport-azure-ad';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Helper function to find or create user with OAuth identity
async function upsertUserIdentity(
  provider: string,
  providerId: string,
  email?: string,
  name?: string
) {
  return prisma.$transaction(async (tx) => {
    // Check if identity exists
    const existing = await tx.userIdentity.findFirst({
      where: { provider, providerId },
      include: { user: true }
    });

    if (existing) {
      return existing.user;
    }

    // Check if user exists by email
    let user = email ? await tx.user.findFirst({ where: { email } }) : null;

    if (!user) {
      // Create new user
      user = await tx.user.create({
        data: {
          email: email || `${providerId}@oauth.local`,
          name: name || 'User',
          passwordHash: '', // OAuth users don't need password
          emailVerified: true
        }
      });
    }

    // Create identity link
    await tx.userIdentity.create({
      data: {
        userId: user.id,
        provider,
        providerId
      }
    });

    return user;
  });
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.APP_BASE_URL || 'http://localhost:3001'}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertUserIdentity(
            'google',
            profile.id,
            profile.emails?.[0]?.value,
            profile.displayName
          );
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

// Azure AD Strategy
if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_TENANT_ID) {
  passport.use(
    new OIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientID: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        responseType: 'code',
        responseMode: 'form_post',
        redirectUrl: `${process.env.APP_BASE_URL || 'http://localhost:3001'}/auth/azure/callback`,
        allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
        passReqToCallback: false,
        scope: ['openid', 'profile', 'email']
      },
      async (iss: string, sub: string, profile: any, accessToken: string, refreshToken: string, done: any) => {
        try {
          const email = profile._json?.preferred_username || profile._json?.email;
          const providerId = profile.oid || profile.sub;
          
          const user = await upsertUserIdentity(
            'azure',
            providerId,
            email,
            profile.displayName
          );
          
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default passport;
