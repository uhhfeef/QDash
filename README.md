# QDash

An AI-powered dashboard for data visualization and analysis.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

3. Start the server:
```bash
npm run local
```

4. Open `http://localhost:3000` in your browser

## Features

- 📊 AI-powered chart generation
- 💬 Natural language queries
- 📈 Interactive data visualization
- 📁 CSV file support
- 🤖 OpenAI integration

## Usage Guide

### Creating Your First Dashboard

1. Navigate to `http://localhost:3000`
2. Click the "Upload CSV" button and select a CSV file
3. Start querying in natural language to create your first dashboard

### Using AI Features

QDash understands natural language commands. Try these examples:
- "Create a bar chart showing sales by region"
- "Show me a line graph of monthly revenue"
- "Generate a pie chart of customer demographics"
- "Plot the trend of website traffic over time"

### Tips for Best Results

1. **Data Preparation**:
   - Ensure your CSV files have clear column headers
   - Clean your data before uploading
   - Remove any unnecessary columns

2. **Query Tips**:
   - Be specific about the chart type you want
   - Mention the columns or metrics you're interested in
   - Specify any filters or time ranges

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key

### Environment Variables

Create a `.env` file with:
```env
OPENAI_API_KEY=your_openai_api_key
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev:local
```

3. Build for production:
```bash
npm run build
```

## Deployment Options

### Local Deployment (Recommended)
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

## Troubleshooting

### Common Issues

1. **OpenAI API Issues**
   - Check your API key in `.env`
   - Verify API credits/quota

2. **Server Issues**
   - Ensure port 3000 is available
   - Check Node.js version (18+)

3. **Data Issues**
   - Verify CSV format
   - Check file encoding (UTF-8)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for details.
