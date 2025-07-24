
# VHost Solutions - Premier VPS Hosting Platform

This is a [Next.js](https://nextjs.org/) project, bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and significantly enhanced within Firebase Studio. It serves as a prototype for VHost Solutions, a fictional VPS (Virtual Private Server) hosting provider, now updated to leverage Next.js 15 and deployed via Docker.

## Project Overview

VHost Solutions provides a user-friendly platform for customers to browse, select, and order VPS plans. It features a company blog with AI-powered content generation tools, a dynamic site management system via an admin panel, and robust backend integrations for order processing. The entire application is designed to be deployed and managed seamlessly using Docker and Docker Compose.

## Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Generative AI:** [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit) for AI-powered features.
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore for data storage, Firebase Authentication for admin users).
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
*   **Deployment:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) with Traefik for reverse proxying.

## Core Features

*   **Dynamic Homepage:** Content is fully managed via the admin panel.
*   **VPS Plans & Ordering:**
    *   Display of various VPS plans managed from the admin panel.
    *   Order form for purchasing VPS plans, integrated with an n8n webhook for processing.
*   **Blog Engine:**
    *   Listing of blog posts with category and tag filtering.
    *   Dynamically generated static pages for posts, categories, and tags.
    *   AI-powered recommended posts section.
*   **Newsletter Subscription:** Captures user emails and stores them in Firestore.
*   **Contact Page:** A fully functional contact form integrated with a backend webhook.
*   **Dynamic Static Pages:** Pages like "About Us," "Privacy Policy," and "Terms of Service" are created and managed entirely from the admin panel.
*   **Advanced Admin Section:**
    *   Secure login page for administrators.
    *   Comprehensive dashboard for managing all site content:
        *   **Post Management:** Create, edit, and delete blog posts with full AI assistance (title, content, and image generation).
        *   **Page Management:** Create and edit dynamic "static" pages (e.g., About Us).
        *   **Navigation Management:** Visually manage header and footer menus with drag-and-drop.
        *   **VPS Plan Management:** Full CRUD (Create, Read, Update, Delete) functionality for hosting plans.
        *   **Site Settings:** Control global settings like site name, logo, and the content structure of the homepage, footer, and contact page.
    *   **Database Seeding:** A tool to populate a fresh Firestore database with initial data.

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Action for CI/CD deployment
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/
│   │   └── genkit.ts
│   ├── app/
│   │   ├── (admin)/        # Admin-only section (route group)
│   │   │   ├── admin/
│   │   │   │   ├── (main_admin)/ # Layout and pages for logged-in admins
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── navigation/
│   │   │   │   │   ├── pages/
│   │   │   │   │   ├── plans/
│   │   │   │   │   ├── posts/
│   │   │   │   │   └── settings/
│   │   │   │   └── login/      # Admin login page
│   │   ├── (site)/         # Public-facing site (route group)
│   │   │   ├── [slug]/       # Dynamic pages (e.g., /about, /privacy-policy)
│   │   │   ├── blog/
│   │   │   │   ├── [slug]/
│   │   │   │   ├── category/[categoryName]/
│   │   │   │   └── tag/[tagName]/
│   │   │   ├── contact/
│   │   │   ├── order/
│   │   │   └── ... (other site pages)
│   │   ├── actions/          # Next.js Server Actions
│   │   ├── globals.css
│   │   ├── layout.tsx        # Root layout
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── admin/            # Components exclusive to the admin panel
│   │   ├── blog/             # Components for the blog section
│   │   ├── common/
│   │   ├── layout/           # Header, Footer
│   │   ├── pages/            # Components for rendering dynamic pages
│   │   └── ui/               # ShadCN UI components
│   ├── hooks/
│   └── lib/                  # Core logic, Firebase config, schemas, etc.
│       ├── authContext.tsx   # React context for authentication
│       ├── firebase.ts       # Firebase client SDK initialization
│       ├── firestoreBlog.ts  # Functions for interacting with Firestore
│       ├── schemas.ts        # Zod validation schemas
│       └── seed.ts           # Database seeding script
├── Dockerfile                # Defines the Docker image for the application
├── docker-compose.yml        # Configures the Docker container and network
├── next.config.ts            # Next.js configuration
├── package.json
└── README.md
```

## Getting Started & Deployment

This project is configured for deployment via Docker.

### Prerequisites

*   Docker and Docker Compose installed on your server.
*   A Traefik reverse proxy network set up (the `docker-compose.yml` is configured to connect to an external network named `n8n_default`).
*   A Firebase project with Firestore and Authentication enabled.

### Environment Variables

You need to create a `.env` file in the project root. This file is crucial for both local development and production deployment. It should contain your Firebase project credentials and any other necessary secrets.

```env
# Firebase Client SDK Credentials (for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google AI / Genkit API Key (for server-side AI flows)
GEMINI_API_KEY=your_gemini_api_key

# Domain name for Traefik proxy
DOMAIN_NAME=yourdomain.com
```

You will also need a `service-account-key.json` file from your Firebase project for the Admin SDK to work.

### Deployment

The included `.github/workflows/deploy.yml` file provides a complete CI/CD pipeline for deploying the application to a VPS. It automates the following steps:
1.  Checks out the code from the `main` branch.
2.  Synchronizes project files to the server using `rsync`.
3.  Securely creates the `.env` and `service-account-key.json` files on the server from GitHub Secrets.
4.  Builds the Docker image and restarts the container using `docker compose`.

This setup ensures a seamless, automated deployment process every time you push to the `main` branch.

## AI Features with Genkit

The application heavily utilizes Genkit for AI-powered functionalities, primarily in the admin panel for content creation:
*   **`generate-post-title-flow.ts`**: Suggests compelling, SEO-friendly titles based on a topic.
*   **`generate-post-content-flow.ts`**: Generates full blog post content in Markdown format based on a title and keywords.
*   **`generate-post-image-flow.ts`**: Creates unique images for posts using Google's image generation models.
*   **`recommend-relevant-posts.ts`**: (Used on the blog) An AI agent that analyzes post content to recommend other relevant articles to the user.

These AI flows streamline the content creation process, making it faster and more efficient to manage the blog.
