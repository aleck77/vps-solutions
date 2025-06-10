
import { getAllPostsForAdmin } from '@/lib/firestoreBlog';
import type { BlogPost } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { PlusCircle, FilePenLine, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function PostsAdminPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-3xl text-primary">Manage Blog Posts</CardTitle>
            <Button asChild>
              <Link href="/admin/posts/new" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </Button>
          </div>
          <CardDescription>View, create, edit, and manage all blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
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
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    {/* post.date должен быть объектом Date благодаря processPostDocument */}
                    <TableCell>{post.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={post.published ? 'default' : 'secondary'} className="flex items-center w-fit">
                        {post.published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        {/* Placeholder Link - will go to /admin/posts/edit/[postId] */}
                        <Link href={`/admin/posts/edit/${post.id}`}> 
                          <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No posts found. Create your first post!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PostsAdminPage;
