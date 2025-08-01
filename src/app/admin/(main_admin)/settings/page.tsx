
'use client';

import { useEffect, useState, useActionState, startTransition, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { getHomepageContent, getContactInfo, getFooterContent, getGeneralSettings } from '@/lib/firestoreBlog';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

import { 
  updateHomepageContentAction, 
  updateContactInfoAction, 
  updateFooterContentAction,
  updateGeneralSettingsAction
} from '@/app/actions/settingsActions';

import { 
  homepageContentSchema, 
  contactInfoSchema, 
  footerContentSchema,
  generalSettingsSchema,
  type HomepageContentValues, 
  type ContactInfoValues, 
  type FooterContentValues,
  type GeneralSettingsValues
} from '@/lib/schemas';

import type { HomepageContent, ContactInfo, FooterContent, GeneralSettings, SocialLinkName, HomepageFeature, FooterContentBlock } from '@/types';
import { uploadPageImageAction } from '@/app/actions/uploadActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Loader2, Home, Phone, Code, PlusCircle, Trash2, GripVertical, Settings, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDescription } from '@/components/ui/form';


// --- General Settings Form ---
function GeneralSettingsForm({ defaultValues }: { defaultValues: GeneralSettings | null }) {
  const { toast } = useToast();
  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultValues || { siteName: '', logoUrl: '/images/vhost-logo.svg' },
  });

  const [state, formAction] = useActionState(updateGeneralSettingsAction, undefined);
  const logoUrl = useWatch({ control: form.control, name: 'logoUrl' });

  useEffect(() => {
    if (state?.success) toast({ title: "Success!", description: state.message });
    else if (state?.success === false) toast({ title: "Error", description: state.message, variant: "destructive" });
  }, [state, toast]);
  
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))}
        className="space-y-8"
      >
        <FormField control={form.control} name="siteName" render={({ field }) => (<FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} placeholder="VHost Solutions" /></FormControl><FormMessage /></FormItem>)} />
        
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-base font-semibold">Logo Management</h3>
          <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Logo URL Path</FormLabel>
                  <FormControl>
                      <Input {...field} placeholder="/images/vhost-logo.svg" />
                  </FormControl>
                  <FormDescription>
                    Path to the logo file inside the /public directory. To change the logo, replace the file on the server (via Docker volume) and update this path if necessary.
                  </FormDescription>
                  <FormMessage />
                  </FormItem>
              )}
          />
           {logoUrl && (
            <div className="mt-2">
                <FormLabel>Current Logo Preview</FormLabel>
                <div className="mt-1 flex h-20 w-auto items-center justify-start rounded-md border p-2 bg-muted">
                    <Image src={logoUrl} alt="Logo preview" width={100} height={40} style={{ objectFit: 'contain', width: 'auto', height: '100%' }} />
                </div>
            </div>
        )}
        </div>
       
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
            Save General Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}


