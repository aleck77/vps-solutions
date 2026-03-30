
'use client';

import { useActionState, startTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { vpsPlanSchema, type VpsPlanFormValues } from '@/lib/schemas';
import { createPlanAction } from '@/app/actions/planActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, PlusCircle, Loader2, Server } from 'lucide-react';

export default function NewPlanPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<VpsPlanFormValues>({
    resolver: zodResolver(vpsPlanSchema),
    defaultValues: {
      name: '',
      cpu: '',
      ram: '',
      storage: '',
      bandwidth: '',
      priceMonthly: 0,
      features: '',
    },
    mode: 'onChange',
  });

  const [state, formAction] = useActionState(createPlanAction, undefined);

  useEffect(() => {
    if (state?.success === true) {
      toast({ title: 'Success', description: state.message });
      router.push('/admin/plans');
    } else if (state?.success === false) {
      toast({
        title: 'Error Creating Plan',
        description: state.message + (state.errors ? ` ${state.errors.map((e) => e.message).join(', ')}` : ''),
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/plans" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Link>
            </Button>
          </div>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Server className="h-7 w-7 mr-3 text-accent" />
            Create New VPS Plan
          </CardTitle>
          <CardDescription>
            Fill in the details for the new VPS plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                startTransition(() => {
                  formAction(data);
                });
              })}
              className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input placeholder="e.g., Micro VPS" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="priceMonthly" render={({ field }) => (<FormItem><FormLabel>Price (Monthly)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 4.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="cpu" render={({ field }) => (<FormItem><FormLabel>CPU</FormLabel><FormControl><Input placeholder="e.g., 1 vCPU" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ram" render={({ field }) => (<FormItem><FormLabel>RAM</FormLabel><FormControl><Input placeholder="e.g., 512 MiB" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="storage" render={({ field }) => (<FormItem><FormLabel>Storage</FormLabel><FormControl><Input placeholder="e.g., 20GB SSD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bandwidth" render={({ field }) => (<FormItem><FormLabel>Bandwidth</FormLabel><FormControl><Input placeholder="e.g., 500GB" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              
              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Feature 1, Feature 2, Another Feature" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Enter a comma-separated list of features for this plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/plans')} disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</>
                  ) : (
                    <><PlusCircle className="mr-2 h-4 w-4" /> Create Plan</>
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
