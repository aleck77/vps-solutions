
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { postFormSchema, type PostFormValues } from '@/lib/schemas';
import { createPostAction } from '@/app/actions/postActions';
import { blogCategories } from '@/types';
import Image from 'next/image'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Sparkles, FileText, Loader2, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';

import { generatePostTitle } from '@/ai/flows/generate-post-title-flow';
import { generatePostContent } from '@/ai/flows/generate-post-content-flow';
import { generatePostImage } from '@/ai/flows/generate-post-image-flow.ts';


export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [state, formAction, isPendingSubmit] = useActionState(createPostAction, undefined);

  const [topicForTitle, setTopicForTitle] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  // generatedImageDataUri now directly holds the value for the form.watch('imageUrl')
  const [imageGenError, setImageGenError] = useState<string | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);


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
  const currentImageUrl = form.watch('imageUrl'); 

  useEffect(() => {
    if (titleValue && !form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
    if (titleValue && (!imagePrompt || imagePrompt === slugify(form.getValues('title')))) {
      setImagePrompt(titleValue);
    }
  }, [titleValue, form, imagePrompt]);
  

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Creating Post',
        description: state.message + (state.errors ? ` ${state.errors.map(e => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);


  const onSubmit = async (data: PostFormValues) => {
     formAction(data); 
  };

  const handleGenerateTitles = async () => {
    if (!topicForTitle.trim()) {
      toast({ title: 'Info', description: 'Please enter a topic to generate titles.', variant: 'default' });
      return;
    }
    setIsGeneratingTitles(true);
    setGeneratedTitles([]);
    try {
      const result = await generatePostTitle({ topic: topicForTitle, count: 3 });
      if (result.titles && result.titles.length > 0 && !result.titles[0].startsWith("AI title generation failed")) {
        setGeneratedTitles(result.titles);
      } else if (result.titles && result.titles[0].startsWith("AI title generation failed")) {
        toast({ title: 'AI Error', description: result.titles[0], variant: 'destructive' });
      } else {
         toast({ title: 'AI Error', description: 'Failed to generate titles: No titles returned.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Error generating titles:', error);
      toast({ title: 'AI Error', description: `Failed to generate titles: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleSelectTitle = (selectedTitle: string) => {
    form.setValue('title', selectedTitle, { shouldValidate: true });
    setImagePrompt(selectedTitle); 
    setGeneratedTitles([]); 
  };

  const handleGenerateContent = async () => {
    const currentTitle = form.getValues('title');
    if (!currentTitle.trim()) {
      toast({ title: 'Info', description: 'Please enter or generate a title first.', variant: 'default' });
      return;
    }
    setIsGeneratingContent(true);
    try {
      const result = await generatePostContent({ title: currentTitle, length: 'medium', outputFormat: 'plaintext' });
       if (result.content && !result.content.startsWith("AI content generation failed")) {
        form.setValue('content', result.content, { shouldValidate: true });
      } else {
        toast({ title: 'AI Error', description: result.content || 'Failed to generate content.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({ title: 'AI Error', description: `Failed to generate content: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({ title: 'Info', description: 'Please enter a topic or prompt for the image.', variant: 'default' });
      return;
    }
    setIsGeneratingImage(true);
    form.setValue('imageUrl', 'https://placehold.co/600x400.png'); // Reset while generating
    setImageGenError(null);
    try {
      const result = await generatePostImage({ prompt: imagePrompt });
      if (result.imageDataUri) {
        form.setValue('imageUrl', result.imageDataUri, { shouldValidate: true }); // Set Data URI in form
        toast({ title: 'Success', description: 'Image generated! Now you can upload it or clear it.' });
      } else {
        setImageGenError(result.error || 'Image generation failed: No image data received.');
        toast({ title: 'AI Image Error', description: result.error || 'Image generation failed.', variant: 'destructive' });
        form.setValue('imageUrl', 'https://placehold.co/600x400.png'); // Reset to placeholder on error
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      const errMsg = error.message || 'Unknown error during image generation.';
      setImageGenError(errMsg);
      toast({ title: 'AI Image Error', description: errMsg, variant: 'destructive' });
      form.setValue('imageUrl', 'https://placehold.co/600x400.png'); // Reset to placeholder on error
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUploadGeneratedImage = async () => {
    const imageDataUri = form.getValues('imageUrl');
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
      toast({ title: 'Info', description: 'Please generate an image first (its Data URI should be in the Image URL field).', variant: 'default' });
      return;
    }
    const postTitle = form.getValues('title');
    if (!postTitle) {
      toast({ title: 'Info', description: 'Please provide a title for the post first (used for filename).', variant: 'default' });
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const postTitleSlug = slugify(postTitle);
      const timestamp = Date.now();
      const filename = `${postTitleSlug}-${timestamp}.png`; 

      const payload = {
        imageDataUri: imageDataUri,
        postTitle: postTitle,
        filename: filename,
      };

      const response = await fetch('https://n8n.artelegis.com.ua/webhook/wp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.imageUrl) {
        form.setValue('imageUrl', result.imageUrl, { shouldValidate: true });
        toast({ title: 'Upload Successful', description: 'Image uploaded and URL updated!' });
      } else {
        // If n8n returns success:true but no imageUrl, it means it's processing. We can leave the Data URI for now or clear.
        // For simplicity, if imageUrl isn't returned, we'll assume it's still the Data URI or an issue.
        if (result.message) {
            toast({ title: 'Upload Info', description: result.message });
        }
        if (!result.imageUrl && result.success) {
            // Keep Data URI for now, or clear if n8n confirms processing.
            // For now, let's leave the Data URI. User can clear if needed.
            toast({ title: 'Upload Started', description: 'n8n confirmed receipt, processing in background.'});
        }
        if (!result.success) {
             throw new Error(result.error || 'Upload failed: Invalid response from server.');
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'An unknown error occurred during upload.');
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClearAiImage = () => {
    form.setValue('imageUrl', 'https://placehold.co/600x400.png', { shouldValidate: true });
    setImageGenError(null);
    setUploadError(null);
    toast({ title: 'Image Reset', description: 'Image URL has been reset to placeholder.' });
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
          <CardDescription>Fill in the details below to add a new post to the blog. Use AI helpers for title, content and image generation.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* AI Title Generation Section */}
          <div className="space-y-4 mb-8 p-4 border rounded-lg shadow-sm bg-muted/30">
            <Label htmlFor="ai-title-topic" className="font-semibold text-lg">AI Title Helper</Label>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="ai-title-topic" className="text-sm">Topic or Keywords for Title</Label>
                <Input 
                  id="ai-title-topic"
                  placeholder="e.g., 'Next.js server components', 'AI in marketing'" 
                  value={topicForTitle}
                  onChange={(e) => setTopicForTitle(e.target.value)}
                  disabled={isGeneratingTitles || isPendingSubmit}
                />
              </div>
              <Button 
                type="button" 
                onClick={handleGenerateTitles} 
                disabled={isGeneratingTitles || !topicForTitle.trim() || isPendingSubmit}
                variant="outline"
                className="bg-accent/10 hover:bg-accent/20 border-accent/30"
              >
                {isGeneratingTitles ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Titles
              </Button>
            </div>
            {generatedTitles.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium">Suggested Titles (click to use):</p>
                <ul className="space-y-1">
                  {generatedTitles.map((title, index) => (
                    <li key={index}>
                      <Button 
                        type="button" 
                        variant="link" 
                        onClick={() => handleSelectTitle(title)}
                        className="p-0 h-auto text-left text-accent hover:underline"
                        disabled={isPendingSubmit}
                      >
                        {title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} disabled={isPendingSubmit || isGeneratingTitles} />
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
                      <Input placeholder="post-slug-will-be-here" {...field} disabled={isPendingSubmit} />
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
                      <Input placeholder="Author's name" {...field} disabled={isPendingSubmit} />
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
                      <Input 
                        type="text" 
                        placeholder="https://placehold.co/600x400.png or Data URI or uploaded image URL" 
                        {...field} 
                        disabled={isPendingSubmit || isGeneratingImage || isUploadingImage}
                      />
                    </FormControl>
                     <FormDescription>
                      URL or Data URI. Paste a URL, or generate with AI then upload. Large Data URIs cannot be saved directly to the database.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* AI Image Generation & Upload Section */}
              <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-muted/30">
                <Label className="font-semibold text-lg">AI Image Helper</Label>
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor="ai-image-prompt" className="text-sm">Image Topic/Prompt (auto-fills from title)</Label>
                    <Input 
                      id="ai-image-prompt"
                      placeholder="e.g., 'A futuristic cityscape', 'Abstract art representing data'" 
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      disabled={isGeneratingImage || isUploadingImage || isPendingSubmit}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleGenerateImage} 
                    disabled={isGeneratingImage || !imagePrompt.trim() || isPendingSubmit || isUploadingImage}
                    variant="outline"
                    className="bg-accent/10 hover:bg-accent/20 border-accent/30"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2" />
                    )}
                    Generate Image
                  </Button>
                </div>
                {isGeneratingImage && <p className="text-sm text-muted-foreground">Generating image, please wait...</p>}
                {imageGenError && <p className="text-sm text-destructive">{imageGenError}</p>}
                
                {currentImageUrl && currentImageUrl.startsWith('data:image/') && !isGeneratingImage && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm font-medium mb-1">Generated Image Preview (unsaved):</p>
                    <Image src={currentImageUrl} alt="Generated AI preview" width={200} height={150} className="rounded-md border object-cover" />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleUploadGeneratedImage}
                        disabled={isUploadingImage || isPendingSubmit || !currentImageUrl.startsWith('data:image/')}
                        variant="outline"
                        className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4 mr-2" />
                        )}
                        Upload to Server
                      </Button>
                      <Button
                        type="button"
                        onClick={handleClearAiImage}
                        disabled={isPendingSubmit || isUploadingImage || isGeneratingImage}
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear AI Image
                      </Button>
                    </div>
                    {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
                  </div>
                )}
                 {/* Preview for the final imageUrl (placeholder or uploaded http/https URL) */}
                {currentImageUrl && currentImageUrl.startsWith('http') && (
                    <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Current Image URL Preview:</p>
                        <Image 
                            src={currentImageUrl} 
                            alt="Current image URL preview" 
                            width={200} 
                            height={150} 
                            className="rounded-md border object-cover" 
                            key={currentImageUrl} // Add key to force re-render on URL change
                            data-ai-hint="current preview"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none'; 
                                const placeholderErrorText = document.createElement('p');
                                placeholderErrorText.textContent = 'Preview not available or URL is invalid.';
                                placeholderErrorText.className = 'text-xs text-destructive';
                                target.parentNode?.insertBefore(placeholderErrorText, target.nextSibling);
                            }}
                        />
                    </div>
                )}
              </div>


              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPendingSubmit}>
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
                      <Textarea placeholder="A short summary of the post..." className="min-h-[100px]" {...field} disabled={isPendingSubmit} />
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
                    <div className="flex justify-between items-center">
                      <FormLabel>Content</FormLabel>
                      <Button 
                        type="button" 
                        onClick={handleGenerateContent} 
                        disabled={isGeneratingContent || !form.getValues('title').trim() || isPendingSubmit}
                        variant="outline"
                        size="sm"
                        className="bg-accent/10 hover:bg-accent/20 border-accent/30"
                      >
                        {isGeneratingContent ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <FileText className="h-4 w-4 mr-2" />
                        )}
                        Generate Content with AI
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="Write your blog post content here..." className="min-h-[250px]" {...field} disabled={isPendingSubmit || isGeneratingContent} />
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
                      <Input placeholder="tag1, tag2, another-tag" {...field} disabled={isPendingSubmit} />
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
                        disabled={isPendingSubmit}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/posts')} disabled={isPendingSubmit}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground" 
                  disabled={isPendingSubmit || isGeneratingImage || isGeneratingContent || isGeneratingTitles || isUploadingImage}
                >
                  {isPendingSubmit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Post...
                    </>
                  ) : (
                    'Create Post'
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
    
