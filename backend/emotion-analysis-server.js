const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyAjuJiT296hQ_yU_M7tlmiVQl3OxmJ2oRc"
);

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Emotion analysis endpoint
app.post("/api/analyze-emotion", async (req, res) => {
  try {
    const { text, userEmail } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Analyze emotion using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze the emotional content of the following text. 
    Provide a detailed analysis including:
    1. Primary emotion (anger, fear, sadness, joy, surprise, disgust, neutral)
    2. Emotional intensity (low, medium, high)
    3. Sentiment (positive, negative, neutral)
    4. Key emotional indicators
    5. Potential triggers or concerning content
    6. Risk assessment (low, medium, high)
    
    Text: "${text}"
    
    Respond in JSON format:
    {
      "primaryEmotion": "string",
      "emotionalIntensity": "string", 
      "sentiment": "string",
      "emotionalIndicators": ["array of indicators"],
      "potentialTriggers": ["array of triggers"],
      "riskAssessment": "string",
      "confidence": "number between 0-1",
      "analysis": "detailed explanation"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse the JSON response
    let emotionData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emotionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      emotionData = {
        primaryEmotion: "neutral",
        emotionalIntensity: "low",
        sentiment: "neutral",
        emotionalIndicators: [],
        potentialTriggers: [],
        riskAssessment: "low",
        confidence: 0.5,
        analysis: "Unable to analyze emotion due to parsing error",
      };
    }

    // Create report object with user linking
    const report = {
      timestamp: new Date().toISOString(),
      originalText: text,
      userEmail: userEmail || 'anonymous',
      emotionAnalysis: emotionData,
      metadata: {
        wordCount: text.split(" ").length,
        characterCount: text.length,
        processingTime: Date.now(),
      },
    };

    // Save to local JSON file using timestamp as identifier
    const fileName = `emotion_analysis_${Date.now()}.json`;
    const filePath = path.join(dataDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    // Return only success status, not the emotional data (privacy-focused)
    res.json({
      success: true,
      message: "Emotion analysis completed and stored securely",
      wordCount: report.metadata.wordCount,
    });
  } catch (error) {
    console.error("Error in emotion analysis:", error);
    res.status(500).json({
      error: "Failed to analyze emotion",
      message: error.message,
    });
  }
});

// Get all emotion reports for admin/HR (with proper authentication in production)
app.get("/api/emotion-reports", (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const allReports = files
      .filter((file) => file.startsWith("emotion_analysis_"))
      .map((file) => {
        const content = fs.readFileSync(path.join(dataDir, file), "utf8");
        return JSON.parse(content);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      reports: allReports,
      count: allReports.length,
    });
  } catch (error) {
    console.error("Error fetching emotion reports:", error);
    res.status(500).json({ error: "Failed to fetch emotion reports" });
  }
});

// Get emotion reports for a specific user (HR access)
app.get("/api/emotion-reports/user/:userEmail", (req, res) => {
  try {
    const { userEmail } = req.params;
    const files = fs.readdirSync(dataDir);
    const userReports = files
      .filter((file) => file.startsWith("emotion_analysis_"))
      .map((file) => {
        const content = fs.readFileSync(path.join(dataDir, file), "utf8");
        return JSON.parse(content);
      })
      .filter((report) => report.userEmail === userEmail)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      reports: userReports,
      count: userReports.length,
      userEmail: userEmail,
    });
  } catch (error) {
    console.error("Error fetching user emotion reports:", error);
    res.status(500).json({ error: "Failed to fetch user emotion reports" });
  }
});

// Get emotion analytics summary for HR dashboard
app.get("/api/emotion-analytics", (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const allReports = files
      .filter((file) => file.startsWith("emotion_analysis_"))
      .map((file) => {
        const content = fs.readFileSync(path.join(dataDir, file), "utf8");
        return JSON.parse(content);
      });

    // Calculate analytics
    const analytics = {
      totalReports: allReports.length,
      uniqueUsers: [...new Set(allReports.map(r => r.userEmail))].length,
      emotionBreakdown: {},
      riskLevels: { low: 0, medium: 0, high: 0 },
      recentReports: allReports
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
      averageConfidence: 0,
    };

    // Calculate emotion breakdown
    allReports.forEach(report => {
      const emotion = report.emotionAnalysis.primaryEmotion;
      analytics.emotionBreakdown[emotion] = (analytics.emotionBreakdown[emotion] || 0) + 1;
      
      const risk = report.emotionAnalysis.riskAssessment;
      if (analytics.riskLevels[risk] !== undefined) {
        analytics.riskLevels[risk]++;
      }
    });

    // Calculate average confidence
    const totalConfidence = allReports.reduce((sum, report) => sum + report.emotionAnalysis.confidence, 0);
    analytics.averageConfidence = allReports.length > 0 ? totalConfidence / allReports.length : 0;

    res.json({
      success: true,
      analytics: analytics,
    });
  } catch (error) {
    console.error("Error fetching emotion analytics:", error);
    res.status(500).json({ error: "Failed to fetch emotion analytics" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Emotion Analysis API",
  });
});

app.listen(PORT, () => {
  console.log(`Emotion Analysis Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
