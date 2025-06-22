
import { getPostsByCategory } from '@/lib/firestoreBlog';
import { unslugify } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    categoryName: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryTitle = unslugify(params.categoryName);
  return {
    title: `Posts in category: ${categoryTitle}`,
  };
}

// A single, minimal async component
export default async function CategoryPage({ params }: CategoryPageProps) {
  if (!params.categoryName) {
    notFound();
  }
  const posts = await getPostsByCategory(params.categoryName);
  const categoryTitle = unslugify(params.categoryName);

  return (
    <div>
      <nav>
        <Link href="/blog">
          &larr; Back to Blog
        </Link>
      </nav>
      <hr style={{ margin: '20px 0' }} />
      <h1>Category: {categoryTitle}</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found in this category.</p>
      )}
    </div>
  );
}

// Ensure the page is always dynamic
export const dynamic = 'force-dynamic';
