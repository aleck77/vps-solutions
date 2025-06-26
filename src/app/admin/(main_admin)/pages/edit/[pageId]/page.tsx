'use client';

import { useEffect, useState, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { pageFormSchema, type PageFormValues } from '@/lib/schemas';
import { updatePageAction } from '@/app/actions/pageActions';
import { getPageBySlug } from '@/lib/firestoreBlog';
import type { PageData } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const pageId = params.pageId as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: '',
      metaDescription: '',
    },
    mode: 'onChange',
  });

  const [state, formAction] = useActionState(updatePageAction.bind(null, pageId), undefined);
  const isPendingSubmit = form.formState.isSubmitting;

  useEffect(() => {
    if (!pageId) {
      toast({ title: 'Error', description: 'Page ID is missing.', variant: 'destructive' });
      router.push('/admin/pages');
      return;
    }

    async function fetchPage() {
      setIsLoading(true);
      try {
        const fetchedData = await getPageBySlug(pageId);
        if (fetchedData) {
          setPageData(fetchedData);
          form.reset({
            title: fetchedData.title,
            metaDescription: fetchedData.metaDescription,
          });
        } else {
          toast({ title: 'Error', description: 'Page not found.', variant: 'destructive' });
          router.push('/admin/pages');
        }
      } catch (error) {
        console.error('Failed to fetch page:', error);
        toast({ title: 'Error', description: 'Failed to load page data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [pageId, form, router, toast]);

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Updating Page',
        description: state.message + (state.errors ? ` ${state.errors.map((e) => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-lg text-destructive">Page not found or failed to load.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/pages">Back to Pages</Link>
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
              <Link href="/admin/pages" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pages
              </Link>
            </Button>
          </div>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Save className="h-7 w-7 mr-3 text-accent" />
            Edit Page: {pageData.title}
          </CardTitle>
          <CardDescription>Update the details of the page below. Content block editing coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              onSubmit={(evt) => {
                evt.preventDefault();
                form.handleSubmit(() => {
                  formAction(form.getValues());
                })(evt);
              }}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter page title" {...field} disabled={isPendingSubmit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description for search engines" className="min-h-[100px]" {...field} disabled={isPendingSubmit} />
                    </FormControl>
                    <FormDescription>This is used for SEO purposes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Content Blocks</FormLabel>
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Under Construction</AlertTitle>
                    <AlertDescription>
                      A visual editor for these content blocks is coming soon. For now, you can view the raw data.
                    </AlertDescription>
                </Alert>
                <Textarea
                  className="min-h-[250px] mt-2 font-mono text-xs bg-muted"
                  disabled
                  value={JSON.stringify(pageData.contentBlocks, null, 2)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/pages')} disabled={isPendingSubmit}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPendingSubmit}>
                  {isPendingSubmit ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Changes...</>
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
