
'use client';

import { useEffect, useState, useMemo, startTransition, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsForAdmin } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import { blogCategories } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, FilePenLine, Eye, EyeOff, Trash2, Search, Filter, Loader2, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deletePostAction, deleteMultiplePostsAction } from '@/app/actions/postActions';
import { unslugify } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false); 
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

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

  const handleSingleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
  };
  
  const handleConfirmSingleDelete = () => {
    if (!postToDelete || !postToDelete.id) return;
    const idToDelete = postToDelete.id;
    
    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deletePostAction(idToDelete);
        if (result.success) {
          toast({ title: 'Post Deleted', description: result.message });
          setPosts(prevPosts => prevPosts.filter(p => p.id !== idToDelete));
          setSelectedPostIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(idToDelete);
            return newSet;
          });
        } else {
          toast({ title: 'Error Deleting Post', description: result.message, variant: 'destructive' });
        }
      } catch (error: any) {
        toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
      } finally {
        setIsDeleting(false);
        setPostToDelete(null);
      }
    });
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    setSelectedPostIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  const handleSelectAllClick = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedPostIds(new Set(filteredPosts.map(p => p.id!)));
    } else {
      setSelectedPostIds(new Set());
    }
  };
  
  const isAllSelected = filteredPosts.length > 0 && selectedPostIds.size === filteredPosts.length;
  const isIndeterminate = selectedPostIds.size > 0 && selectedPostIds.size < filteredPosts.length;

   useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.dataset.state = isIndeterminate ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked');
    }
  }, [isIndeterminate, isAllSelected]);

  const handleBulkDeleteClick = () => {
    if (selectedPostIds.size > 0) {
      setShowBulkDeleteDialog(true); 
    }
  };

  const handleConfirmBulkDelete = () => {
    if (selectedPostIds.size === 0) return;
    const idsToDelete = Array.from(selectedPostIds);
    
    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deleteMultiplePostsAction(idsToDelete);
        if (result.success) {
          toast({ title: 'Posts Deleted', description: result.message });
          setPosts(prevPosts => prevPosts.filter(p => p.id && !idsToDelete.includes(p.id)));
          setSelectedPostIds(new Set());
        } else {
          toast({ title: 'Error Deleting Posts', description: result.message, variant: 'destructive' });
        }
      } catch (error: any) {
        toast({ title: 'Operation Failed', description: error.message, variant: 'destructive' });
      } finally {
        setIsDeleting(false);
        setShowBulkDeleteDialog(false);
      }
    });
  };
  
  const getCategoryDisplayName = (slug: string): string => {
    const foundCategory = blogCategories.find(cat => cat.toLowerCase().replace(/\s+/g, '-') === slug);
    return foundCategory ? unslugify(foundCategory) : unslugify(slug);
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
          <div className="mb-6 space-y-4">
            <div className="sm:flex sm:flex-wrap sm:gap-4 items-end">
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
              <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); setSelectedPostIds(new Set());}} className="w-full sm:w-auto mt-4 sm:mt-0">
                <Filter className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            </div>
            {selectedPostIds.size > 0 && (
              <div className="mt-4">
                <Button variant="destructive" onClick={handleBulkDeleteClick} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedPostIds.size})
                  {isDeleting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                </Button>
              </div>
            )}
          </div>

          {filteredPosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      ref={selectAllCheckboxRef}
                      id="select-all-posts"
                      aria-label="Select all posts"
                      checked={isAllSelected || isIndeterminate}
                      onCheckedChange={(checked) => handleSelectAllClick(checked)}
                      className="translate-y-[2px]"
                    >
                      {isIndeterminate && <Minus className="h-4 w-4" />}
                    </Checkbox>
                  </TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
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
                  <TableRow key={post.id} data-state={selectedPostIds.has(post.id!) ? "selected" : ""}>
                    <TableCell>
                      <Checkbox
                        id={`select-post-${post.id}`}
                        aria-label={`Select post ${post.title}`}
                        checked={selectedPostIds.has(post.id!)}
                        onCheckedChange={(checked) => handleSelectPost(post.id!, !!checked)}
                        className="translate-y-[2px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={50}
                        height={50}
                        className="rounded object-cover aspect-square"
                        data-ai-hint={post.dataAiHint || "thumbnail"}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={post.title}>{post.title}</TableCell>
                    <TableCell>{getCategoryDisplayName(post.category)}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
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
                      <Button variant="destructive" size="sm" onClick={() => handleSingleDeleteClick(post)} disabled={isDeleting && postToDelete?.id === post.id}>
                        {isDeleting && postToDelete?.id === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Delete
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
          <AlertDialogContent aria-describedby="alert-dialog-single-delete-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription id="alert-dialog-single-delete-description">
                This action cannot be undone. This will permanently delete the post
                titled <span className="font-semibold">"{postToDelete.title}"</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSingleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : 'Yes, delete post'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showBulkDeleteDialog && selectedPostIds.size > 0 && (
         <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent aria-describedby="alert-dialog-bulk-delete-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
              <AlertDialogDescription id="alert-dialog-bulk-delete-description">
                Are you sure you want to delete {selectedPostIds.size} selected post(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} onClick={() => setShowBulkDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmBulkDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : `Yes, delete ${selectedPostIds.size} posts`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
