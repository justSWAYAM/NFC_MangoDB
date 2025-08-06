# Speech-to-Text Emotion Analysis System

A modular Node.js backend that provides real-time emotion analysis for speech-to-text data using Google Gemini AI. This system is designed to work with the NFC MangoDB complaint filing system to analyze emotional content during complaint submissions.

## Features

- **Real-time Emotion Analysis**: Analyzes emotional content using Google Gemini AI
- **Privacy-focused**: Emotional reports are stored securely and not shown to users
- **User-specific Tracking**: Maintains separate logs for each user
- **Local JSON Storage**: Saves emotional reports with metadata locally
- **RESTful API**: Clean API endpoints for integration
- **Health Monitoring**: Built-in health check endpoints

## API Endpoints

### POST `/api/analyze-emotion`
Analyzes the emotional content of provided text.

**Request Body:**
```json
{
  "text": "The text to analyze"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emotion analysis completed and stored securely",
  "wordCount": 25
}
```

### GET `/api/emotion-reports`
Retrieves all emotion analysis reports (admin/HR access).

**Response:**
```json
{
  "success": true,
  "reports": [...],
  "count": 5
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Emotion Analysis API"
}
```

## Setup

### Prerequisites
- Node.js 16+ 
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
   PORT=3001
   NODE_ENV=production
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Docker Setup

1. **Build the image**
   ```bash
   docker build -t emotion-analysis-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3001:3001 -e GOOGLE_GEMINI_API_KEY=your-key emotion-analysis-backend
   ```

## Data Storage

Emotional analysis reports are stored in JSON format in the `data/` directory with the following structure:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "originalText": "Original text",
  "emotionAnalysis": {
    "primaryEmotion": "anger",
    "emotionalIntensity": "high",
    "sentiment": "negative",
    "emotionalIndicators": ["angry words", "exclamation marks"],
    "potentialTriggers": ["specific terms"],
    "riskAssessment": "high",
    "confidence": 0.85,
    "analysis": "Detailed analysis..."
  },
  "metadata": {
    "wordCount": 25,
    "characterCount": 150,
    "processingTime": 1703123456789
  }
}
```

## Security & Privacy

- **No User Access**: Emotional analysis data is never returned to users
- **Secure Storage**: Data is stored locally with proper file permissions
- **Session Tracking**: Each analysis session is tracked separately
- **Admin Access Only**: Emotional reports are only accessible to authorized personnel

## Integration with Frontend

The frontend React component (`SpeechEmotionAnalyzer.jsx`) integrates with this backend to provide:

- Real-time speech-to-text conversion
- Automatic emotion analysis
- Privacy-focused user experience
- Seamless integration with complaint filing

## Error Handling

The system includes comprehensive error handling for:
- Invalid API requests
- Google Gemini AI service errors
- File system errors
- Network connectivity issues

## Monitoring

- Health check endpoint for monitoring
- Detailed logging for debugging
- Error tracking and reporting
- Performance metrics

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the NFC MangoDB development team. 