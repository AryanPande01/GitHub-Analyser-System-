# GitHub Career Analyzer

An AI-powered GitHub intelligence platform that analyzes developer profiles, evaluates technical readiness, generates career insights, compares candidates, and provides personalized learning roadmaps.

The platform combines GitHub repository analytics, skill detection, career readiness scoring, recruiter-focused insights, and Gemini-powered AI recommendations into a single professional dashboard.

---

## Live Demo

Frontend

https://git-hub-analyser-system.vercel.app/analyze

Backend API

https://github-analyser-system.onrender.com

GitHub Repository

https://github.com/AryanPande01/GitHub-Analyser-System-

<img width="1470" height="806" alt="image" src="https://github.com/user-attachments/assets/f83578e1-9b99-4cc2-8701-e65c4a74c8c7" />
<img width="1457" height="809" alt="image" src="https://github.com/user-attachments/assets/f326ef27-f49e-42a4-9c45-d99abffc5f0c" />
<img width="1470" height="808" alt="image" src="https://github.com/user-attachments/assets/10ad03bb-d9b4-4508-b69c-950fd1cdc9a8" />
<img width="1470" height="805" alt="image" src="https://github.com/user-attachments/assets/9de4c450-f135-4d65-866c-680d27fa060f" />
<img width="1470" height="805" alt="image" src="https://github.com/user-attachments/assets/5378b185-5234-4840-9530-718c1b431129" />


---

## Overview

GitHub Career Analyzer helps developers, recruiters, and hiring managers evaluate technical profiles using GitHub activity and repository data.

The platform analyzes repositories, identifies technologies, evaluates project quality, generates career readiness scores, produces AI-powered recommendations, and creates personalized learning roadmaps.

---

## Platform Capabilities

* Analyze any public GitHub profile
* Evaluate repository quality and developer activity
* Detect technologies and development domains
* Generate AI-powered career insights
* Compare developers side-by-side
* Rank candidates for recruiters
* Create personalized learning roadmaps
* Provide AI career coaching through chat

---

## GitHub Profile Analysis

Analyze any public GitHub profile and extract:

* Public repositories
* Followers and following
* Public gists
* Stars, forks, and watchers
* Account age
* Repository activity
* Profile metadata
* Open-source impact metrics

---

## Technology Detection Engine

The analyzer automatically identifies technologies and frameworks used across GitHub repositories.

### Frontend Technologies

* HTML
* CSS
* JavaScript
* TypeScript
* React
* Next.js
* Vue
* Angular

### Backend Technologies

* Node.js
* Express
* Spring Boot
* Django
* Flask
* FastAPI

### Databases

* MySQL
* PostgreSQL
* MongoDB
* Redis

### Cloud & DevOps

* Docker
* Kubernetes
* CI/CD
* GitHub Actions
* AWS
* Azure
* Google Cloud Platform

### AI / Machine Learning

* OpenAI
* LangChain
* TensorFlow
* PyTorch
* Scikit-Learn

Note: These technologies are detected from analyzed GitHub repositories and are not necessarily used to build this platform.

---

## Repository Intelligence

For every analyzed profile, the platform generates:

* Repository Quality Score
* Activity Score
* Popularity Score
* Open Source Impact Score
* Project Complexity Score

Repository classification includes:

* Web Development
* Backend Systems
* AI / Machine Learning
* DevOps
* Data Science
* Mobile Development
* Open Source Tools

---

## Career Readiness Scoring

The platform evaluates readiness across multiple engineering domains:

* Frontend Development
* Backend Development
* Database Engineering
* DevOps & Cloud
* System Design
* Problem Solving

Each score includes AI-generated explanations and actionable recommendations.

---

## AI Career Insights

Powered by Google Gemini.

Generates:

* Strengths
* Weaknesses
* Skill Gaps
* Career Recommendations
* Portfolio Suggestions
* Resume Suggestions
* Interview Preparation Guidance

---

## Personalized Learning Roadmaps

Creates customized learning plans based on:

* Current skills
* Technology stack
* Career goals
* Skill gaps
* Readiness scores

Supported career paths:

* SDE Intern
* Backend Developer
* Frontend Developer
* Full Stack Developer
* AI Engineer
* Machine Learning Engineer
* DevOps Engineer

Roadmap durations:

* 1 Month
* 3 Months
* 6 Months

---

## Recruiter Dashboard

Recruiter-focused analytics include:

* Candidate Ranking
* Readiness Scoring
* Repository Quality Evaluation
* Technical Profile Summaries
* Hiring Recommendations
* Open Source Influence Metrics

---

## Developer Comparison

Compare two GitHub developers side-by-side.

Comparison metrics:

* Skills
* Repository Quality
* Activity
* Technical Influence
* Readiness Scores
* Strengths and Weaknesses

---

## AI Career Coach

Interactive AI assistant powered by Gemini.

Example questions:

* What are my strongest backend skills?
* Am I ready for backend interviews?
* What projects should I build next?
* Which companies should I target?
* What are my biggest skill gaps?
* How can I improve my profile for FAANG-level roles?

---

## Dashboard Modules

### Analyze

Deep GitHub profile analysis and technology detection.

### Recruiter

Candidate ranking and hiring insights.

### Compare

Side-by-side developer comparison.

### Roadmap

Personalized learning plans.

### AI Chat

Context-aware career assistant.

---

## Engineering Highlights

* RESTful API architecture
* AI-powered recommendation engine
* Dynamic GitHub repository analysis
* Technology and skill detection system
* Recruiter-focused candidate ranking
* Personalized roadmap generation
* Input validation and request sanitization
* Rate limiting for API protection
* MySQL connection pooling
* Modular service-oriented backend architecture

---

## System Architecture

GitHub REST API

↓

Node.js + Express Backend

↓

MySQL Database (Railway)

↓

Google Gemini AI

↓

Next.js Frontend

↓

Vercel Deployment

---

## Technology Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Shadcn UI
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* REST APIs
* Express Validator
* Express Rate Limiter

### Database

* MySQL
* MySQL2

### AI

* Google Gemini API

### External APIs

* GitHub REST API

### Deployment

* Vercel
* Render
* Railway

---

## Backend API Endpoints

### Profile Management

POST /api/profiles/analyze/:username

GET /api/profiles

GET /api/profiles/:username

DELETE /api/profiles/:username

### Analysis

GET /api/analysis/:username/full

GET /api/analysis/:username/skills

GET /api/analysis/:username/repositories

GET /api/analysis/:username/readiness

GET /api/analysis/:username/insights

GET /api/analysis/:username/roadmap

GET /api/analysis/:username/activity

### Comparison

POST /api/compare

### AI Chat

POST /api/chat

### Resume

GET /api/resume/:username

### Recruiter Dashboard

GET /api/recruiter

GET /api/recruiter/:username

---

## Local Development Setup

### Clone Repository

git clone https://github.com/AryanPande01/GitHub-Analyser-System-

cd GitHub-Analyser-System-

### Backend Setup

npm install

npm run dev

### Frontend Setup

cd frontend

npm install

npm run dev

---

## Deployment

Frontend

Hosted on Vercel

Backend

Hosted on Render

Database

MySQL hosted on Railway

---

## Future Enhancements

* ATS Resume PDF Export
* GitHub Contribution Heatmaps
* Team Comparison Dashboard
* Recruiter Search Filters
* AI Mock Interviews
* Job Match Recommendations
* Portfolio Scoring Engine
* Contribution Trend Analytics
* Multi-Candidate Hiring Pipelines

---

## Author

Aryan Pande

GitHub:
https://github.com/AryanPande01
