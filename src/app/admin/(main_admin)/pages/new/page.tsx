'use client';

import { useEffect, useActionState, startTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { createPageFormSchema, type CreatePageFormValues } from '@/lib/schemas';
import { createPageAction } from '@/app/actions/pageActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, PlusCircle, Loader2 } from 'lucide-react';

export default function NewPagePage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageFormSchema),
    defaultValues: {
      title: '',
      slug: '',
    },
    mode: 'onChange',
  });

  const [state, formAction] = useActionState(createPageAction, undefined);

  const titleValue = form.watch('title');
  useEffect(() => {
    if (titleValue && !form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, form]);

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Creating Page',
        description: state.message + (state.errors ? ` ${state.errors.map((e) => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
    // Successful creation is handled by redirect in the action
  }, [state, toast]);

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
            <PlusCircle className="h-7 w-7 mr-3 text-accent" />
            Create New Page
          </CardTitle>
          <CardDescription>
            Create a new static page for your site. The slug will be its URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              onSubmit={form.handleSubmit((data) => {
                startTransition(() => {
                  formAction(data);
                });
              })}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Privacy Policy" {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormDescription>The main title of the page.</FormDescription>
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
                      <Input placeholder="e.g., privacy-policy" {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormDescription>The URL-friendly identifier for the page. Auto-generated from title.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/pages')} disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Page...</>
                  ) : (
                    'Create Page'
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
