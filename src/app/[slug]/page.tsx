
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/firestoreBlog';
import type { PageData, ContentBlock, ValueCardBlock } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marked } from 'marked';
import DynamicLucideIcon from '@/components/common/DynamicLucideIcon';
import { getDb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


// --- Helper functions for rendering, moved here to make the component self-contained ---

function renderBlock(block: ContentBlock, index: string | number) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <HeadingTag key={index} className="text-3xl font-bold font-headline mb-6 text-primary">{block.text}</HeadingTag>;
    
    case 'paragraph':
      return <div key={index} dangerouslySetInnerHTML={{ __html: marked.parse(block.text || '') }} />;
      
    case 'image':
      return (
        <div key={index} className="rounded-lg overflow-hidden shadow-xl my-8">
          <div className="relative w-full aspect-video">
            <Image
              src={block.url || 'https://placehold.co/800x450.png'}
              alt={block.alt || 'Page image'}
              fill
              data-ai-hint={block.dataAiHint || 'page image'}
              className="object-cover"
            />
          </div>
        </div>
      );

    case 'value_card':
      return (
        <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
              {block.icon && <DynamicLucideIcon name={block.icon} className="h-6 w-6 text-accent" />}
            </div>
            <CardTitle className="font-headline">{block.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{block.text}</p>
          </CardContent>
        </Card>
      );
      
    default:
      return <div key={index} className="text-red-500">Unsupported block type</div>;
  }
}

function groupValueCards(blocks: ContentBlock[]) {
  const groupedContent: (ContentBlock | ValueCardBlock[])[] = [];
  let currentCardGroup: ValueCardBlock[] = [];

  blocks.forEach(block => {
    if (block.type === 'value_card') {
      currentCardGroup.push(block);
    } else {
      if (currentCardGroup.length > 0) {
        groupedContent.push(currentCardGroup);
        currentCardGroup = [];
      }
      groupedContent.push(block);
    }
  });

  if (currentCardGroup.length > 0) {
    groupedContent.push(currentCardGroup);
  }

  return groupedContent;
}

// --- Component and Metadata generation ---

// Provides Next.js with hints about the possible dynamic routes. This is a best practice and can resolve build issues.
export async function generateStaticParams() {
  try {
    const db = getDb();
    const pagesSnapshot = await getDocs(collection(db, 'pages'));
    
    const params = pagesSnapshot.docs.map((doc) => ({
      slug: doc.id,
    }));
    return params;
  } catch (error) {
    console.error("Error generating static params for pages:", error);
    return [];
  }
}

// Correctly handle the params Promise as per Next.js 15
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Awaiting props as suggested, to resolve the framework's static analysis issue.
  const { slug } = await props.params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${page.title} | VHost Solutions`,
    description: page.metaDescription,
  };
}


// Correctly handle the params Promise as per Next.js 15
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  // Awaiting props as suggested, to resolve the framework's static analysis issue.
  const { slug } = await props.params;
  const pageData = await getPageBySlug(slug);

  if (!pageData) {
    notFound();
  }
  
  const groupedContent = groupValueCards(pageData.contentBlocks || []);

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">{pageData.title}</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {pageData.metaDescription}
        </p>
      </section>

      <div className="prose dark:prose-invert lg:prose-xl max-w-none">
        {groupedContent.map((item, index) => {
          if (Array.isArray(item)) {
            return (
              <div key={`group-${index}`} className="grid md:grid-cols-3 gap-8 my-8 not-prose">
                {item.map((cardBlock, cardIndex) => renderBlock(cardBlock, `card-${cardIndex}`))}
              </div>
            );
          } else {
            return renderBlock(item, index);
          }
        })}
      </div>
    </div>
  );
}
