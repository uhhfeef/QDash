import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { OpenAI } from 'openai'
import { observeOpenAI, Langfuse  } from "langfuse";
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'

const app = new Hono()

// List of public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/api/login',
  '/api/register',
  '/assets/styles/output.css',
  '/assets/js/main.bundle.js',
  '/assets/js/vendors.chunk.js',
  '/assets/js/common.chunk.js',
  '/js/auth.js',
  '/favicon.ico'
]

// Middleware to log requests
app.use('*', async (c, next) => {
  console.log('\n[DEBUG] ==========================================')
  console.log(`[DEBUG] NEW REQUEST - ${Date.now()}`)
  console.log(`[DEBUG] URL: ${c.req.url}`)
  console.log(`[DEBUG] Method: ${c.req.method}`)
  console.log(`[DEBUG] Path: ${new URL(c.req.url).pathname}`)
  console.log(`[DEBUG] Origin:`, c.req.header('Origin'))
  console.log(`[DEBUG] Cookie:`, c.req.header('Cookie'))
  
  const response = await next()
  
  // Log response details
  if (response instanceof Response) {
    console.log(`[DEBUG] Response Status: ${response.status}`)
    console.log(`[DEBUG] Response Headers:`, Object.fromEntries(response.headers))
  }
  
  console.log('[DEBUG] Request Complete')
  console.log('[DEBUG] ========================================')
  return response
})

