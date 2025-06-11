
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { ArrowLeft, Save, Loader2, Sparkles, FileText, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import { generatePostTitle } from '@/ai/flows/generate-post-title-flow';
import { generatePostContent } from '@/ai/flows/generate-post-content-flow';
import { generatePostImage } from '@/ai/flows/generate-post-image-flow';


export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const postId = params.postId as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  // AI Helper States
  const [topicForTitle, setTopicForTitle] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGeneratedPreviewUri, setAiGeneratedPreviewUri] = useState<string | null>(null);
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
  const currentSlugValue = form.watch('slug');
  const currentImageUrlFromForm = form.watch('imageUrl');

  // Effect to auto-generate slug from title if slug is not manually changed by user
  useEffect(() => {
    // Only update slug if title is present AND (slug field is not dirty OR (slugify(title) is different from currentSlug AND currentSlug is the original slug from fetched post))
    // This allows user to manually edit the slug and it won't be overridden by title changes,
    // unless the slug field hasn't been touched or still matches the original slug.
    if (post && titleValue) {
        const titleSlug = slugify(titleValue);
        if (!form.formState.dirtyFields.slug || (titleSlug !== currentSlugValue && post.slug === currentSlugValue)) {
            form.setValue('slug', titleSlug, { shouldValidate: true });
        }
    } else if (titleValue && !form.formState.dirtyFields.slug) {
        // Fallback for initial load before 'post' is set, or if post has no slug (new post scenario, though this is edit page)
        form.setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, form, currentSlugValue, post]);

  // Auto-fill imagePrompt from title if imagePrompt is empty or matches the current title
   useEffect(() => {
    if (titleValue && (!imagePrompt || imagePrompt === titleValue || (post && imagePrompt === post.title))) {
      setImagePrompt(titleValue);
    }
  }, [titleValue, imagePrompt, post]);


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
          const originalCategoryName = blogCategories.find(cat => slugify(cat) === fetchedPost.category) || fetchedPost.category;
          form.reset({
            title: fetchedPost.title,
            slug: fetchedPost.slug,
            author: fetchedPost.author,
            imageUrl: fetchedPost.imageUrl,
            category: originalCategoryName,
            excerpt: fetchedPost.excerpt,
            content: fetchedPost.content,
            tags: fetchedPost.tags?.join(', ') || '',
            published: fetchedPost.published,
          });
          // Initialize AI helpers based on fetched post
          setTopicForTitle(fetchedPost.title); // For generating new titles based on current
          setImagePrompt(fetchedPost.title); // For generating new images based on current
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

  const [state, formAction, isPendingSubmit] = useActionState(updatePostAction.bind(null, postId), undefined);

  useEffect(() => {
    if (state?.success === false && state.message) {
      toast({
        title: 'Error Updating Post',
        description: state.message + (state.errors ? ` ${state.errors.map(e => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const onSubmit = async (data: PostFormValues) => {
    formAction(data);
  };

  // AI Helper Functions (similar to NewPostPage)
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
      toast({ title: 'Info', description: 'Please provide a title first.', variant: 'default' });
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
      toast({ title: 'AI Error', description: `Failed to generate content: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsGeneratingContent(false);
    }
  };
  
  function dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({ title: 'Info', description: 'Please enter a topic or prompt for the image.', variant: 'default' });
      return;
    }
    setIsGeneratingImage(true);
    setAiGeneratedPreviewUri(null);
    setImageGenError(null);
    try {
      const result = await generatePostImage({ prompt: imagePrompt });
      if (result.imageDataUri) {
        setAiGeneratedPreviewUri(result.imageDataUri);
        toast({ title: 'Success', description: 'Image generated! Now you can upload it or clear it.' });
      } else {
        setImageGenError(result.error || 'Image generation failed: No image data received.');
        toast({ title: 'AI Image Error', description: result.error || 'Image generation failed.', variant: 'destructive' });
      }
    } catch (error: any) {
      const errMsg = error.message || 'Unknown error during image generation.';
      setImageGenError(errMsg);
      toast({ title: 'AI Image Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUploadGeneratedImage = async () => {
    if (!aiGeneratedPreviewUri) {
      toast({ title: 'Info', description: 'Please generate an image first.', variant: 'default' });
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
      const postTitleSlug = slugify(postTitle) || 'untitled-image';
      const timestamp = Date.now();
      const filename = `${postTitleSlug}-${timestamp}.png`;

      const payload = {
        imageDataUri: aiGeneratedPreviewUri,
        postTitle: postTitle,
        filename: filename,
      };
      
      console.log('[handleUploadGeneratedImage] Sending to n8n:', JSON.stringify(payload, (k,v) => k === "imageDataUri" ? v.substring(0,50) + "..." : v));

      const response = await fetch('https://n8n.artelegis.com.ua/webhook/wp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('[handleUploadGeneratedImage] Raw response from n8n:', responseText);

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}. Raw Response: ${responseText.substring(0, 500)}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorDetail = errorJson.error || errorJson.message || JSON.stringify(errorJson);
        } catch (e) { /* Not JSON */ }
        throw new Error(`Upload failed: ${errorDetail}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('[handleUploadGeneratedImage] Parsed n8n response:', result);
      } catch (jsonError: any) {
        console.error('[handleUploadGeneratedImage] Failed to parse n8n response as JSON:', jsonError.message);
        throw new Error(`Upload failed: Could not parse JSON response from server. Server said: ${responseText.substring(0,500)}`);
      }

      if (result && typeof result.success === 'boolean') {
        if (result.success) {
          if (result.imageUrl) {
            form.setValue('imageUrl', result.imageUrl, { shouldValidate: true });
            setAiGeneratedPreviewUri(null);
            toast({ title: 'Upload Successful', description: 'Image uploaded and URL updated!' });
          } else {
            toast({ title: 'Upload Acknowledged', description: result.message || 'n8n confirmed receipt, but no imageUrl returned. Form not updated.' });
          }
        } else {
          throw new Error(result.error || result.message || 'Upload failed: n8n reported an error.');
        }
      } else {
         console.error('[handleUploadGeneratedImage] n8n response JSON does not have a boolean "success" field. Response:', result);
         throw new Error('Upload failed: Invalid response structure from server. Expected a "success" field.');
      }
    } catch (error: any) {
      const detailedError = error.message || 'An unknown error occurred during upload.';
      setUploadError(detailedError);
      toast({ title: 'Upload Failed', description: detailedError, variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClearAiImage = () => {
    setAiGeneratedPreviewUri(null);
    form.setValue('imageUrl', post?.imageUrl || 'https://placehold.co/600x400.png', { shouldValidate: true }); // Reset to original or placeholder
    setImageGenError(null);
    setUploadError(null);
    toast({ title: 'Image Reset', description: 'AI generated image cleared. Image URL reset to original or placeholder.' });
  };
  
  const imagePreviewSrc = aiGeneratedPreviewUri || currentImageUrlFromForm;


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
          <CardDescription>Update the details of the blog post below. Use AI helpers for title, content and image.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* AI Title Helper */}
          <div className="space-y-4 mb-8 p-4 border rounded-lg shadow-sm bg-muted/30">
            <Label htmlFor="ai-title-topic" className="font-semibold text-lg">AI Title Helper</Label>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="ai-title-topic" className="text-sm">Current Title or New Topic for Suggestions</Label>
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
                {isGeneratingTitles ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Titles
              </Button>
            </div>
            {generatedTitles.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium">Suggested Titles (click to use):</p>
                <ul className="space-y-1">
                  {generatedTitles.map((title, index) => (
                    <li key={index}>
                      <Button type="button" variant="link" onClick={() => handleSelectTitle(title)} className="p-0 h-auto text-left text-accent hover:underline" disabled={isPendingSubmit}>
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
                    <FormDescription>The URL-friendly version of the title. Usually auto-generated.</FormDescription>
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
                        placeholder="https://placehold.co/600x400.png or uploaded image URL" 
                        {...field}
                        disabled={isPendingSubmit || isGeneratingImage || isUploadingImage}
                      />
                    </FormControl>
                    <FormDescription>Final image URL. Generate with AI then upload, or paste a URL directly.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* AI Image Helper Section */}
              <div className="space-y-4 p-4 border rounded-lg shadow-sm bg-muted/30">
                <Label className="font-semibold text-lg">AI Image Helper</Label>
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor="ai-image-prompt" className="text-sm">Image Topic/Prompt (auto-fills from title)</Label>
                    <Input 
                      id="ai-image-prompt"
                      placeholder="e.g., 'A futuristic cityscape'" 
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
                    {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                    Generate Image
                  </Button>
                </div>
                {isGeneratingImage && <p className="text-sm text-muted-foreground">Generating image, please wait...</p>}
                {imageGenError && <p className="text-sm text-destructive">{imageGenError}</p>}
                
                {imagePreviewSrc && (imagePreviewSrc.startsWith('data:image/') || imagePreviewSrc.startsWith('http')) && !isGeneratingImage && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm font-medium mb-1">
                      {aiGeneratedPreviewUri ? "AI Generated Image Preview (unsaved):" : "Current Image URL Preview:"}
                    </p>
                    <Image 
                      src={imagePreviewSrc} 
                      alt={aiGeneratedPreviewUri ? "Generated AI preview" : "Current image URL preview"}
                      width={200} height={150} 
                      className="rounded-md border object-cover"
                      key={imagePreviewSrc} 
                      data-ai-hint={aiGeneratedPreviewUri ? "ai generated" : (imagePrompt || "url preview")}
                      onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none'; 
                          const parent = target.parentNode;
                          if (parent && !parent.querySelector('.preview-error-text')) {
                            const errorText = document.createElement('p');
                            errorText.textContent = 'Preview not available or URL is invalid.';
                            errorText.className = 'text-xs text-destructive preview-error-text';
                            parent.appendChild(errorText);
                          }
                      }}
                    />
                    {aiGeneratedPreviewUri && (
                      <div className="flex gap-2">
                        <Button type="button" onClick={handleUploadGeneratedImage} disabled={isUploadingImage || isPendingSubmit} variant="outline" className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700">
                          {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                          Upload to Server
                        </Button>
                        <Button type="button" onClick={handleClearAiImage} disabled={isPendingSubmit || isUploadingImage || isGeneratingImage} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear AI Image
                        </Button>
                      </div>
                    )}
                    {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPendingSubmit}>
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
                      <Button type="button" onClick={handleGenerateContent} disabled={isGeneratingContent || !form.getValues('title').trim() || isPendingSubmit} variant="outline" size="sm" className="bg-accent/10 hover:bg-accent/20 border-accent/30">
                        {isGeneratingContent ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        Generate Content with AI
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="Write your blog post content here..." className="min-h-[250px]" {...field} disabled={isPendingSubmit || isGeneratingContent} />
                    </FormControl>
                    <FormDescription>The main content of the blog post. Markdown is not yet supported, use plain text or HTML.</FormDescription>
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
                    <FormDescription>Comma-separated list of tags (e.g., AI, Next.js, Tutorial).</FormDescription>
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
                      <FormDescription>Make this post visible to the public.</FormDescription>
                    </div>
                    <FormControl>
                       <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPendingSubmit} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => router.push('/admin/posts')} disabled={isPendingSubmit}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPendingSubmit || isGeneratingImage || isGeneratingContent || isGeneratingTitles || isUploadingImage}>
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
