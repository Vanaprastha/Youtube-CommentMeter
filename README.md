# TubeFeel - YouTube Sentiment Analysis

A production-ready Next.js 15 application that analyzes YouTube video comments for sentiment using AI. Built for Vercel Hobby tier with serverless architecture.

## Features

- 🎯 **YouTube Comment Analysis**: Fetch and analyze up to 300 top-level comments
- 🤖 **AI-Powered Sentiment**: Uses Hugging Face's multilingual sentiment model
- 📊 **Rich Visualizations**: Charts, KPIs, and keyword clouds
- ⚡ **Smart Caching**: 30-minute cache with Upstash Redis (Vercel KV)
- 📱 **Mobile-First**: Responsive design with Tailwind CSS + shadcn/ui
- 📈 **Export Data**: CSV export with sentiment scores
- 🔒 **Type Safe**: Full TypeScript with Zod validation
- 🛡️ **Rate Limited**: 5 requests per minute per IP
- ⚡ **Performance**: Exponential backoff, batching, timeouts

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Caching**: Upstash Redis (Vercel KV)
- **APIs**: YouTube Data API v3, Hugging Face Inference API
- **Validation**: Zod
- **Testing**: Jest
- **Deployment**: Vercel

## Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   API Routes     │───▶│  External APIs  │
│                 │    │                  │    │                 │
│ • URL Input     │    │ • /api/comments  │    │ • YouTube v3    │
│ • Results View  │    │ • /api/sentiment │    │ • Hugging Face  │
│ • CSV Export    │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Upstash Redis   │
                       │                  │
                       │ • Comments Cache │
                       │ • Sentiment Cache│
                       │ • Rate Limiting  │
                       └──────────────────┘
