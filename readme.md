# Timelypost

Timelypost is a **fully serverless social media post scheduler** designed to make managing content across multiple platforms simple and efficient.

## Applications

1. **Lambda Function**

   - Scheduled AWS Lambda functions handle posting content to various social media platforms automatically.

2. **Web App**
   - A Next.js web application for uploading, managing, and scheduling posts with ease.

## Requirements

- **Vercel** → for deploying the Next.js web app
- **Supabase** or **NeonDB** → for database and persistent storage
- **AWS** → for running serverless Lambda functions
- **Redis** (optional) → for caching; may be removed or become optional in the future

---

## Features (Planned & Current)

- Schedule posts to multiple social media platforms
- Serverless architecture for scalability and low maintenance
- Easy-to-use web interface for post management
- Extensible design for adding new platforms and features

---

## Supported Platforms

- [x] **LinkedIn**
- [ ] **X** (formerly Twitter)
