import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { getAuthConfig } from '../config/auth.js';

const auth = new Hono();

// Create a UUID function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get base URL
function getBaseUrl(c) {
  const host = c.req.header('host') || 'localhost:8787';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Google Auth Route
auth.get('/auth/google', async (c) => {
  const config = getAuthConfig(c.env).google;
  const baseUrl = getBaseUrl(c);
  const redirectUri = `${baseUrl}${config.callbackURL}`;
  
  console.log('Starting Google OAuth flow with:', {
    clientId: config.clientID,
    redirectUri
  });
  
  const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', config.clientID);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('access_type', 'offline');
  
  return c.redirect(authUrl.toString());
});

// Google Auth Callback
auth.get('/auth/google/callback', async (c) => {
  try {
    const code = c.req.query('code');
    if (!code) {
      throw new Error('No code provided');
    }

    const config = getAuthConfig(c.env).google;
    const baseUrl = getBaseUrl(c);
    const redirectUri = `${baseUrl}${config.callbackURL}`;
    
    console.log('Exchanging code for tokens with:', {
      clientId: config.clientID,
      redirectUri
    });

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientID,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens);
      throw new Error('Failed to get tokens');
    }

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // Create user object
    const user = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      provider: 'google'
    };

    // Create session
    const sessionId = generateUUID();
    await c.env.SESSION_STORE.put(sessionId, JSON.stringify({
      userId: user.id,
      email: user.email,
      provider: 'google'
    }));

    // Set session cookie
    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return c.redirect('/');
  } catch (error) {
    console.error('Google auth callback error:', error);
    return c.redirect('/login?error=auth_failed');
  }
});

export default auth;
