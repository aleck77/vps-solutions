
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Server } from 'lucide-react';
import { getVpsPlans } from '@/lib/firestoreBlog';
import type { VPSPlan } from '@/types';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const orderFormSchema = z.object({
  planId: z.string().min(1, { message: 'Please select a VPS plan.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  companyName: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'paypal', 'crypto'], { required_error: 'Please select a payment method.' }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

// Server action placeholder for order processing
async function processOrder(data: OrderFormValues, selectedPlanDetails: VPSPlan | undefined) {
  console.log('Processing order:', data);
  const orderId = `VPS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  if (!selectedPlanDetails) {
    throw new Error('Selected plan details are missing.');
  }

  const webhookPayload = {
    email: data.email,
    name: data.name,
    order_number: orderId,
    source_amount: `${selectedPlanDetails.cpu}, ${selectedPlanDetails.ram} → $${selectedPlanDetails.priceMonthly.toFixed(2)}`,
  };

  try {
    const response = await fetch("https://n8n.artelegis.com.ua/webhook/brevo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Webhook response error:", response.status, errorBody);
      throw new Error(`Webhook failed with status: ${response.status}. ${errorBody}`);
    }
    console.log("Order data sent to webhook successfully.");
  } catch (error) {
    console.error("Error sending data to webhook:", error);
    throw new Error('Failed to communicate with the order processing service.');
  }

  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, orderId: orderId };
}

function OrderPageSkeleton() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
              <Skeleton className="h-12 w-full mt-4" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
           <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<VPSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialPlanId = searchParams.get('plan');
  
  const [selectedPlan, setSelectedPlan] = useState<VPSPlan | undefined>();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      planId: '',
      name: '',
      email: '',
      companyName: '',
      paymentMethod: 'crypto', // Set default to crypto as it's the only visible option now
    },
  });

  useEffect(() => {
    async function fetchPlans() {
      setIsLoading(true);
      try {
        const fetchedPlans = await getVpsPlans();
        setPlans(fetchedPlans);

        const planIdFromUrl = searchParams.get('plan');
        let planToSelect = fetchedPlans[0];

        if (planIdFromUrl) {
          const foundPlan = fetchedPlans.find(p => p.id === planIdFromUrl);
          if(foundPlan) planToSelect = foundPlan;
        }

        if (planToSelect) {
            form.setValue('planId', planToSelect.id!);
            setSelectedPlan(planToSelect);
        }

      } catch (error) {
        toast({ title: "Error", description: "Could not load VPS plans.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, [searchParams, form, toast]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'planId' && value.planId) {
        setSelectedPlan(plans.find(p => p.id === value.planId));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, plans]);


  async function onSubmit(data: OrderFormValues) {
    try {
      const currentSelectedPlan = plans.find(p => p.id === data.planId);
      if (!currentSelectedPlan) {
        toast({
          title: 'Error',
          description: 'Selected plan not found. Please select a plan.',
          variant: 'destructive',
        });
        return;
      }
      const result = await processOrder(data, currentSelectedPlan);
      if (result.success) {
        toast({
          title: 'Order Successful!',
          description: `Your VPS order (ID: ${result.orderId}) has been placed. We'll be in touch shortly.`,
        });
        form.reset({ 
            planId: data.planId, // Keep the selected plan
            name: '', 
            email: '', 
            companyName: '', 
            paymentMethod: 'crypto' // Reset to crypto
        });
      } else {
        throw new Error('Order processing failed.');
      }
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: (error as Error).message || 'There was an issue processing your order. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return <OrderPageSkeleton />;
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Order Your VPS</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Choose a plan and configure your high-performance Virtual Private Server.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Server className="h-7 w-7 mr-3 text-accent" />
              Configure Your VPS
            </CardTitle>
            <CardDescription>Select your desired plan and provide your details to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Plan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a VPS plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id!}>
                              {plan.name} ({plan.cpu}, {plan.ram}) - ${plan.priceMonthly.toFixed(2)}/mo
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" disabled={form.formState.isSubmitting || !selectedPlan}>
                  {form.formState.isSubmitting ? 'Processing...' : `Order Now & Pay $${selectedPlan?.priceMonthly.toFixed(2) || '0.00'}/mo`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {selectedPlan && (
          <Card className="md:sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{selectedPlan.name}</CardTitle>
              <CardDescription>Summary of your selected plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-accent">${selectedPlan.priceMonthly.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>CPU:</strong> {selectedPlan.cpu}</li>
                <li><strong>RAM:</strong> {selectedPlan.ram}</li>
                <li><strong>Storage:</strong> {selectedPlan.storage}</li>
                <li><strong>Bandwidth:</strong> {selectedPlan.bandwidth}</li>
              </ul>
              <h4 className="font-semibold pt-2">Features:</h4>
              <ul className="space-y-1 text-sm">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    You will be charged ${selectedPlan.priceMonthly.toFixed(2)} monthly. You can cancel anytime.
                </p>
            </CardFooter>
          </Card>
        )}
         {!selectedPlan && plans.length > 0 && (
          <Card className="md:sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">Select a Plan</CardTitle>
              <CardDescription>Choose a plan to see its details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Please select a VPS plan from the form to see its summary.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


export default function OrderPage() {
  return (
    <Suspense fallback={<OrderPageSkeleton />}>
      <OrderForm />
    </Suspense>
  )
}
