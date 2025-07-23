
# VHost Solutions - Premier VPS Hosting Platform

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and significantly enhanced within Firebase Studio. It serves as a prototype for VHost Solutions, a fictional VPS (Virtual Private Server) hosting provider.

## Project Overview

VHost Solutions aims to provide a user-friendly platform for customers to browse, select, and order VPS plans. It also features a company blog with AI-powered post recommendations, a newsletter subscription system, and an administrative backend for content management.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://reactjs.org/), [ShadCN/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Generative AI:** [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit) for AI-powered features.
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore for data storage, Firebase Authentication for admin users).
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.

## Core Features

*   **Homepage:** Engaging landing page showcasing services and plans.
*   **VPS Plans & Ordering:**
    *   Display of various VPS plans with detailed specifications.
    *   Order form for purchasing VPS plans, integrated with a mock order processing webhook.
*   **Blog:**
    *   Listing of blog posts with category filtering.
    *   Individual blog post pages.
    *   Dynamic generation of static pages for posts and categories.
    *   AI-powered recommended posts section (using Genkit).
*   **Newsletter Subscription:** Allows users to subscribe to a newsletter (data stored in Firestore).
*   **Contact Page:** Form for user inquiries.
*   **Static Pages:** About Us, Privacy Policy, Terms of Service.
*   **Admin Section:**
    *   Login page for administrators.
    *   Admin dashboard with protected routes.
    *   Functionality to seed the Firestore database with initial blog posts and categories.
    *   (Previously) Functionality to set custom admin claims for users.
*   **AI Features:**
    *   `recommend-relevant-posts` Genkit flow to suggest blog articles based on current post and user history (mocked/conceptual).

## Getting Started

First, ensure you have Node.js and npm (or yarn/pnpm) installed.

Then, set up your Firebase project and environment variables:
1.  Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  Enable Firestore and Firebase Authentication.
3.  Obtain your Firebase project configuration (API Key, Auth Domain, Project ID, etc.).
4.  Create a `.env` file in the root of the project and add your Firebase configuration:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # For Firebase Admin SDK (used in server actions like seeding)
    # You might need to set up GOOGLE_APPLICATION_CREDENTIALS
    # or ensure your hosting environment (like App Hosting) has appropriate permissions.
    ```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified by your development environment, e.g., the port provided by Firebase Studio's IDX preview) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Firebase Integration

This project leverages Firebase for:
*   **Firestore:** As the primary database for blog posts, categories, newsletter subscribers, etc.
*   **Firebase Authentication:** For managing admin user access to the admin dashboard.
*   **Firebase Admin SDK:** Used in server actions for tasks like database seeding and (previously) managing custom user claims.

The admin dashboard (`/admin/dashboard`) allows seeding the database with initial content. You will need to log in as an admin user. To make a user an admin, you can manually set custom claims in the Firebase console or adapt the `setUserAdminClaimAction` if needed.

## Generative AI with Genkit

The application uses Genkit for implementing AI-powered features. An example is the `recommend-relevant-posts` flow located in `src/ai/flows/recommend-relevant-posts.ts`, which demonstrates how Genkit can be used to provide content recommendations.

## Deployment

This project can be deployed to various platforms that support Next.js.
*   **Firebase Hosting:** Suitable for deploying Next.js applications.
*   **Firebase App Hosting:** An `apphosting.yaml` file is provided for easy deployment to Firebase App Hosting, which is optimized for Next.js applications.

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details on other platforms.

## Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
