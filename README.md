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

## Deployment

The application is designed to be deployed on Cloudflare Workers. To deploy:

1. Build the application:
```bash
npm run build
```

2. Deploy to Cloudflare Workers:
```bash
wrangler publish
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Hono.js](https://honojs.dev/)
- UI components from [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Plotly.js](https://plotly.com/javascript/)
