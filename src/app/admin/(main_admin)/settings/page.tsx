
'use client';

import { useEffect, useState, useActionState, startTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { getHomepageContent, getContactInfo, getFooterContent } from '@/lib/firestoreBlog';
import { updateHomepageContentAction, updateContactInfoAction, updateFooterContentAction } from '@/app/actions/settingsActions';
import { homepageContentSchema, contactInfoSchema, footerContentSchema, type HomepageContentValues, type ContactInfoValues, type FooterContentValues } from '@/lib/schemas';
import type { HomepageContent, ContactInfo, FooterContent } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Loader2, Home, Phone, Code, PlusCircle, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


function HomepageSettingsForm({ defaultValues }: { defaultValues: HomepageContent | null }) {
  const { toast } = useToast();
  const form = useForm<HomepageContentValues>({
    resolver: zodResolver(homepageContentSchema),
    defaultValues: defaultValues || {
      heroTitle: '',
      heroSubtitle: '',
      featuresTitle: '',
      features: [{ icon: '', title: '', description: '' }, { icon: '', title: '', description: '' }, { icon: '', title: '', description: '' }],
      ctaTitle: '',
      ctaSubtitle: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const [state, formAction] = useActionState(updateHomepageContentAction, undefined);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
    } else if (state?.success === false) {
      toast({ title: "Error", description: state.message, variant: "destructive" });
    }
  }, [state, toast]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))}
        className="space-y-8"
      >
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="heroTitle" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="heroSubtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Features Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="featuresTitle" render={({ field }) => (<FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">Feature Card {index + 1}</h4>
                  <div className="space-y-2">
                    <FormField control={form.control} name={`features.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Zap, Cpu" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`features.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`features.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Call to Action Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="ctaTitle" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="ctaSubtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
            Save Homepage Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ContactInfoSettingsForm({ defaultValues }: { defaultValues: ContactInfo | null }) {
    const { toast } = useToast();
    const form = useForm<ContactInfoValues>({
        resolver: zodResolver(contactInfoSchema),
        defaultValues: defaultValues || {
            address: '', salesEmail: '', supportEmail: '', phone: '', salesHours: '', supportHours: ''
        },
    });

    const [state, formAction] = useActionState(updateContactInfoAction, undefined);

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.message });
        } else if (state?.success === false) {
            toast({ title: "Error", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);

    return (
        <Form {...form}>
            <form 
                action={formAction}
                onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))} 
                className="space-y-4"
            >
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="salesEmail" render={({ field }) => (<FormItem><FormLabel>Sales Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="supportEmail" render={({ field }) => (<FormItem><FormLabel>Support Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="salesHours" render={({ field }) => (<FormItem><FormLabel>Sales Hours</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="supportHours" render={({ field }) => (<FormItem><FormLabel>Support Hours</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                        Save Contact Info
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function FooterSettingsForm({ defaultValues }: { defaultValues: FooterContent | null }) {
  const { toast } = useToast();
  const form = useForm<FooterContentValues>({
    resolver: zodResolver(footerContentSchema),
    defaultValues: defaultValues || {
      description: '',
      copyright: '',
      socialLinks: [{ name: 'Facebook', href: '#' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  const [state, formAction] = useActionState(updateFooterContentAction, undefined);

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Success!', description: state.message });
    } else if (state?.success === false) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))}
        className="space-y-8"
      >
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Footer Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="copyright" render={({ field }) => (<FormItem><FormLabel>Copyright Text</FormLabel><FormControl><Input {...field} placeholder="e.g., VHost Solutions. All rights reserved." /></FormControl><FormMessage /></FormItem>)} />
        
        <div>
          <Label>Social Media Links</Label>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 bg-muted/50">
                <div className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                           </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`socialLinks.${index}.href`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>URL</FormLabel>
                        <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ name: 'Facebook', href: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Social Link
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
            Save Footer Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}


export default function SiteSettingsPage() {
  const [homepageData, setHomepageData] = useState<HomepageContent | null>(null);
  const [contactData, setContactData] = useState<ContactInfo | null>(null);
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [hpData, cData, fData] = await Promise.all([
        getHomepageContent(),
        getContactInfo(),
        getFooterContent(),
      ]);
      setHomepageData(hpData);
      setContactData(cData);
      setFooterData(fData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-96 w-full" /></CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>Manage global content for your website, such as the homepage and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="homepage">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="homepage"><Home className="mr-2" />Homepage</TabsTrigger>
                    <TabsTrigger value="contact"><Phone className="mr-2" />Contact Info</TabsTrigger>
                    <TabsTrigger value="footer"><Code className="mr-2" />Footer</TabsTrigger>
                </TabsList>
                <TabsContent value="homepage" className="mt-6">
                    <HomepageSettingsForm defaultValues={homepageData} />
                </TabsContent>
                <TabsContent value="contact" className="mt-6">
                    <ContactInfoSettingsForm defaultValues={contactData} />
                </TabsContent>
                <TabsContent value="footer" className="mt-6">
                    <FooterSettingsForm defaultValues={footerData} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
