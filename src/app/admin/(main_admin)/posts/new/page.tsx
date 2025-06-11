
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
import Image from 'next/image'; // For image preview

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Sparkles, FileText, Loader2, Image as ImageIcon } from 'lucide-react';

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
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);


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

  useEffect(() => {
    if (titleValue && !form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
    // Update image prompt when title changes, if image prompt is empty or matches old title
    if (titleValue && (!imagePrompt || imagePrompt === slugify(form.getValues('title')) /* crude check if it was auto-set */)) {
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
    setImagePrompt(selectedTitle); // Also update image prompt
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
    setGeneratedImageDataUri(null);
    setImageGenError(null);
    try {
      const result = await generatePostImage({ prompt: imagePrompt });
      if (result.imageDataUri) {
        setGeneratedImageDataUri(result.imageDataUri);
        form.setValue('imageUrl', result.imageDataUri, { shouldValidate: true });
        toast({ title: 'Success', description: 'Image generated and URL updated!' });
      } else {
        setImageGenError(result.error || 'Image generation failed: No image data received.');
        toast({ title: 'AI Image Error', description: result.error || 'Image generation failed.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      const errMsg = error.message || 'Unknown error during image generation.';
      setImageGenError(errMsg);
      toast({ title: 'AI Image Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
    }
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
                        type="text" // Changed from "url" to "text"
                        placeholder="https://placehold.co/600x400.png or generated Data URI" 
                        {...field} // Rely on RHF for value
                        disabled={isPendingSubmit || isGeneratingImage}
                      />
                    </FormControl>
                     <FormDescription>
                      URL of the main image for the post. Use https://placehold.co/ or generate with AI.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* AI Image Generation Section */}
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
                      disabled={isGeneratingImage || isPendingSubmit}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleGenerateImage} 
                    disabled={isGeneratingImage || !imagePrompt.trim() || isPendingSubmit}
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
                {isGeneratingImage && <p className="text-sm text-muted-foreground">Generating image, please wait... This can take a few moments.</p>}
                {imageGenError && <p className="text-sm text-destructive">{imageGenError}</p>}
                {generatedImageDataUri && !isGeneratingImage && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Generated Image Preview:</p>
                    <Image src={generatedImageDataUri} alt="Generated AI preview" width={200} height={150} className="rounded-md border object-cover" />
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
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPendingSubmit || isGeneratingImage || isGeneratingContent || isGeneratingTitles}>
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
