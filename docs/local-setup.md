# Local Development Setup

## Environment Configuration

To run the application locally with chat functionality, you need to set up environment variables for OpenAI authentication. Follow these steps:

1. Create a `.dev.vars` file in the root directory of the project
2. Add your OpenAI API key to the file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Running the Development Server

Once you have configured your environment variables:

1. Start the local development server using Wrangler:
   ```bash
   wrangler dev --local
   ```

2. The application should now be running locally with full chat functionality enabled.

## Notes

- The `.dev.vars` file is used by Wrangler to inject environment variables during local development
- Make sure `.dev.vars` is included in your `.gitignore` to prevent committing sensitive API keys
- This configuration is specific to local development and testing. For production deployment, you'll need to configure environment variables differently
