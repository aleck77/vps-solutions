
'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { getVpsPlans } from '@/lib/firestoreBlog';
import type { VPSPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FilePenLine, Loader2, Trash2, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deletePlanAction } from '@/app/actions/planActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function PlansAdminPage() {
  const [plans, setPlans] = useState<VPSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<VPSPlan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPlans() {
      setIsLoading(true);
      try {
        const fetchedPlans = await getVpsPlans();
        setPlans(fetchedPlans);
      } catch (error) {
        console.error("Failed to fetch plans for admin:", error);
        toast({ title: 'Error', description: 'Failed to load VPS plans.', variant: 'destructive' });
      }
      setIsLoading(false);
    }
    fetchPlans();
  }, [toast]);

  const handleDeleteClick = (plan: VPSPlan) => {
    setPlanToDelete(plan);
  };
  
  const handleConfirmDelete = () => {
    if (!planToDelete || !planToDelete.id) return;
    
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deletePlanAction(planToDelete.id!);
      if (result.success) {
        toast({ title: 'Plan Deleted', description: result.message });
        setPlans(prevPlans => prevPlans.filter(p => p.id !== planToDelete.id));
      } else {
        toast({ title: 'Error Deleting Plan', description: result.message, variant: 'destructive' });
      }
      setIsDeleting(false);
      setPlanToDelete(null);
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-3xl text-primary flex items-center gap-3"><Server/> Manage VPS Plans</CardTitle>
            <Button asChild>
              <Link href="/admin/plans/new" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Plan
              </Link>
            </Button>
          </div>
          <CardDescription>View, create, edit, and delete VPS hosting plans.</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>RAM</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.priceMonthly.toFixed(2)}</TableCell>
                    <TableCell>{plan.cpu}</TableCell>
                    <TableCell>{plan.ram}</TableCell>
                    <TableCell>{plan.storage}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/plans/edit/${plan.id}`}>
                          <FilePenLine className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(plan)} disabled={isDeleting && planToDelete?.id === plan.id}>
                        {isDeleting && planToDelete?.id === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />} Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No VPS plans found. Create one or seed the database.</p>
          )}
        </CardContent>
      </Card>
      
      {planToDelete && (
        <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
          <AlertDialogContent aria-describedby="alert-dialog-plan-delete-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription id="alert-dialog-plan-delete-description">
                This action cannot be undone. This will permanently delete the plan
                titled <span className="font-semibold">"{planToDelete.name}"</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : 'Yes, delete plan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
