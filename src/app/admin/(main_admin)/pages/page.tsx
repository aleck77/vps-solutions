'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPagesForAdmin } from '@/lib/firestoreBlog';
import type { PageData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FilePenLine, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PagesAdminPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPages() {
      setIsLoading(true);
      try {
        const fetchedPages = await getAllPagesForAdmin();
        setPages(fetchedPages);
      } catch (error) {
        console.error("Failed to fetch pages for admin:", error);
        toast({ title: 'Error', description: 'Failed to load pages.', variant: 'destructive' });
      }
      setIsLoading(false);
    }
    fetchPages();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-3xl text-primary">Manage Site Pages</CardTitle>
            <Button asChild disabled>
              <Link href="/admin/pages/new" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Page (Soon)
              </Link>
            </Button>
          </div>
          <CardDescription>View and edit static pages like "About Us".</CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug (ID)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.id}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/pages/edit/${page.id}`}>
                          <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No manageable pages found. You can seed the database to create the "About Us" page.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
