# GitHub Career Analyzer

An AI-powered GitHub intelligence platform that analyzes developer profiles, evaluates technical readiness, generates career insights, compares candidates, and provides personalized learning roadmaps.

The platform combines GitHub repository analytics, skill detection, career readiness scoring, recruiter-focused insights, and Gemini-powered AI recommendations into a single professional dashboard.

---

## Live Demo

Frontend:
[Frontend Deployment URL Here]

Backend API:
https://github-profile-analyzer-api-ggym.onrender.com

GitHub Repository:
https://github.com/AryanPande01/github-profile-analyzer-api

---

## Features

### GitHub Profile Analysis

Analyze any public GitHub profile and extract:

* Public repositories
* Followers and following
* Public gists
* Stars, forks, and watchers
* Account age
* Repository activity
* Profile metadata

---

### Skill Detection Engine

Automatically detects technologies and skills from repositories.

Supported categories:

Frontend

* HTML
* CSS
* JavaScript
* TypeScript
* React
* Next.js
* Vue
* Angular

Backend

* Node.js
* Express
* Spring Boot
* Django
* Flask
* FastAPI

Databases

* MySQL
* PostgreSQL
* MongoDB
* Redis

Cloud & DevOps

* Docker
* Kubernetes
* CI/CD
* GitHub Actions
* AWS
* Azure
* GCP

AI / Machine Learning

* OpenAI
* LangChain
* TensorFlow
* PyTorch
* Scikit-Learn

---

## Repository Intelligence

For each developer profile the platform generates:

* Repository Quality Score
* Activity Score
* Popularity Score
* Open Source Impact Score
* Project Complexity Score

Repository classification:

* Web Development
* Backend Systems
* AI / ML
* DevOps
* Data Science
* Mobile Development
* Open Source Tools

---

## Career Readiness Scoring

Generates readiness scores across multiple domains.

* Frontend Readiness
* Backend Readiness
* Database Readiness
* DevOps Readiness
* System Design Readiness
* Problem Solving Readiness

Each score includes AI-generated explanations and recommendations.

---

## AI Career Insights

Powered by Gemini AI.

Generates:

* Strengths
* Weaknesses
* Skill gaps
* Career recommendations
* Portfolio suggestions
* Resume suggestions
* Interview preparation advice

---

## Learning Roadmap Generator

Creates personalized:

* 1 Month Roadmap
* 3 Month Roadmap
* 6 Month Roadmap

Based on:

* Current skills
* Career goals
* Skill gaps
* Readiness scores

Supported career paths:

* SDE Intern
* Backend Developer
* Frontend Developer
* Full Stack Developer
* AI Engineer
* ML Engineer
* DevOps Engineer

---

## Recruiter Dashboard

Recruiter-focused analytics include:

* Candidate ranking
* Readiness scoring
* Repository quality evaluation
* Technical profile summaries
* Hiring recommendations
* Open-source influence metrics

---

## Developer Comparison

Compare two GitHub profiles side-by-side.

Comparison metrics:

* Skills
* Repository quality
* Activity
* Influence
* Readiness scores
* Technical strengths

---

## AI Career Coach

Interactive AI chat assistant powered by Gemini.

Example questions:

* What are my strongest backend skills?
* Am I ready for backend interviews?
* What projects should I build next?
* Which companies should I target?
* What are my biggest skill gaps?

---

## Dashboard Modules

### Analyze

Deep GitHub profile analysis and skill detection.

### Recruiter

Candidate ranking and hiring insights.

### Compare

Side-by-side developer comparison.

### Roadmap

Personalized learning plans.

### AI Chat

Context-aware career assistant.

---

## Technology Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI
* Recharts

Backend

* Node.js
* Express.js
* REST APIs

Database

* MySQL

AI

* Google Gemini API

External APIs

* GitHub REST API

Other Libraries

* Axios
* mysql2
* express-validator
* express-rate-limit

---

## Backend API Endpoints

Analyze Profile

POST /api/profiles/analyze/:username

Fetch All Profiles

GET /api/profiles

Fetch Single Profile

GET /api/profiles/:username

Delete Profile

DELETE /api/profiles/:username

Compare Developers

POST /api/compare

AI Chat

POST /api/chat

Roadmap Generation

POST /api/roadmap

Resume Generation

GET /api/resume/:username

---

## Deployment

Frontend:
[Frontend Deployment URL Here]

Backend:
https://github-profile-analyzer-api-ggym.onrender.com

Database:
Railway MySQL

---

## Future Enhancements

* ATS Resume PDF Export
* GitHub Contribution Heatmaps
* Team Comparison
* Recruiter Search Filters
* AI Mock Interviews
* Job Match Recommendations
* Portfolio Scoring Engine

---

## Author

Aryan Pande

GitHub:
https://github.com/AryanPande01
