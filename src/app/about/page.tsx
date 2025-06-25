'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Users, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { PageData, ContentBlock, HeadingBlock, ParagraphBlock, ImageBlock, ValueCardBlock } from '@/types';
import { getPageBySlug } from '@/lib/firestoreBlog';

// --- Renderer Components for Content Blocks ---

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return <HeadingTag key={index} className="text-3xl font-bold font-headline mb-6 text-primary">{block.text}</HeadingTag>;
    
    case 'paragraph':
      return <p key={index} className="text-lg text-foreground space-y-4">{block.text}</p>;
      
    case 'image':
      return (
        <div key={index} className="rounded-lg overflow-hidden shadow-xl my-6">
          <Image
            src={block.url}
            alt={block.alt}
            width={600}
            height={400}
            data-ai-hint={block.dataAiHint || 'page image'}
            className="w-full h-auto object-cover"
          />
        </div>
      );

    case 'value_card':
      let iconComponent;
      if (block.icon === 'zap') iconComponent = <Zap className="h-6 w-6 text-accent" />;
      else if (block.icon === 'users') iconComponent = <Users className="h-6 w-6 text-accent" />;
      else if (block.icon === 'shield_check') iconComponent = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
      
      return (
        <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
              {iconComponent}
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

// --- Page Skeleton for Loading State ---
function AboutPageSkeleton() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </section>
      <Card className="shadow-lg">
        <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/6" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}


export default function AboutPage() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      try {
        setLoading(true);
        const data = await getPageBySlug('about');
        if (data) {
          setPageData(data);
          document.title = `${data.title} | VHost Solutions`;
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch page data for 'about' page:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchPageData();
  }, []);

  if (loading) {
    return <AboutPageSkeleton />;
  }

  if (!pageData) {
    return notFound();
  }
  
  const groupedContent = groupValueCards(pageData.contentBlocks);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">{pageData.title}</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {pageData.metaDescription}
        </p>
      </section>

      {/* This section is static for now but could be made dynamic */}
      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Target className="h-7 w-7 mr-3 text-accent" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-foreground space-y-4">
             {pageData.contentBlocks.filter(b => b.type === 'paragraph' && (b.text.includes("At VHost Solutions, our mission is to provide") || b.text.includes("We believe that great hosting is the foundation"))).map((block, index) => renderBlock(block, index))}
          </CardContent>
        </Card>
      </section>

      {/* Main content renderer */}
      {groupedContent.map((item, index) => {
        if (Array.isArray(item)) { // This is a group of value cards
          return (
            <section key={`group-${index}`}>
              <div className="grid md:grid-cols-3 gap-8">
                {item.map((cardBlock, cardIndex) => renderBlock(cardBlock, `card-${cardIndex}`))}
              </div>
            </section>
          )
        } else { // This is a single block
          if (item.text?.includes("Our Story")) {
             return (
               <section key={index} className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    {renderBlock(item, index)}
                     {pageData.contentBlocks.filter(b => b.type === 'paragraph' && !b.text.includes("At VHost Solutions, our mission is to provide") && !b.text.includes("We believe that great hosting is the foundation")).map((p, i) => renderBlock(p,`story-p-${i}`))}
                  </div>
                   {pageData.contentBlocks.filter(b => b.type === 'image').map((imgBlock, i) => renderBlock(imgBlock,`story-img-${i}`))}
                </section>
             )
          }
          // Avoid re-rendering what's already manually placed
          if (item.type === 'paragraph' || item.type === 'image' || (item.type === 'heading' && item.text === 'Our Mission')) {
            return null;
          }
           if (item.type === 'heading' && item.text === 'Our Values') {
             return <h2 key={index} className="text-3xl font-bold font-headline text-center mb-10">{item.text}</h2>
           }

          return <section key={index}>{renderBlock(item, index)}</section>;
        }
      })}

    </div>
  );
}