\`\`\`

## Setup

### 1. Environment Variables

Create a `.env.local` file with:

\`\`\`env
# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key

# Hugging Face Inference API
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Upstash Redis (Vercel KV)
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
\`\`\`

### 2. Get API Keys

**YouTube Data API v3:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API v3

**Hugging Face:**
1. Sign up at [Hugging Face](https://huggingface.co/)
2. Go to Settings → Access Tokens
3. Create a new token with "Read" permissions

**Upstash Redis (Vercel KV):**
1. Connect Vercel KV integration in your Vercel dashboard
2. Environment variables will be automatically added

### 3. Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd tube-feel

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### 4. Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Enable Upstash Redis integration
\`\`\`

## API Documentation

### GET `/api/comments?videoId=VIDEO_ID`

Fetches YouTube comments with caching.

**Query Parameters:**
- `videoId`: YouTube video ID (11 characters, alphanumeric + `-_`)

**Response:**
\`\`\`json
{
  "videoId": "dQw4w9WgXcQ",
  "total": 150,
  "comments": [
    {
      "id": "comment_id",
      "textOriginal": "Great video!",
      "authorDisplayName": "User Name",
      "likeCount": 5,
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

**Caching:** 30 minutes with key `comments:{videoId}`

**Rate Limit:** 5 requests per minute per IP

### POST `/api/sentiment`

Analyzes sentiment of comments.

**Request Body:**
\`\`\`json
{
  "videoId": "dQw4w9WgXcQ",
  "comments": [
    {
      "id": "comment_id",
      "text": "Great video!",
      "publishedAt": "2024-01-01T00:00:00Z",
      "likeCount": 5
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "videoId": "dQw4w9WgXcQ",
  "totals": {
    "positive": 60,
    "neutral": 30,
    "negative": 10,
    "percentPositive": 60.0,
    "percentNeutral": 30.0,
    "percentNegative": 10.0,
    "avgScore": 0.45,
    "weightedAvgScore": 0.52
  },
  "keywords": ["great", "amazing", "love", "awesome"],
  "items": [
    {
      "id": "comment_id",
      "label": "positive",
      "score": 0.95,
      "likeCount": 5,
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

**Caching:** 30 minutes with key `sent:{videoId}:{hash}`

**Rate Limit:** 5 requests per minute per IP

## Performance & Quotas

### YouTube API Quotas
- **Default Quota**: 10,000 units/day
- **Comments Request**: 1 unit per request
- **Max Comments**: 300 per video (configurable)
- **Pagination**: 100 comments per page

### Hugging Face Limits
- **Free Tier**: 30,000 characters/month
- **Batch Size**: 50 comments per request
- **Timeout**: 15 seconds per batch
- **Retry Logic**: 3 attempts with exponential backoff

### Caching Strategy
- **TTL**: 30 minutes (1800 seconds)
- **Comments**: Cached by video ID
- **Sentiment**: Cached by video ID + comment hash
- **Rate Limits**: 60-second sliding window

### Error Handling
- **YouTube 403**: Comments disabled or private video
- **YouTube 404**: Video not found
- **HF 503**: Model loading (retry after 2s)
- **429/5xx**: Exponential backoff (max 3 retries)
- **Timeouts**: 15s per request with abort controller

## Development

\`\`\`bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Production
npm run start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details
## Usage

1. **Home Page** (`/`): Enter a YouTube video URL
2. **Analysis Page** (`/analyze/[videoId]`): View detailed sentiment analysis

### Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- Direct video ID: `VIDEO_ID`

## API Routes

### GET `/api/comments?videoId=VIDEO_ID`

Fetches YouTube comments with caching.

**Response:**
\`\`\`json
[
  {
    "id": "comment_id",
    "textOriginal": "Great video!",
    "authorDisplayName": "User Name",
    "likeCount": 5,
    "publishedAt": "2024-01-01T00:00:00Z"
  }
]
\`\`\`

### POST `/api/sentiment`

Analyzes sentiment of comments.

**Request:**
\`\`\`json
{
  "videoId": "VIDEO_ID",
  "comments": [
    {
      "id": "comment_id",
      "text": "Great video!",
      "publishedAt": "2024-01-01T00:00:00Z",
      "likeCount": 5
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "results": [
    {
      "commentId": "comment_id",
      "label": "positive",
      "score": 0.95,
      "confidence": 0.98
    }
  ],
  "summary": {
    "total": 100,
    "positive": 60,
    "neutral": 30,
    "negative": 10,
    "positivePercent": 60.0,
    "neutralPercent": 30.0,
    "negativePercent": 10.0,
    "averageScore": 0.45
  }
}
\`\`\`

## Architecture

### Caching Strategy

- **Comments**: Cached for 30 minutes with key `comments:{videoId}`
- **Sentiment**: Cached for 30 minutes with key `sent:{videoId}:{hash}`
- **Hash**: MD5 of sorted comment IDs for cache invalidation

### Rate Limiting

- **YouTube API**: 100 comments per request, exponential backoff on 429
- **Hugging Face**: 50 comments per batch, 1-second delay between batches
- **Timeout**: 15-second timeout per API request

### Error Handling

- Zod validation on all API inputs
- Graceful fallbacks for API failures
- User-friendly error messages
- Defensive programming practices

## Performance

- **Serverless**: No long-running processes
- **Client-First**: Heavy lifting on client-side
- **Chunked Processing**: Batch sentiment analysis
- **Smart Caching**: Reduces API quota usage
- **Optimized Queries**: Minimal data fetching

## Development

\`\`\`bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Production
npm run start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details
\`\`\`bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
npm run test:watch

# Build
npm run build

# Production
npm run start
\`\`\`

## Testing

Unit tests are included for critical utilities:

\`\`\`bash
# Run all tests
npm test

# Run specific test file
npm test youtube-utils.test.ts

# Watch mode
npm run test:watch
\`\`\`

Test coverage includes:
- YouTube URL parsing (8 test cases)
- Sentiment label mapping (various formats)
- CSV generation and escaping
- Rate limiting logic

## Supported YouTube URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/watch?feature=player_embedded&v=VIDEO_ID`
- Direct video ID: `VIDEO_ID`

## CSV Export Format

\`\`\`csv
id,text,likeCount,publishedAt,sentimentLabel,sentimentScore
comment_id,"Great video!",5,2024-01-01T00:00:00Z,positive,0.950
\`\`\`

Features:
- Proper CSV escaping for quotes and commas
- UTF-8 encoding
- Filename includes video ID and date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run type-check` and `npm test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details
