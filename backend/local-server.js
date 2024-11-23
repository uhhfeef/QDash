import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { createServer } from 'http'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { readFileSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const app = new Hono()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
})

// In-memory user store (for development only)
const users = new Map()
users.set('demo', { username: 'demo', password: 'demo123' })

// In-memory session store (for development only)
const sessions = new Map()

// Cache HTML files
const loginHtml = readFileSync(join(process.cwd(), 'dist', 'login.html'), 'utf-8')
const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8')

// Middleware to parse JSON
app.use('*', async (c, next) => {
  if (c.req.header('Content-Type') === 'application/json') {
    try {
      const body = await c.req.json()
      c.set('body', body)
    } catch (e) {
      return c.json({ error: 'Invalid JSON' }, 400)
    }
  }
  await next()
})

// Middleware to check authentication for API routes
async function requireAuth(c, next) {
  if (c.req.path.startsWith('/api/') && !c.req.path.match(/^\/api\/(login|register)$/)) {
    const sessionId = getCookie(c, 'sessionId')
    if (!sessionId || !sessions.get(sessionId)) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  }
  await next()
}

app.use('*', requireAuth)

// API Routes
app.post('/api/chat', async (c) => {
  const body = c.get('body')
  if (!body || !body.messages) {
    return c.json({ error: 'Messages are required' }, 400)
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: body.messages,
      tools: body.tools || [],
      tool_choice: body.tool_choice || "auto"
    })

    return c.json({
      id: completion.id,
      choices: completion.choices,
      trace_id: completion.id // Using completion ID as trace ID
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return c.json({ 
      error: 'Failed to process chat request',
      details: error.message 
    }, 500)
  }
})

app.post('/api/login', async (c) => {
  const body = c.get('body')
  if (!body || !body.username || !body.password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  const user = users.get(body.username)
  if (!user || user.password !== body.password) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  // Create a session
  const sessionId = Math.random().toString(36).substring(2)
  sessions.set(sessionId, {
    username: user.username,
    createdAt: new Date()
  })

  // Set session cookie
  setCookie(c, 'sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return c.json({ success: true, username: user.username })
})

app.get('/api/validate-session', async (c) => {
  const sessionId = getCookie(c, 'sessionId')
  if (!sessionId) {
    return c.json({ valid: false }, 401)
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return c.json({ valid: false }, 401)
  }

  return c.json({ valid: true, username: session.username })
})

app.post('/api/logout', async (c) => {
  const sessionId = getCookie(c, 'sessionId')
  if (sessionId) {
    sessions.delete(sessionId)
    deleteCookie(c, 'sessionId', { path: '/' })
  }
  return c.json({ success: true })
})

app.post('/api/register', async (c) => {
  const body = c.get('body')
  if (!body || !body.username || !body.password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  if (users.has(body.username)) {
    return c.json({ error: 'Username already exists' }, 400)
  }

  users.set(body.username, {
    username: body.username,
    password: body.password // In a real app, you'd hash this
  })

  return c.json({ success: true })
})

// Serve static files from various directories
app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/js/*', serveStatic({ root: './dist' }))
app.use('/favicon.ico', serveStatic({ path: './dist/favicon.ico' }))

// Serve HTML files
app.get('/login', async (c) => {
  return c.html(loginHtml)
})

app.get('/', async (c) => {
  return c.html(indexHtml)
})

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = createServer()
      server.listen(port, () => {
        server.close()
        resolve(true)
      })
      server.on('error', () => resolve(false))
    })
  }

  let port = startPort
  while (!(await isPortAvailable(port))) {
    port = port + 1
  }
  return port
}

// Start the server
const startServer = async () => {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY environment variable is not set')
    console.error('Please set your OpenAI API key:')
    console.error('export OPENAI_API_KEY=your_api_key_here')
    process.exit(1)
  }

  const port = await findAvailablePort(3000)
  console.log(`Server is running on http://localhost:${port}`)
  console.log('Default credentials: username: demo, password: demo123')
  
  serve({
    fetch: app.fetch,
    port
  })
}

startServer()
