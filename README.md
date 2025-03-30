# Email Research Bot

A Node.js application that scans Gmail accounts, extracts meaningful information from emails, and stores the data in Supabase for analysis.

## Features

- Gmail API integration for email scanning
- Secure OAuth 2.0 authentication
- Supabase integration for data storage
- TypeScript for type safety
- Comprehensive testing suite
- Modern development workflow

## Prerequisites

- Node.js (v18.x or v20.x)
- npm
- Gmail API credentials
- Supabase account and project

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd email-research-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Set up your Gmail API credentials:
   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Add the credentials to your `.env` file

5. Set up your Supabase project:
   - Create a new project in [Supabase](https://supabase.com)
   - Get your project URL and anon key
   - Add the credentials to your `.env` file

## Development

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

## Project Structure

```
email-research-bot/
├── src/
│   ├── auth/           # Authentication handling
│   ├── email/          # Email processing
│   ├── database/       # Supabase integration
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── config/         # Configuration
├── tests/              # Test files
└── scripts/            # Build scripts
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC

## Security

This project follows security best practices:
- Environment variables for sensitive data
- OAuth 2.0 for authentication
- Rate limiting
- Input validation
- Secure token storage 