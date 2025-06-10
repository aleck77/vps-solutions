
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { updatePostAction } from '@/app/actions/postActions';
import { getPostByIdForEditing } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import { blogCategories } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const postId = params.postId as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      author: '',
      imageUrl: 'https://placehold.co/600x400.png',
      category: undefined,
      excerpt: '',
      content: '',
      tags: '',
      published: false,
    },
    mode: 'onChange',
  });

  const titleValue = form.watch('title');
  const currentSlugValue = form.watch('slug');

  // Effect to auto-generate slug from title if slug is not manually changed
  useEffect(() => {
    if (titleValue && (!form.formState.dirtyFields.slug || slugify(titleValue) !== currentSlugValue && post?.slug === currentSlugValue)) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, form, currentSlugValue, post?.slug]);
  

  // Fetch post data on component mount
  useEffect(() => {
    if (!postId) {
      toast({ title: 'Error', description: 'Post ID is missing.', variant: 'destructive' });
      router.push('/admin/posts');
      return;
    }

    async function fetchPost() {
      setIsLoadingPost(true);
      try {
        const fetchedPost = await getPostByIdForEditing(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          // Find original category name for display in select
          const originalCategoryName = blogCategories.find(cat => slugify(cat) === fetchedPost.category) || fetchedPost.category;

          form.reset({
            title: fetchedPost.title,
            slug: fetchedPost.slug,
            author: fetchedPost.author,
            imageUrl: fetchedPost.imageUrl,
            category: originalCategoryName, // Use original name for select
            excerpt: fetchedPost.excerpt,
            content: fetchedPost.content,
            tags: fetchedPost.tags?.join(', ') || '',
            published: fetchedPost.published,
          });
        } else {
          toast({ title: 'Error', description: 'Post not found.', variant: 'destructive' });
          router.push('/admin/posts');
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast({ title: 'Error', description: 'Failed to load post data.', variant: 'destructive' });
      } finally {
        setIsLoadingPost(false);
      }
    }
    fetchPost();
  }, [postId, form, router, toast]);

  const [state, formAction, isPending] = useActionState(updatePostAction.bind(null, postId), undefined);

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Updating Post',
        description: state.message + (state.errors ? ` ${state.errors.map(e => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
    // Redirection is handled by the server action itself
  }, [state, toast]);

  const onSubmit = async (data: PostFormValues) => {
    formAction(data);
  };

  if (isLoadingPost) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex justify-end space-x-3 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!post) {
     // This case should ideally be handled by the redirect in useEffect, but as a fallback:
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-lg text-destructive">Post not found or failed to load.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/posts">Back to Posts</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/posts" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </Link>
            </Button>
          </div>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Save className="h-7 w-7 mr-3 text-accent" />
            Edit Blog Post
          </CardTitle>
          <CardDescription>Update the details of the blog post below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-slug-will-be-here" {...field} disabled={isPending} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly version of the title. Usually auto-generated.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author's name" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} disabled={isPending} />
                    </FormControl>
                     <FormDescription>
                      URL of the main image for the post. Use https://placehold.co/ for placeholders.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blogCategories.map((categoryName) => (
                          <SelectItem key={categoryName} value={categoryName}>
                            {categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short summary of the post..." className="min-h-[100px]" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your blog post content here..." className="min-h-[250px]" {...field} disabled={isPending} />
                    </FormControl>
                     <FormDescription>
                      The main content of the blog post. Markdown is not yet supported, use plain text or HTML.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="tag1, tag2, another-tag" {...field} disabled={isPending} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of tags (e.g., AI, Next.js, Tutorial).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Post</FormLabel>
                      <FormDescription>
                        Make this post visible to the public.
                      </FormDescription>
                    </div>
                    <FormControl>
                       <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/posts')} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
