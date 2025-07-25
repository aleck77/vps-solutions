
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { getVpsPlans, getHomepageContent } from '@/lib/firestoreBlog';
import type { VPSPlan, HomepageContent, HomepageContentBlock } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import DynamicLucideIcon from '@/components/common/DynamicLucideIcon';
import {unstable_setRequestLocale} from 'next-intl/server';

type Props = {
  params: {locale: string};
};

// --- Block Renderer Components ---
function HeroSection({ block }: { block: Extract<HomepageContentBlock, { type: 'hero' }> }) {
  return (
    <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-lg">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6 text-primary">
          {block.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
          {block.heroSubtitle}
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/order">View Plans</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ block }: { block: Extract<HomepageContentBlock, { type: 'features' }> }) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-headline text-center mb-10">{block.featuresTitle}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {(block.features || []).map((feature, index) => (
            <Card key={feature.id || index} className="shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <DynamicLucideIcon name={feature.icon} className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ block }: { block: Extract<HomepageContentBlock, { type: 'cta' }> }) {
  return (
    <section className="py-16 text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-headline mb-6">{block.ctaTitle}</h2>
        <p className="text-lg text-foreground mb-8 max-w-xl mx-auto">
          {block.ctaSubtitle}
        </p>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/order">Get Started Now</Link>
        </Button>
      </div>
    </section>
  );
}

function renderBlock(block: HomepageContentBlock, index: number) {
  // Use index as the key because block.id is stripped before saving to DB
  switch (block.type) {
    case 'hero':
      return <HeroSection key={index} block={block} />;
    case 'features':
      return <FeaturesSection key={index} block={block} />;
    case 'cta':
      return <CtaSection key={index} block={block} />;
    default:
      return null;
  }
}

// --- Fallback Content ---
const defaultContent: HomepageContent = {
    contentBlocks: [
        { type: 'hero', id: 'default-hero', heroTitle: "Power Your Ambitions with VHost Solutions", heroSubtitle: "Experience blazing fast, reliable, and scalable VPS hosting tailored for your success. Get started today and unleash your project's full potential." },
        { type: 'features', id: 'default-features', featuresTitle: "Why Choose VHost Solutions?", features: [
            { id: 'f1', icon: "Zap", title: "Blazing Fast Performance", description: "Our NVMe SSD-powered servers ensure lightning-fast load times and optimal performance for your applications." },
            { id: 'f2', icon: "Cpu", title: "Scalable Resources", description: "Easily upgrade your CPU, RAM, and storage as your needs grow. Scale effortlessly with VHost Solutions." },
            { id: 'f3', icon: "HardDrive", title: "99.9% Uptime Guarantee", description: "We guarantee high availability for your websites and applications, ensuring they are always accessible." }
        ]},
        { type: 'cta', id: 'default-cta', ctaTitle: "Ready to Elevate Your Hosting?", ctaSubtitle: "Join thousands of satisfied customers and experience the VHost Solutions difference." }
    ]
};

// --- Skeletons ---
function PricingCardSkeleton() {
  return (
    <Card className="flex flex-col shadow-md">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <div className="p-6 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

// --- Main Page Component ---
export default async function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);
  const plans = await getVpsPlans();
  const homepageData = await getHomepageContent();
  const content = homepageData || defaultContent;
  
  const isLoading = !plans || !content;

  return (
    <div className="space-y-16">
      {/* Dynamic Content Blocks */}
      {(content.contentBlocks || []).map((block, index) => renderBlock(block, index))}

      {/* Pricing Teaser Section (remains separate as it's from a different collection) */}
      <section className="py-12 bg-muted rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Flexible VPS Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <PricingCardSkeleton />
                <PricingCardSkeleton />
                <PricingCardSkeleton />
              </>
            ) : (
              plans.slice(0, 3).map((plan) => (
                <Card key={plan.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="font-headline text-primary">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.cpu}, {plan.ram}, {plan.storage}</p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-3xl font-bold mb-2">${plan.priceMonthly.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="space-y-2 text-sm">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href={`/order?plan=${plan.id}`}>Choose Plan</Link>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/order">See All Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
