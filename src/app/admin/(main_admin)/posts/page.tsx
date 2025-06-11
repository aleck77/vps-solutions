
'use client';

import { useEffect, useState, useMemo, useActionState, startTransition } from 'react';
import Link from 'next/link';
import { getAllPostsForAdmin } from '@/lib/firestoreBlog';
import type { BlogPost, BlogCategoryType } from '@/types';
import { blogCategories } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, FilePenLine, Eye, EyeOff, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deletePostAction } from '@/app/actions/postActions';
import { unslugify } from '@/lib/utils';

type DeleteState = {
  success: boolean;
  message: string;
  errors?: any;
} | undefined;

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all'); // category slug or 'all'
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const { toast } = useToast();

  // Action state for deletePostAction
  const [deleteState, submitDeleteAction, isDeletePending] = useActionState<DeleteState, string>(
    async (previousState, postIdToDelete) => {
      setIsDeleting(true);
      const result = await deletePostAction(postIdToDelete);
      setIsDeleting(false);
      if (result.success) {
        toast({ title: 'Post Deleted', description: result.message });
        // Optimistically update UI by removing the post from local state
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postIdToDelete));
      } else {
        toast({ title: 'Error Deleting Post', description: result.message, variant: 'destructive' });
      }
      return result;
    },
    undefined
  );

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const fetchedPosts = await getAllPostsForAdmin();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts for admin:", error);
        toast({ title: 'Error', description: 'Failed to load posts.', variant: 'destructive' });
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, [toast]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const authorMatch = post.author.toLowerCase().includes(searchLower);
      
      const categoryMatch = categoryFilter === 'all' || post.category === categoryFilter;
      
      const statusMatch = statusFilter === 'all' || 
                          (statusFilter === 'published' && post.published) ||
                          (statusFilter === 'draft' && !post.published);
                          
      return (titleMatch || authorMatch) && categoryMatch && statusMatch;
    });
  }, [posts, searchTerm, categoryFilter, statusFilter]);

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
  };

  const confirmDelete = () => {
    if (postToDelete && postToDelete.id) {
      startTransition(() => {
         submitDeleteAction(postToDelete.id!);
      });
    }
    setPostToDelete(null); // Close dialog
  };
  
  const getCategoryDisplayName = (slug: string): string => {
    const foundCategory = blogCategories.find(cat => cat.toLowerCase().replace(/\s+/g, '-') === slug);
    return foundCategory ? unslugify(foundCategory) : unslugify(slug); // unslugify if not found, or just show slug
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-3xl text-primary">Manage Blog Posts</CardTitle>
            <Button asChild>
              <Link href="/admin/posts/new" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </Button>
          </div>
          <CardDescription>View, filter, create, edit, and manage all blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 items-end">
            <div className="flex-grow sm:flex-grow-0 sm:w-auto min-w-[200px]">
              <Label htmlFor="search-posts" className="text-sm font-medium">Search Title/Author</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-posts"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
            <div className="flex-grow sm:flex-grow-0 sm:w-auto min-w-[150px]">
              <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {blogCategories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow sm:flex-grow-0 sm:w-auto min-w-[150px]">
              <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'published' | 'draft')}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all');}} className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          </div>

          {filteredPosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={post.title}>{post.title}</TableCell>
                    <TableCell>{getCategoryDisplayName(post.category)}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{post.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={post.published ? 'default' : 'secondary'} className="flex items-center w-fit">
                        {post.published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/posts/edit/${post.id}`}> 
                          <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(post)} disabled={isDeletePending && postToDelete?.id === post.id}>
                        {isDeletePending && postToDelete?.id === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No posts found matching your criteria. Try adjusting filters or creating a new post!</p>
          )}
        </CardContent>
      </Card>

      {postToDelete && (
        <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post
                titled <span className="font-semibold">"{postToDelete.title}"</span> and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                {isDeletePending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : 'Yes, delete post'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
