# Feature: Accelerator Pipeline Foundation

## Overview
Build foundation for automating startup accelerator, grant, and angel network discovery and applications.

## Requirements
- **Multi-product support**: Store multiple product/startup profiles
- **Full pipeline**: Discovery -> Application -> Tracking -> Follow-up
- **Funding types**: Accelerators, grants, angel networks
- **Data storage**: JSON files for portability and version control

## Data Sources
- [Startup Accelerator Directory (Notion)](https://getfluently.notion.site/Startup-Accelerator-Directory-2226a9ce04d9800bafdbc2cb4e77a552)

## Implementation Plan

### Phase 1: Foundation (This Feature)
1. Data schemas for opportunities, products, and applications
2. CLI commands: add/list/search opportunities and products
3. Initial Notion scraper for accelerator directory

### Phase 2: Matching & Generation (Future)
- Fit scoring algorithm
- Application content templates
- Auto-customization per product/opportunity

### Phase 3: Automation (Future)
- Deadline tracking and notifications
- Submission automation where possible
- Status updates and follow-ups

## Tech Stack
- TypeScript/Node.js
- Commander.js (CLI)
- Playwright (scraping JS-rendered pages)
- Zod (schema validation)
- Inquirer (interactive prompts)

## Data Schema Design

### Opportunity
- id, name, type (accelerator/grant/angel)
- description, url, applicationUrl
- fundingAmount, equityTaken
- deadline, applicationWindow
- focusAreas, stagesAccepted
- location, remote
- requirements, notes

### Product
- id, name, description
- stage, industry, focusAreas
- teamSize, founded
- traction, revenue
- location
- pitchDeck, website

### Application
- id, opportunityId, productId
- status, submittedAt
- notes, followUps
- content (generated application materials)
