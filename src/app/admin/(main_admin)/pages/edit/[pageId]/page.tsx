
'use client';

import { useEffect, useState, useActionState, startTransition } from 'react';
import { useForm, useFieldArray, useController, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { pageFormSchema, type PageFormValues } from '@/lib/schemas';
import { updatePageAction } from '@/app/actions/pageActions';
import { uploadImageAction } from '@/app/actions/uploadActions';
import { getPageBySlug } from '@/lib/firestoreBlog';
import type { PageData } from '@/types';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Loader2, PlusCircle, Trash2, UploadCloud, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function toPascalCase(str: string) {
  if (!str) return '';
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function ImageBlockUploader({ control, index, form }: { control: any, index: number, form: any }) {
  const { field } = useController({ name: `contentBlocks.${index}`, control });
  const { toast } = useToast();

  const [preview, setPreview] = useState<string | null>(field.value.url || null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const pageTitle = form.getValues('title');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({ title: "File too large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please select a JPG, PNG, or WEBP image.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setDataUri(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!dataUri) {
      toast({ title: "No new image selected", description: "Please select a file to upload first.", variant: "default" });
      return;
    }
    if (!pageTitle) {
      toast({ title: "Cannot Upload", description: "Please set a page title before uploading images.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    startTransition(async () => {
      const result = await uploadImageAction(dataUri, pageTitle, 'page-images/');
      if (result.success && result.imageUrl) {
        form.setValue(`contentBlocks.${index}.url`, result.imageUrl, { shouldValidate: true });
        toast({ title: "Success", description: result.message });
        setPreview(result.imageUrl);
        setDataUri(null); // Clear the data URI after successful upload
      } else {
        toast({ title: "Upload Failed", description: result.message, variant: "destructive" });
      }
      setIsUploading(false);
    });
  };
  
  const currentUrl = useWatch({ control, name: `contentBlocks.${index}.url` });
  useEffect(() => {
    if (currentUrl !== preview && !dataUri) {
        setPreview(currentUrl);
    }
  }, [currentUrl, preview, dataUri]);


  return (
    <>
      <FormField
        control={control}
        name={`contentBlocks.${index}.url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://... or upload a file below" disabled={isUploading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Upload New Image</FormLabel>
        <div className="flex items-center gap-2">
            <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="flex-grow" disabled={isUploading}/>
            <Button type="button" onClick={handleUpload} disabled={isUploading || !dataUri}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            </Button>
        </div>
        <FormDescription>Max 2MB. Replaces the URL above upon successful upload.</FormDescription>
      </div>

      {preview && (
        <div className="mt-2">
          <FormLabel>Preview</FormLabel>
          <div className="mt-1 relative w-full aspect-video rounded-md border overflow-hidden bg-muted">
            <Image src={preview} alt="Image preview" fill className="object-cover" />
          </div>
        </div>
      )}

      <FormField control={control} name={`contentBlocks.${index}.alt`} render={({ field }) => ( <FormItem><FormLabel>Alt Text</FormLabel><FormControl><Input {...field} placeholder="Description of the image" /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={control} name={`contentBlocks.${index}.dataAiHint`} render={({ field }) => ( <FormItem><FormLabel>AI Hint</FormLabel><FormControl><Input {...field} placeholder="e.g., 'team office'" /></FormControl><FormMessage /></FormItem> )} />
    </>
  );
}


function ContentBlockEditor({ control, index, remove, form, fieldId }: { control: any, index: number, remove: (index: number) => void, form: any, fieldId: string }) {
  const blockType = useWatch({
    control,
    name: `contentBlocks.${index}.type`,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: fieldId});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} >
      <Card className="p-4 bg-muted/50 space-y-4 relative">
        <button type="button" {...attributes} {...listeners} className="absolute top-2 left-2 cursor-grab active:cursor-grabbing text-muted-foreground p-1">
          <GripVertical className="h-5 w-5" />
        </button>
        <FormField
          control={control}
          name={`contentBlocks.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Block Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        
        {blockType === 'heading' && (
          <>
            <FormField control={control} name={`contentBlocks.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Text</FormLabel><FormControl><Input {...field} placeholder="Heading text" /></FormControl><FormMessage /></FormItem> )} />
            <FormField
              control={control}
              name={`contentBlocks.${index}.level`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level (1-6)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      placeholder="e.g., 2" 
                      onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {blockType === 'paragraph' && (
           <FormField
            control={control}
            name={`contentBlocks.${index}.text`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                   <MarkdownEditor {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {blockType === 'image' && (
            <ImageBlockUploader control={control} index={index} form={form} />
        )}
        
        {blockType === 'value_card' && (
          <>
            <FormField
              control={control}
              name={`contentBlocks.${index}.icon`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 'Server', 'Cloud', 'ShieldCheck'" />
                  </FormControl>
                  <FormDescription>
                    Enter any valid icon name from{' '}
                    <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                      lucide.dev
                    </a> (use PascalCase, e.g., ShieldCheck).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={control} name={`contentBlocks.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Card Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Innovation" /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={control} name={`contentBlocks.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>Card Text</FormLabel><FormControl><Textarea {...field} placeholder="Description for the card..." /></FormControl><FormMessage /></FormItem> )} />
          </>
        )}

        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </Card>
    </div>
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

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "contentBlocks",
  });

  const [state, formAction] = useActionState(updatePageAction.bind(null, pageId), undefined);
  
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
            // Add a unique ID to each block for dnd-kit
            contentBlocks: fetchedData.contentBlocks?.map(block => ({...block, id: Math.random().toString()})) || [],
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

  const addNewBlock = (type: 'heading' | 'paragraph' | 'image' | 'value_card') => {
    let newBlock: any;
    switch (type) {
      case 'heading':
        newBlock = { type: 'heading', text: 'New Heading', level: 2 };
        break;
      case 'paragraph':
        newBlock = { type: 'paragraph', text: '' };
        break;
      case 'image':
        newBlock = { type: 'image', url: 'https://placehold.co/600x400.png', alt: 'placeholder', dataAiHint: 'placeholder image' };
        break;
      case 'value_card':
        newBlock = { type: 'value_card', icon: 'Zap', title: 'New Value', text: 'Description' };
        break;
      default:
        return;
    }
    append({...newBlock, id: Math.random().toString()});
  };

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  }

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
          <CardDescription>Update the details of the page below. Drag and drop content blocks to reorder them.</CardDescription>
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
                      <Input placeholder="Enter page title" {...field} disabled={form.formState.isSubmitting} />
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
                      <Textarea placeholder="A short description for search engines" className="min-h-[100px]" {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormDescription>This is used for SEO purposes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content Blocks</h3>
                <div className="space-y-4">
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map(field => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {fields.map((field, index) => (
                        <ContentBlockEditor key={field.id} fieldId={field.id} control={form.control} index={index} remove={remove} form={form}/>
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
                 <div className="flex flex-wrap gap-2 pt-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => addNewBlock('heading')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Heading
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => addNewBlock('paragraph')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Paragraph
                    </Button>
                     <Button type="button" variant="outline" size="sm" onClick={() => addNewBlock('image')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                    </Button>
                     <Button type="button" variant="outline" size="sm" onClick={() => addNewBlock('value_card')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Value Card
                    </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/pages')} disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
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
