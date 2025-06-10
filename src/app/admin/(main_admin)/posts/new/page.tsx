
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { createPostAction } from '@/app/actions/postActions';
import { blogCategories } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
// Import useActionState hook
import { useActionState } from 'react';


export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      author: '', // Consider pre-filling with logged-in admin's name if available
      imageUrl: 'https://placehold.co/600x400.png',
      category: undefined,
      excerpt: '',
      content: '',
      tags: '',
      published: false,
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const titleValue = form.watch('title');

  useEffect(() => {
    if (titleValue && !form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, form]);
  
  // useActionState hook for handling form submission with server action
  const [state, formAction, isPending] = useActionState(createPostAction, undefined);

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Creating Post',
        description: state.message + (state.errors ? ` ${state.errors.map(e => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
    // Redirection is handled by the server action itself
    // No need to handle state.success === true here for redirection or toast
  }, [state, toast, router]);


  const onSubmit = async (data: PostFormValues) => {
     setIsSubmittingManual(true); // For UI feedback if needed, though useActionState's isPending is better
     formAction(data); // Call the formAction returned by useActionState
     // setIsSubmittingManual(false); // isPending from useActionState handles this
  };


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
            <PlusCircle className="h-7 w-7 mr-3 text-accent" />
            Create New Blog Post
          </CardTitle>
          <CardDescription>Fill in the details below to add a new post to the blog.</CardDescription>
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
                      <Input placeholder="Enter post title" {...field} />
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
                      <Input placeholder="post-slug-will-be-here" {...field} />
                    </FormControl>
                    <FormDescription>
                      The slug is the URL-friendly version of the title. It's usually auto-generated.
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
                      <Input placeholder="Author's name" {...field} />
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
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {blogCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                      <Textarea placeholder="A short summary of the post..." className="min-h-[100px]" {...field} />
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
                      <Textarea placeholder="Write your blog post content here..." className="min-h-[250px]" {...field} />
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
                      <Input placeholder="tag1, tag2, another-tag" {...field} />
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
                        Make this post visible to the public immediately.
                      </FormDescription>
                    </div>
                    <FormControl>
                       <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
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
                  {isPending ? 'Creating Post...' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
