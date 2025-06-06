import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { blogCategories, type BlogCategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  currentCategory?: string;
}

export default function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const allCategories = ['All', ...blogCategories];
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold font-headline mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const categorySlug = category.toLowerCase();
          const isActive = (!currentCategory && category === 'All') || currentCategory === categorySlug;
          const href = category === 'All' ? '/blog' : `/blog/category/${categorySlug}`;
          
          return (
            <Button
              key={category}
              asChild
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn(isActive && "bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              <Link href={href}>{category}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
