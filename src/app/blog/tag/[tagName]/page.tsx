
import { getPostsByTag } from '@/lib/firestoreBlog';
import { unslugify } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: {
    tagName: string;
  };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagTitle = unslugify(params.tagName);
  return {
    title: `Posts tagged with: ${tagTitle}`,
  };
}

// A single, minimal async component
export default async function TagPage({ params }: TagPageProps) {
    if (!params.tagName) {
    notFound();
  }
  const posts = await getPostsByTag(params.tagName);
  const tagTitle = unslugify(params.tagName);

  return (
    <div>
      <nav>
        <Link href="/blog">
          &larr; Back to Blog
        </Link>
      </nav>
      <hr style={{ margin: '20px 0' }} />
      <h1>Tag: {tagTitle}</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found with this tag.</p>
      )}
    </div>
  );
}

// Ensure the page is always dynamic
export const dynamic = 'force-dynamic';
