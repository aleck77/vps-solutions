
'use client'

import { useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '@/lib/authContext';

import { FireCMS, User, FireCMSAppConfig, CMSView, Collection, buildCollection, Entity, StringProperty, MarkdownProperty, BooleanProperty, TimestampProperty, ArrayProperty, MapProperty, NumberProperty, buildProperty } from 'firecms';

import { getFirebaseApp } from '@/lib/firebase';
import "firecms/styles.css";

// Define our custom page content blocks
const headingBlock: MapProperty = buildProperty({
    dataType: "map",
    name: "Heading",
    properties: {
        text: {
            name: "Text",
            dataType: "string"
        },
        level: {
            name: "Level",
            dataType: "number",
            validation: { min: 1, max: 6 }
        }
    }
});

const paragraphBlock: StringProperty = buildProperty({
    name: "Paragraph",
    dataType: "string",
    markdown: true
});

const imageBlock: MapProperty = buildProperty({
    dataType: "map",
    name: "Image",
    properties: {
        url: {
            name: "Image URL",
            dataType: "string",
            validation: {
                url: true
            }
        },
        alt: {
            name: "Alt text",
            dataType: "string"
        },
        dataAiHint: {
            name: "AI Hint",
            dataType: "string"
        }
    }
});

const valueCardBlock: MapProperty = buildProperty({
    dataType: "map",
    name: "Value Card",
    properties: {
        icon: buildProperty({
            name: "Icon",
            dataType: "string",
            enumValues: {
                zap: "Zap",
                users: "Users",
                shield_check: "Shield Check"
            }
        }),
        title: {
            name: "Title",
            dataType: "string"
        },
        text: {
            name: "Text",
            dataType: "string"
        }
    }
});

// Define collections
const postsCollection = buildCollection<any>({
    name: "Posts",
    path: "posts",
    properties: {
        title: {
            name: "Title",
            dataType: "string",
            validation: { required: true }
        },
        slug: {
            name: "Slug",
            dataType: "string",
            validation: { required: true, unique: true }
        },
        author: {
            name: "Author",
            dataType: "string",
        },
        content: {
            name: "Content",
            dataType: "string",
            markdown: true
        },
        imageUrl: {
            name: "Image URL",
            dataType: "string",
            validation: { url: true }
        },
        published: {
            name: "Published",
            dataType: "boolean"
        },
        date: {
            name: "Date",
            dataType: "timestamp"
        },
        category: {
            name: "Category",
            dataType: "string"
        },
        tags: {
            name: "Tags",
            dataType: "array",
            of: {
                dataType: "string"
            }
        }
    }
});

const categoriesCollection = buildCollection({
    name: "Categories",
    path: "categories",
    properties: {
        name: {
            name: "Name",
            dataType: "string",
        },
        slug: {
            name: "Slug",
            dataType: "string"
        }
    }
});

const pagesCollection = buildCollection({
    name: "Pages",
    path: "pages",
    properties: {
        title: {
            name: "Title",
            dataType: "string",
        },
        metaDescription: {
            name: "Meta Description",
            dataType: "string",
        },
        contentBlocks: buildProperty({
            name: "Content Blocks",
            dataType: "array",
            of: {
                dataType: "map",
                oneOf: {
                    typeField: "type",
                    valueField: "value",
                    properties: {
                        heading: headingBlock,
                        paragraph: paragraphBlock,
                        image: imageBlock,
                        value_card: valueCardBlock
                    }
                }
            }
        })
    }
});

export default function FireCMSComponent() {
    const { user, isAdmin } = useAuth();
    const firebaseApp = getFirebaseApp();

    const myAuthenticator = useCallback(async ({ user: authUser }: { user: FirebaseUser | null }) => {
        if (!authUser) {
            // If the user is not logged in, we can't do anything.
            // You can also throw an error.
            return false;
        }
        // The user is logged in, let's check if they are an admin
        const idTokenResult = await authUser.getIdTokenResult(true);
        const isCmsAdmin = idTokenResult.claims.admin === true;

        if (isCmsAdmin) {
            console.log("User is an admin, allowing access to FireCMS");
        } else {
            console.log("User is not an admin, denying access to FireCMS");
        }
        return isCmsAdmin;
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return <FireCMS
                authenticator={myAuthenticator}
                collections={[
                    postsCollection,
                    categoriesCollection,
                    pagesCollection
                ]}
                firebaseApp={firebaseApp}
            />;
}
