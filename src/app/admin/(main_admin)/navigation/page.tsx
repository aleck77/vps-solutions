
'use client';

import { useEffect, useState, startTransition } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { getNavigationMenu } from '@/lib/firestoreBlog';
import { updateNavigationAction } from '@/app/actions/navigationActions';
import type { MenuItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Trash2, GripVertical, Save, Loader2, ListTree } from 'lucide-react';

interface SortableMenuItemProps {
  item: MenuItem;
  index: number;
  onUpdate: (index: number, field: keyof MenuItem, value: string) => void;
  onRemove: (index: number) => void;
}

function SortableMenuItem({ item, index, onUpdate, onRemove }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 rounded-md border bg-background">
      <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground p-2">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-grow grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`label-${item.id}`}>Label</Label>
          <Input id={`label-${item.id}`} value={item.label} onChange={(e) => onUpdate(index, 'label', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`href-${item.id}`}>URL (href)</Label>
          <Input id={`href-${item.id}`} value={item.href} onChange={(e) => onUpdate(index, 'href', e.target.value)} />
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface MenuEditorProps {
  title: string;
  description: string;
  menuId: 'header-nav' | 'footer-links';
}

function MenuEditor({ title, description, menuId }: MenuEditorProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMenu() {
      setIsLoading(true);
      try {
        const menu = await getNavigationMenu(menuId);
        if (menu) {
          // Ensure each item has a unique ID for dnd-kit
          setItems(menu.items.map((item, index) => ({ ...item, id: item.id || `${menuId}-${index}-${Date.now()}` })));
        } else {
            toast({ title: 'Warning', description: `Menu "${menuId}" not found. You may need to seed the database.`, variant: 'destructive' });
        }
      } catch (error) {
        console.error(`Failed to fetch ${menuId}:`, error);
        toast({ title: 'Error', description: `Failed to load menu: ${menuId}`, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchMenu();
  }, [menuId, toast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateItem = (index: number, field: keyof MenuItem, value: string) => {
    setItems((currentItems) => {
      const newItems = [...currentItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((currentItems) => currentItems.filter((_, i) => i !== index));
  };
  
  const handleAddItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      { id: `${menuId}-new-${Date.now()}`, label: 'New Link', href: '/' },
    ]);
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    startTransition(async () => {
      // Remove temporary 'id' before saving
      const itemsToSave = items.map(({ id, ...rest }) => rest);
      const result = await updateNavigationAction(menuId, itemsToSave);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
      } else {
        toast({ title: 'Error Saving', description: result.message, variant: 'destructive' });
      }
      setIsSaving(false);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id!)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableMenuItem key={item.id} item={item} index={index} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={handleAddItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-accent hover:bg-accent/90">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NavigationAdminPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3"><ListTree/> Navigation Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage the navigation menus for your website's header and footer. Drag items to reorder them.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MenuEditor 
          title="Header Menu" 
          description="Links that appear in the main site header."
          menuId="header-nav"
        />
        <MenuEditor 
          title="Footer Menu"
          description="Links that appear in the site footer."
          menuId="footer-links"
        />
      </div>
    </div>
  );
}
