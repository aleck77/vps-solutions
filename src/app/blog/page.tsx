
'use client'; 

import PostCard from '@/components/blog/PostCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import RecommendedPosts from '@/components/blog/RecommendedPosts';
import type { BlogPost } from '@/types';
import { useEffect, useState } from 'react';
import { getAllPublishedPosts } from '@/lib/firestoreBlog'; 
import { Skeleton } from '@/components/ui/skeleton'; 
// import { useFormState, useFormStatus } from 'react-dom'; // Changed from useFormState
import { useActionState as useReactActionState } from 'react'; // Import from 'react' with an alias
import { useFormStatus } from 'react-dom'; // useFormStatus is still from react-dom
import { subscribeToNewsletter } from '@/app/actions/newsletterActions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


function NewsletterForm() {
  const { toast } = useToast();
  const initialState = { message: '', error: false };
  // Updated to useActionState (now useReactActionState)
  const [state, formAction, isPending] = useReactActionState(subscribeToNewsletter, initialState);
  // const { pending } = useFormStatus(); // This would be for form elements, isPending from useActionState is for the action
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (state.message) {
      if (state.error) {
        toast({ title: 'Subscription Failed', description: state.message, variant: 'destructive' });
      } else {
        toast({ title: 'Subscribed!', description: state.message });
        setEmail(''); 
      }
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-3">
      <Input 
        type="email" 
        name="email" 
        placeholder="Enter your email" 
        className="w-full p-2 border rounded-md" 
        required 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isPending}
      />
      <Button type="submit" className="w-full bg-accent text-accent-foreground p-2 rounded-md hover:bg-accent/90" disabled={isPending}>
        {isPending ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
}


export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const fetchedPosts = await getAllPublishedPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        // Optionally, set an error state here to display to the user
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, []);

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
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">No blog posts found.</p>
          )}
          {/* TODO: Add Pagination component here if many posts */}
        </div>
        <aside className="md:col-span-3 space-y-6">
          <div className="p-4 bg-muted rounded-lg shadow">
            <h3 className="font-semibold font-headline text-lg mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">Stay updated with our latest articles and offers.</p>
            <NewsletterForm />
          </div>
          <RecommendedPosts currentPostId={null} /> 
        </aside>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-lg">
      <Skeleton className="h-48 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </div>
  );
}
