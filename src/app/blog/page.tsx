import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { mockPosts } from '@/data/posts';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import type { BlogPost } from '@/types';

// Simulate fetching posts. In a real app, this would be an API call.
async function getPosts(): Promise<BlogPost[]> {
  return mockPosts;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">VHost Solutions Blog</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Insights on AI, No-code, Web Development, Automation, Tools, and Cloud Hosting.
        </p>
      </section>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-9">
           <CategoryFilter />
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">No blog posts found.</p>
          )}
          {/* TODO: Add Pagination component here */}
        </div>
        <aside className="md:col-span-3 space-y-6">
          <RecommendedPosts currentPostId={null} />
          {/* You can add other sidebar elements here, like popular posts, newsletter signup, etc. */}
          <div className="p-4 bg-muted rounded-lg shadow">
            <h3 className="font-semibold font-headline text-lg mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">Stay updated with our latest articles and offers.</p>
            {/* Placeholder for newsletter form */}
            <input type="email" placeholder="Enter your email" className="w-full p-2 border rounded-md mb-2" />
            <button className="w-full bg-accent text-accent-foreground p-2 rounded-md hover:bg-accent/90">Subscribe</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
