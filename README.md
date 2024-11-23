# QDash - The Fastest Private Dashboard Creator with AI

QDash is a lightning-fast, completely private dashboard creation platform that leverages AI for instant data visualization. Built with security-first architecture and optimized for speed, it allows you to create beautiful, interactive dashboards in seconds while keeping your data completely private and secure.

## Key Features

- ⚡️ Instant dashboard creation with AI assistance
- 🔒 Complete data privacy - all processing happens locally
- 🚀 Zero-latency data visualization
- 🎯 One-click chart generation
- 🛡️ End-to-end encryption
- 🎨 Real-time customization
- ⚙️ Local-first architecture

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional, for AI features)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/uhhfeef/qdash.git
cd qdash
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the local server:
```bash
npm run dev
```

Your private dashboard creator will be available at `http://localhost:8787`.

## Why QDash?

- **Privacy First**: Your data never leaves your machine. All processing happens locally.
- **Lightning Fast**: Create complex dashboards in seconds with AI assistance.
- **No Learning Curve**: Natural language commands to create and modify charts.
- **Complete Control**: Full customization capabilities with zero compromises.

## Usage Guide

### Creating Your First Dashboard

1. Navigate to `http://localhost:8787` after starting the server
2. Click "New Dashboard" in the top right
3. Choose a template or start from scratch

### Importing Data

QDash supports the following data formats:
- CSV

Simply drag and drop your files or use the import button in the dashboard interface.

### Using AI Features

Example commands that work well with QDash:
- "Create a bar chart showing sales by region"
- "Plot monthly revenue trends"
- "Generate a pie chart of customer demographics"
- "Compare this year's sales with last year"

### Basic Operations

1. **Adding Charts**:
   - Upload a CSV file with the CSV upload button
   - Type in natural language directly in the chatbox to create a chart

2. **Customizing Visualizations**:
   - Coming soon: Drag and drop to move, resize, and rotate charts
   - Coming soon: Edit and customize chart properties

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Add the following environment variables to your `.env` file:
```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for analytics
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_HOST=your_langfuse_host

# Security
SESSION_SECRET=your_session_secret  # Used for cookie encryption
```

3. Make sure the environment variables are loaded:
   - For local development, the variables will be automatically loaded from `.env`
   - For production, set these variables in your deployment environment

## Helper Commands

Here are some useful commands for development:

```bash
# Start local development server (with hot reload)
npm run dev:local

# Start local server (production build)
npm run local

# Build the project
npm run build

```

## Troubleshooting

### Common Issues

1. **OpenAI API Issues**
   - Error: "Failed to process chat request"
   - Solution: Check your OpenAI API key in `.env`
   - Make sure you have sufficient API credits

2. **Session/Login Issues**
   - Error: "Unauthorized" or "Invalid session"
   - Solution: Clear browser cookies and try logging in again
   - Default credentials: username: `demo`, password: `demo123`

3. **Port Already in Use**
   - The server will automatically find an available port
   - Default port is 3000, will increment if busy

4. **Missing Dependencies**
   ```bash
   # Reinstall dependencies
   npm install

   # If you have issues with specific packages
   npm install dotenv openai @hono/node-server
   ```

### Development Tips

1. **Checking Logs**
   - Open browser DevTools (F12)
   - Check Console for error messages
   - Server logs will appear in your terminal

2. **Testing the API**
   - Use the built-in chat interface
   - All API endpoints require authentication except:
     - `/api/login`
     - `/api/register`

3. **File Locations**
   - Built files are in `dist/`
   - Source files are in `src/`
   - Static assets should go in `public/`

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Submit a pull request


### Upgrading

To upgrade to the latest version:

```bash
git pull origin main
npm install
npm run build
```

## Project Structure

```
qdash/
├── config/           # Configuration files
├── db/              # Database related files
├── docs/            # Documentation
├── public/          # Static assets
├── src/             # Source code
│   ├── styles/      # CSS files
│   └── js/          # JavaScript files
├── server.js        # Main server file
└── webpack.config.js # Webpack configuration
```

## Development

### Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create optimized production build
- `npm run build:css` - Build Tailwind CSS
- `npm start` - Launch production server

### Environment Setup

Create a `.env` file with your configuration:

```env
OPENAI_API_KEY=your_openai_api_key (optional)
```

## Deployment Options

### Local Development (Recommended)
This is the standard way to run QDash. No Cloudflare account required.

1. Build the application:
```bash
npm run build
```

2. Start the local server:
```bash
npm run local
```

Your dashboard will be available at `http://localhost:3000`

### Cloudflare Workers Deployment (Restricted)
⚠️ **Note: This deployment method is restricted to authorized users only.**

Deployment to Cloudflare Workers requires:
- Access to the authorized Cloudflare account
- Access to the project's D1 database (`qdash-users`)
- Access to the project's KV namespace (`SESSION_STORE`)
- Valid Cloudflare API tokens and secrets

If you are an authorized deployer, you will need:
1. The required Cloudflare credentials
2. Access to the project's Cloudflare resources
3. Contact the project maintainers for deployment access

For security reasons, the Cloudflare deployment process is restricted. Please use the local development setup for personal use.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Hono.js](https://honojs.dev/)
- UI components from [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Plotly.js](https://plotly.com/javascript/)
