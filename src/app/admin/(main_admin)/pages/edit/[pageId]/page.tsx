
'use client';

import { useEffect, useState, useActionState, startTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { pageFormSchema, type PageFormValues } from '@/lib/schemas';
import { updatePageAction } from '@/app/actions/pageActions';
import { getPageBySlug } from '@/lib/firestoreBlog';
import type { PageData, ContentBlock } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Loader2, Info, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function ContentBlockEditor({ control, index, remove }: { control: any, index: number, remove: (index: number) => void }) {
  const block = control.fields[index];
  
  return (
    <Card className="p-4 bg-muted/50 space-y-4 relative">
        <FormField
          control={control}
          name={`contentBlocks.${index}.type`}
          render={({ field }) => (
              <FormItem>
                  <FormLabel>Block Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                      <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a block type" />
                          </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value="heading">Heading</SelectItem>
                          <SelectItem value="paragraph">Paragraph</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="value_card">Value Card</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )}
        />
        
        {block.type === 'heading' && (
            <>
                <FormField control={control} name={`contentBlocks.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Text</FormLabel><FormControl><Input {...field} placeholder="Heading text" /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name={`contentBlocks.${index}.level`} render={({ field }) => ( <FormItem><FormLabel>Level (1-6)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 2" /></FormControl><FormMessage /></FormItem> )} />
            </>
        )}
        
        {block.type === 'paragraph' && (
            <FormField control={control} name={`contentBlocks.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Text</FormLabel><FormControl><Textarea {...field} placeholder="Paragraph content..." className="min-h-[120px]"/></FormControl><FormMessage /></FormItem> )} />
        )}

        {block.type === 'image' && (
            <>
                <FormField control={control} name={`contentBlocks.${index}.url`} render={({ field }) => ( <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name={`contentBlocks.${index}.alt`} render={({ field }) => ( <FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} placeholder="Description of the image" /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name={`contentBlocks.${index}.dataAiHint`} render={({ field }) => ( <FormItem><FormLabel>AI Hint</FormLabel><FormControl><Input {...field} placeholder="e.g., 'team office'" /></FormControl><FormMessage /></FormItem> )} />
            </>
        )}
        
        {block.type === 'value_card' && (
            <>
                 <FormField control={control} name={`contentBlocks.${index}.icon`} render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="zap">Zap (Innovation)</SelectItem>
                                <SelectItem value="users">Users (Customer Focus)</SelectItem>
                                <SelectItem value="shield_check">Shield (Reliability)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem> 
                )} />
                <FormField control={control} name={`contentBlocks.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Card Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Innovation" /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={control} name={`contentBlocks.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Card Text</FormLabel><FormControl><Textarea {...field} placeholder="Description for the card..." /></FormControl><FormMessage /></FormItem> )} />
            </>
        )}

        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
        </Button>
    </Card>
  );
}


export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const pageId = params.pageId as string;

  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: '',
      metaDescription: '',
      contentBlocks: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contentBlocks",
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
          form.reset({
            title: fetchedData.title,
            metaDescription: fetchedData.metaDescription,
            contentBlocks: fetchedData.contentBlocks || [],
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
            Edit Page: {form.getValues('title')}
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content Blocks</h3>
                {fields.map((field, index) => (
                   <ContentBlockEditor key={field.id} control={form.control} index={index} remove={remove} />
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ type: 'paragraph', text: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Paragraph Block
                </Button>
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
