# IRODORI Frontend (Next.js)

User authentication frontend with login, registration, and dashboard pages.

## Setup

```bash
npm install
npm run dev
```

## Azure Deployment

This repository includes GitHub Actions workflow for automatic deployment to Azure Static Web Apps.

### Required Secrets
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - API token from Azure
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

## Features

- User registration with validation
- Session-based login/logout
- Responsive design with Tailwind CSS
- Reusable UI components

## Pages

- `/login` - Login form
- `/register` - Registration form with validation
- `/` - Dashboard (protected, shows user info)