// --- Homepage Block Editors ---
function HeroBlockEditor({ index, control }: { index: number, control: any }) {
  return (
    <div className="space-y-4">
      <FormField control={control} name={`contentBlocks.${index}.heroTitle`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={control} name={`contentBlocks.${index}.heroSubtitle`} render={({ field }) => ( <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
    </div>
  );
}

function FeaturesBlockEditor({ index, control, form }: { index: number, control: any, form: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `contentBlocks.${index}.features`,
  });

  return (
    <div className="space-y-4">
      <FormField control={control} name={`contentBlocks.${index}.featuresTitle`} render={({ field }) => ( <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
      <div className="space-y-3 pl-4 border-l-2">
        {fields.map((field, cardIndex) => (
          <Card key={field.id} className="p-3 bg-background">
            <div className="flex justify-between items-center mb-2">
               <h5 className="font-medium">Feature Card {cardIndex + 1}</h5>
               <Button type="button" variant="ghost" size="icon" onClick={() => remove(cardIndex)} className="text-destructive h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              <FormField control={control} name={`contentBlocks.${index}.features.${cardIndex}.icon`} render={({ field }) => ( <FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Zap, Cpu" /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={control} name={`contentBlocks.${index}.features.${cardIndex}.title`} render={({ field }) => ( <FormItem><FormLabel>Card Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={control} name={`contentBlocks.${index}.features.${cardIndex}.description`} render={({ field }) => ( <FormItem><FormLabel>Card Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
          </Card>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => append({ id: crypto.randomUUID(), icon: 'Sparkles', title: 'New Feature', description: 'Describe this awesome feature.' })}>
          <PlusCircle className="mr-2" /> Add Feature Card
        </Button>
      </div>
    </div>
  );
}

function CtaBlockEditor({ index, control }: { index: number, control: any }) {
  return (
    <div className="space-y-4">
      <FormField control={control} name={`contentBlocks.${index}.ctaTitle`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={control} name={`contentBlocks.${index}.ctaSubtitle`} render={({ field }) => ( <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
    </div>
  );
}

function SortableContentBlock({ id, index, control, remove, form }: { id: any, index: number, control: any, remove: (index: number) => void, form: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const blockType = useWatch({ control, name: `contentBlocks.${index}.type` });

  const blockEditors: { [key: string]: React.ReactNode } = {
    hero: <HeroBlockEditor index={index} control={control} />,
    features: <FeaturesBlockEditor index={index} control={control} form={form} />,
    cta: <CtaBlockEditor index={index} control={control} />,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 bg-muted/50 space-y-4 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground p-1">
              <GripVertical className="h-5 w-5" />
            </button>
            <h4 className="font-semibold capitalize">{blockType} Section</h4>
          </div>
          <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="pl-8">{blockEditors[blockType]}</div>
      </Card>
    </div>
  );
}


function HomepageSettingsForm({ defaultValues }: { defaultValues: HomepageContent | null }) {
  const { toast } = useToast();
  const form = useForm<HomepageContentValues>({
    resolver: zodResolver(homepageContentSchema),
    defaultValues: defaultValues ? {
      contentBlocks: (defaultValues.contentBlocks || []).map(block => {
        const blockWithId = { ...block, id: block.id || crypto.randomUUID() };
        if (blockWithId.type === 'features' && blockWithId.features) {
          blockWithId.features = (blockWithId.features || []).map(f => ({ ...f, id: f.id || crypto.randomUUID() }));
        }
        return blockWithId;
      })
    } : { contentBlocks: [] }
  });

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "contentBlocks" });
  const [state, formAction] = useActionState(updateHomepageContentAction, undefined);
  
  useEffect(() => {
    if (state?.success) toast({ title: "Success!", description: state.message });
    else if (state?.success === false) toast({ title: "Error", description: state.message, variant: "destructive" });
  }, [state, toast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };
  
  const addNewBlock = (type: 'hero' | 'features' | 'cta') => {
    const newBlock: any = {
      id: crypto.randomUUID(),
      type,
      ...(type === 'hero' && { heroTitle: 'New Hero Title', heroSubtitle: 'New Hero Subtitle' }),
      ...(type === 'features' && { featuresTitle: 'New Features Section', features: [{ id: crypto.randomUUID(), icon: 'Star', title: 'New Card', description: 'New description'}] }),
      ...(type === 'cta' && { ctaTitle: 'New CTA Title', ctaSubtitle: 'New CTA Subtitle' }),
    };
    append(newBlock);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))}
        className="space-y-8"
      >
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableContentBlock key={field.id} id={field.id} index={index} control={form.control} remove={remove} form={form} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => addNewBlock('hero')}><PlusCircle className="mr-2" /> Add Hero</Button>
          <Button type="button" variant="outline" onClick={() => addNewBlock('features')}><PlusCircle className="mr-2" /> Add Features</Button>
          <Button type="button" variant="outline" onClick={() => addNewBlock('cta')}><PlusCircle className="mr-2" /> Add CTA</Button>
        </div>

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
        if (state?.success) toast({ title: "Success!", description: state.message });
        else if (state?.success === false) toast({ title: "Error", description: state.message, variant: "destructive" });
    }, [state, toast]);

    return (
        <Form {...form}>
            <form 
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

// --- Footer Block Editors ---
function FooterTextBlockEditor({ index, control }: { index: number, control: any }) {
  return (
    <div className="space-y-4">
      <FormField control={control} name={`contentBlocks.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField control={control} name={`contentBlocks.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
    </div>
  );
}

function FooterMenuBlockEditor({ index, control }: { index: number, control: any }) {
  const availableMenus = [
    { id: 'footer-col-1', name: 'Footer Column 1' },
    { id: 'footer-col-2', name: 'Footer Column 2' },
    { id: 'footer-col-3', name: 'Footer Column 3' },
  ];
  return (
    <div className="space-y-4">
      <FormField control={control} name={`contentBlocks.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
      <FormField
        control={control}
        name={`contentBlocks.${index}.menuId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Menu to Display</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select a menu" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableMenus.map(menu => (
                  <SelectItem key={menu.id} value={menu.id}>{menu.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Manage the content of these menus in the Navigation section.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function SortableFooterBlock({ id, index, control, remove }: { id: any, index: number, control: any, remove: (index: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const blockType = useWatch({ control, name: `contentBlocks.${index}.type` });

  const blockEditors: { [key: string]: React.ReactNode } = {
    text: <FooterTextBlockEditor index={index} control={control} />,
    menu: <FooterMenuBlockEditor index={index} control={control} />,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 bg-muted/50 space-y-4 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground p-1">
              <GripVertical className="h-5 w-5" />
            </button>
            <h4 className="font-semibold capitalize">{blockType} Block</h4>
          </div>
          <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="pl-8">{blockEditors[blockType]}</div>
      </Card>
    </div>
  );
}


function FooterSettingsForm({ defaultValues }: { defaultValues: FooterContent | null }) {
  const { toast } = useToast();
  const form = useForm<FooterContentValues>({
    resolver: zodResolver(footerContentSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      contentBlocks: (defaultValues.contentBlocks || []).map(block => ({...block, id: block.id || crypto.randomUUID()}))
    } : {
      contentBlocks: [],
      copyright: '',
      socialLinks: [{ name: 'Facebook', href: '#' }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'contentBlocks' });
  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({ control: form.control, name: 'socialLinks' });

  const [state, formAction] = useActionState(updateFooterContentAction, undefined);

  useEffect(() => {
    if (state?.success) toast({ title: 'Success!', description: state.message });
    else if (state?.success === false) toast({ title: 'Error', description: state.message, variant: 'destructive' });
  }, [state, toast]);

  const socialLinkOptions: SocialLinkName[] = ['Facebook', 'Twitter', 'LinkedIn'];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const addNewBlock = (type: 'text' | 'menu') => {
    const newBlock: FooterContentBlock = type === 'text' 
      ? { id: crypto.randomUUID(), type: 'text', title: 'New Text Block', description: 'Some default text.' }
      : { id: crypto.randomUUID(), type: 'menu', title: 'New Menu', menuId: 'footer-col-1' };
    append(newBlock);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => startTransition(() => formAction(data)))}
        className="space-y-8"
      >
        <div>
          <Label className="text-lg font-semibold">Footer Content Blocks</Label>
          <FormDescription>Define the layout and content of your footer columns. Drag to reorder.</FormDescription>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4 mt-4">
                {fields.map((field, index) => (
                  <SortableFooterBlock key={field.id} id={field.id} index={index} control={form.control} remove={remove} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => addNewBlock('text')}><PlusCircle className="mr-2" /> Add Text Block</Button>
            <Button type="button" variant="outline" onClick={() => addNewBlock('menu')}><PlusCircle className="mr-2" /> Add Menu Block</Button>
          </div>
        </div>

        <FormField control={form.control} name="copyright" render={({ field }) => (<FormItem><FormLabel>Copyright Text</FormLabel><FormControl><Input {...field} placeholder="e.g., VHost Solutions. All rights reserved." /></FormControl><FormMessage /></FormItem>)} />
        
        <div>
          <Label>Social Media Links</Label>
          <div className="space-y-4 mt-2">
            {socialFields.map((field, index) => (
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
                            {socialLinkOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
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
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeSocial(index)}>
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
              onClick={() => appendSocial({ name: 'Facebook', href: '' })}
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
  const [generalData, setGeneralData] = useState<GeneralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [hpData, cData, fData, gData] = await Promise.all([
          getHomepageContent(),
          getContactInfo(),
          getFooterContent(),
          getGeneralSettings(),
        ]);
        setHomepageData(hpData);
        setContactData(cData);
        setFooterData(fData);
        setGeneralData(gData);
      } catch (error) {
        console.error("Failed to load site settings:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
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
            <CardDescription>Manage global content and settings for your website.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general"><Settings className="mr-2" />General</TabsTrigger>
                    <TabsTrigger value="homepage"><Home className="mr-2" />Homepage</TabsTrigger>
                    <TabsTrigger value="contact"><Phone className="mr-2" />Contact Info</TabsTrigger>
                    <TabsTrigger value="footer"><Code className="mr-2" />Footer</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-6">
                    <GeneralSettingsForm defaultValues={generalData} />
                </TabsContent>
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