// CORS middleware with specific origin
app.use('*', cors({
  origin: ['https://qdash.afeefkhan99.workers.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
  maxAge: 86400
}))

// Security headers configuration
const DEFAULT_SECURITY_HEADERS = {
  "X-XSS-Protection": "0",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": [
    "default-src 'self' https://*.workers.dev",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.workers.dev cdn.jsdelivr.net cdn.plot.ly",
    "style-src 'self' 'unsafe-inline' https://*.workers.dev cdn.jsdelivr.net",
    "img-src 'self' data: blob: https://*.workers.dev",
    "font-src 'self' data: https://*.workers.dev",
    "connect-src 'self' https://*.workers.dev https://cloud.langfuse.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
}

// Security headers middleware
app.use('*', async (c, next) => {
  const response = await next()
  if (response instanceof Response) {
    const newHeaders = new Headers(response.headers)
    Object.entries(DEFAULT_SECURITY_HEADERS).forEach(([key, value]) => {
      newHeaders.set(key, value)
    })
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  }
  return response
})

// Root route handler - just serve index.html
app.get('/', async (c) => {
  console.log('[DEBUG] Root route accessed');
  try {
    const asset = await c.env.ASSETS.fetch(new Request('index.html'));
    if (!asset.ok) {
      console.error('[DEBUG] Failed to load index.html:', asset.status);
      return c.text('Failed to load main page', 500);
    }
    const html = await asset.text();
    return c.html(html);
  } catch (error) {
    console.error('[DEBUG] Error serving main page:', error);
    return c.text('Internal Server Error', 500);
  }
})

// Login page route
app.get('/login', async (c) => {
  try {
    const asset = await c.env.ASSETS.fetch(new Request('/login.html'))
    return asset.ok ? c.html(await asset.text()) : c.text('Failed to load login page', 500)
  } catch (error) {
    console.error('[DEBUG] Error serving login page:', error)
    return c.text('Internal Server Error', 500)
  }
})

// API routes
app.post('/api/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json()
    console.log('[DEBUG] Registration attempt for user:', username)

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first()

    if (existingUser) {
      return c.json({ error: 'Username already exists' }, 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user with auto-incrementing id
    const result = await c.env.DB.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    ).bind(username, email, hashedPassword).run()

    if (!result.success) {
      throw new Error('Failed to create user')
    }

    return c.json({ message: 'Registration successful' })
  } catch (error) {
    console.error('[DEBUG] Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.post('/api/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    console.log('[DEBUG] Login attempt for user:', username)

    // Get user by username
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first()

    if (!user) {
      console.log('[DEBUG] User not found:', username);
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      console.log('[DEBUG] Invalid password for user:', username);
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Generate session
    const sessionId = randomUUID()
    console.log('[DEBUG] Generated session ID:', sessionId);
    
    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email
    };
    console.log('[DEBUG] Session data:', sessionData);
    
    try {
      await c.env.SESSION_STORE.put(sessionId, JSON.stringify(sessionData), { 
        expirationTtl: 86400 // 24 hours
      });
      console.log('[DEBUG] Session stored in KV');
    } catch (error) {
      console.error('[DEBUG] Error storing session:', error);
      return c.json({ error: 'Internal Server Error - Session Storage Failed' }, 500);
    }

    // Set cookie with strict options
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',  // Changed to Strict since we're same-origin
      path: '/'
    };

    setCookie(c, 'session', sessionId, cookieOptions);
    
    // Set response headers
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Origin', 'https://qdash.afeefkhan99.workers.dev');
    
    // Create response with headers
    const response = c.json({ 
      success: true,
      username: user.username
    });

    // Log final state
    console.log('[DEBUG] Cookie options:', cookieOptions);
    console.log('[DEBUG] Final response headers:', Object.fromEntries(c.res.headers.entries()));
    
    return response;
  } catch (error) {
    console.error('[DEBUG] Login error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.post('/api/logout', async (c) => {
  try {
    const sessionId = getCookie(c, 'session')
    if (sessionId) {
      await c.env.SESSION_STORE.delete(sessionId)
      deleteCookie(c, 'session')
    }
    return c.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('[DEBUG] Logout error:', error)
    return c.json({ error: 'Logout failed' }, 500)
  }
})

// Session validation endpoint
app.get('/api/validate-session', async (c) => {
  try {
    const sessionId = getCookie(c, 'session');
    console.log('[DEBUG] Validating session ID:', sessionId);

    if (!sessionId) {
      console.log('[DEBUG] No session cookie found');
      return c.json({ valid: false }, 401);
    }

    const sessionData = await c.env.SESSION_STORE.get(sessionId);
    console.log('[DEBUG] Session data from KV:', sessionData);

    if (!sessionData) {
      console.log('[DEBUG] No session data found in KV');
      return c.json({ valid: false }, 401);
    }

    const { username } = JSON.parse(sessionData);
    console.log('[DEBUG] Session validated for user:', username);

    return c.json({ 
      valid: true,
      username 
    });
  } catch (error) {
    console.error('[DEBUG] Session validation error:', error);
    return c.json({ valid: false, error: 'Session validation failed' }, 500);
  }
});

// Auth status endpoint commented out for now
/*
app.get('/api/auth-status', async (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) {
    return c.json({ authenticated: false })
  }
  return c.json({ authenticated: true })
})
*/

// Langfuse configuration endpoint
app.get('/api/config/langfuse', async (c) => {
  return c.json({
    publicKey: c.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: "https://cloud.langfuse.com"
  });
});

// Chat endpoint
app.post('/api/chat', async (c) => {
  try {
    const { messages, tools, tool_choice } = await c.req.json()
    
    // Get session ID from cookie
    const sessionId = getCookie(c, 'session');

    // Retrieve session data from KV store
    const sessionDataStr = await c.env.SESSION_STORE.get(sessionId);

    const sessionData = JSON.parse(sessionDataStr);
    console.log('[DEBUG] Retrieved session data:', sessionData);

    const langfuseopenai = observeOpenAI(new OpenAI({ 
      apiKey: c.env.OPENAI_API_KEY 
    }), {
      clientInitParams: {
        publicKey: c.env.LANGFUSE_PUBLIC_KEY,
        secretKey: c.env.LANGFUSE_SECRET_KEY,
        baseUrl: "https://cloud.langfuse.com",
      },
      userId: String(sessionData.userId), // Convert to string
      metadata: {
        username: sessionData.username,
        email: sessionData.email
      }
    });
    
    const completion = await langfuseopenai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice
    });
    
    await langfuseopenai.flushAsync();

    // Add trace_id to the response
    const response = {
      ...completion,
      trace_id: completion.id // Langfuse uses OpenAI completion ID as trace ID
    };

    // Return the response with trace_id
    return c.json(response)
  } catch (error) {
    console.error('[DEBUG] Chat error:', error)
    console.error('[DEBUG] Full error object:', JSON.stringify(error, null, 2))
    return c.json({ error: error.message }, 500)
  }
})

// Static asset handler - MUST be last
app.get('/*', async (c) => {
  const path = new URL(c.req.url).pathname
  
  // Skip API routes
  if (path.startsWith('/api/')) {
    console.log('[DEBUG] Skipping API route in static handler:', path)
    return c.notFound()
  }
  
  console.log('[DEBUG] Static asset request for:', path)

  try {
    if (!c.env.ASSETS) {
      console.error('[DEBUG] ASSETS binding is not defined')
      return c.text('Server configuration error', 500)
    }

    const asset = await c.env.ASSETS.fetch(c.req.raw)
    if (!asset.ok) {
      console.error('[DEBUG] Failed to fetch asset:', path, asset.status)
      return c.notFound()
    }

    console.log('[DEBUG] Successfully serving asset:', path)
    return asset
  } catch (error) {
    console.error('[DEBUG] Error serving static asset:', path, '\n', error.message)
    return c.notFound()
  }
})

// Local session store for development
const localSessionStore = new Map()

// Initialize database tables
async function initDatabase(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    console.log('[DEBUG] Database initialized successfully')
  } catch (error) {
    console.error('[DEBUG] Database initialization error:', error)
  }
}

export default app
