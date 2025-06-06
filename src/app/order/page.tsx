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
import { mockVpsPlans } from '@/data/vpsPlans';
import type { VPSPlan } from '@/types';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
    // You might want to include companyName and paymentMethod if your n8n workflow can use them
    // companyName: data.companyName,
    // paymentMethod: data.paymentMethod,
  };

  // Simulate API call to n8n backend
  try {
    const response = await fetch("https://n8n.artelegis.com.ua/webhook/brevo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      // Log more details for non-ok responses
      const errorBody = await response.text();
      console.error("Webhook response error:", response.status, errorBody);
      throw new Error(`Webhook failed with status: ${response.status}. ${errorBody}`);
    }
    console.log("Order data sent to webhook successfully.");
  } catch (error) {
    console.error("Error sending data to webhook:", error);
    throw new Error('Failed to communicate with the order processing service.');
  }

  await new Promise(resolve => setTimeout(resolve, 1500)); // Keep simulation for UI feedback
  // Simulate success
  return { success: true, orderId: orderId };
}

export default function OrderPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('plan') || (mockVpsPlans.length > 0 ? mockVpsPlans[0].id : '');
  
  const [selectedPlan, setSelectedPlan] = useState<VPSPlan | undefined>(
    mockVpsPlans.find(p => p.id === initialPlanId)
  );

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      planId: initialPlanId,
      name: '',
      email: '',
      companyName: '',
      paymentMethod: undefined,
    },
  });

  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl) {
      const foundPlan = mockVpsPlans.find(p => p.id === planFromUrl);
      form.setValue('planId', planFromUrl);
      setSelectedPlan(foundPlan);
    } else if (mockVpsPlans.length > 0 && !form.getValues('planId')) {
      // Set a default if no plan in URL and no planId already set
      form.setValue('planId', mockVpsPlans[0].id);
      setSelectedPlan(mockVpsPlans[0]);
    }
  }, [searchParams, form]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'planId' && value.planId) {
        setSelectedPlan(mockVpsPlans.find(p => p.id === value.planId));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  async function onSubmit(data: OrderFormValues) {
    try {
      const currentSelectedPlan = mockVpsPlans.find(p => p.id === data.planId);
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
            paymentMethod: undefined 
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

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Order Your VPS</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Choose a plan and configure your high-performance Virtual Private Server.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8 items-start">
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
                          {mockVpsPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
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
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
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
          <Card className="sticky top-24 shadow-lg">
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
         {!selectedPlan && mockVpsPlans.length > 0 && (
          <Card className="sticky top-24 shadow-lg">
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