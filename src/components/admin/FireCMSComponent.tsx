
'use client'

// --- Imports are commented out for the installation experiment ---
// import { useCallback } from 'react';
// import { useAuth } from '@/lib/authContext';
// import { getFirebaseApp } from '@/lib/firebase';
// import {
//     buildCollection,
//     buildProperty,
//     FirebaseCMSApp,
//     User as FireCMSUser,
// } from "firecms";
// import type { PageData, BlogPost, Category } from '@/types';
// import { blogCategories } from '@/types';

// --- All collection definitions are commented out for now ---
/*
const postsCollection = buildCollection<BlogPost>({
    name: "Blog Posts",
    path: "posts",
    properties: {
        title: buildProperty({ name: "Title", validation: { required: true }, dataType: "string" }),
        slug: buildProperty({ name: "Slug (URL)", validation: { required: true }, dataType: "string", description: "URL-friendly identifier" }),
        author: buildProperty({ name: "Author", dataType: "string", validation: { required: true } }),
        category: buildProperty({ name: "Category", dataType: "string", validation: { required: true }, enumValues: blogCategories.reduce((acc, cat) => ({...acc, [cat.toLowerCase().replace(/\s+/g, '-')]: cat }), {}) }),
        excerpt: buildProperty({ name: "Excerpt", dataType: "string", description: "A short summary of the post", multiline: true }),
        content: buildProperty({ name: "Content (HTML)", dataType: "string", markdown: true }),
        imageUrl: buildProperty({ name: "Image URL", dataType: "string", validation: { url: true } }),
        tags: buildProperty({ name: "Tags", dataType: "array", of: { dataType: "string" } }),
        published: buildProperty({ name: "Published", dataType: "boolean" }),
        date: buildProperty({ name: "Date", dataType: "date", validation: { required: true } }),
        createdAt: buildProperty({ name: "Created At", dataType: "date", readOnly: true }),
        updatedAt: buildProperty({ name: "Updated At", dataType: "date", readOnly: true })
    }
});

const categoriesCollection = buildCollection<Category>({
    name: "Categories",
    path: "categories",
    properties: {
        name: buildProperty({ name: "Name", validation: { required: true }, dataType: "string" }),
        slug: buildProperty({ name: "Slug", validation: { required: true }, dataType: "string" })
    }
});

const pagesCollection = buildCollection<PageData>({
    name: "Pages",
    path: "pages",
    singularName: "Page",
    properties: {
        title: buildProperty({ name: "Title", dataType: "string", validation: { required: true } }),
        metaDescription: buildProperty({ name: "Meta Description", dataType: "string", multiline: true }),
        contentBlocks: buildProperty({
            name: "Content Blocks",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    type: buildProperty({ name: "Block Type", dataType: "string", enumValues: { heading: "Heading", paragraph: "Paragraph", image: "Image", value_card: "Value Card" } }),
                    text: buildProperty({ name: "Text/Content", dataType: "string" }),
                    level: buildProperty({ name: "Heading Level (1-6)", dataType: "number" }),
                    url: buildProperty({ name: "Image URL", dataType: "string" }),
                    alt: buildProperty({ name: "Image Alt Text", dataType: "string" }),
                    icon: buildProperty({ name: "Icon", dataType: "string", enumValues: { zap: "Zap (Lightning)", users: "Users", shield_check: "Shield Check" } }),
                    title: buildProperty({ name: "Card Title", dataType: "string" })
                }
            }
        })
    }
});
*/

export default function FireCMSComponent() {
    // --- All component logic is commented out for the experiment ---
    /*
    const { user } = useAuth();
    const firebaseApp = getFirebaseApp();

    const myAuthenticator = useCallback(async ({ user: authUser }: { user: FireCMSUser | null }) => {
        if (!authUser) return false;
        const idTokenResult = await authUser.getIdTokenResult(true);
        return idTokenResult.claims.admin === true;
    }, []);

    if (!user) {
        return <div>Loading user authentication...</div>;
    }

    return (
        <FirebaseCMSApp
            name={"VHost Solutions CMS"}
            authentication={myAuthenticator}
            collections={[postsCollection, categoriesCollection, pagesCollection]}
            firebaseApp={firebaseApp}
        />
    );
    */

    // Placeholder content for the experiment
    return (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <h2 className="text-xl font-bold">FireCMS Experiment in Progress</h2>
            <p className="mt-2">
                The full FireCMS component is temporarily disabled. We are currently testing the installation of its core dependencies (@mui, @emotion) to isolate a recurring installation issue.
            </p>
            <p className="mt-1">
                If the build succeeds, it means the dependencies are compatible, and our next step will be to re-introduce the `firecms` package itself. Thank you for your patience.
            </p>
        </div>
    );
}
