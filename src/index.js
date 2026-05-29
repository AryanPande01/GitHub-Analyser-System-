require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { testConnection } = require("./config/db");
const { initRedis } = require("./config/redis");
const { createTable } = require("./models/profile.model");
const { createAnalysisTables } = require("./models/analysis.model");
const profileRoutes = require("./routes/profile.routes");
const analysisRoutes = require("./routes/analysis.routes");
const compareRoutes = require("./routes/compare.routes");
const chatRoutes = require("./routes/chat.routes");
const resumeRoutes = require("./routes/resume.routes");
const recruiterRoutes = require("./routes/recruiter.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
  })
);

app.get("/", (req, res) => {
  res.json({
    service: "AI-Powered GitHub Career Analyzer API",
    version: "2.0.0",
    endpoints: {
      profiles: {
        analyze: "POST   /api/profiles/analyze/:username",
        list: "GET    /api/profiles",
        getOne: "GET    /api/profiles/:username",
        delete: "DELETE /api/profiles/:username",
        fullAnalysis: "GET    /api/analysis/:username/full",
        skills: "GET    /api/analysis/:username/skills",
        repositories: "GET    /api/analysis/:username/repositories",
        readiness: "GET    /api/analysis/:username/readiness",
        insights: "GET    /api/analysis/:username/insights",
        roadmap: "GET    /api/analysis/:username/roadmap",
        activity: "GET    /api/analysis/:username/activity",
      },
      compare: "POST   /api/compare",
      chat: "POST   /api/chat",
      resume: "GET    /api/resume/:username",
      recruiter: {
        list: "GET    /api/recruiter",
        detail: "GET    /api/recruiter/:username",
      },
    },
  });
});

app.use("/api/profiles", profileRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/recruiter", recruiterRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Something went wrong.", error: err.message });
});

async function bootstrap() {
  await testConnection();
  await createTable();
  await createAnalysisTables();
  await initRedis();

  app.listen(PORT, () => {
    console.log(`🚀 GitHub Career Analyzer API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  });
}

bootstrap();
