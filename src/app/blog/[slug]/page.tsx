
import { getPostBySlug } from '@/lib/firestoreBlog';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // We still need to fetch the post to get the title for metadata
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

// A single, minimal async component
export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <nav>
        <Link href="/blog">
          &larr; Back to Blog
        </Link>
      </nav>
      <hr style={{ margin: '20px 0' }} />
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <p>Category: <Link href={`/blog/category/${post.category}`}>{post.category}</Link></p>
      <br />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

// Ensure the page is always dynamic
export const dynamic = 'force-dynamic';
