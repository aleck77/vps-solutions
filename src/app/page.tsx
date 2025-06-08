
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Cpu, HardDrive, Zap } from 'lucide-react';
import { mockVpsPlans } from '@/data/vpsPlans';
import { useEffect } from 'react';
import { seedDatabase } from '@/lib/seed';
import { testFirestoreConnection } from '@/lib/firestoreUtils'; // Added import

export default function HomePage() {
  useEffect(() => {
    const checkConnectionAndSeed = async () => {
      console.log("Testing Firestore connection...");
      const connectionResult = await testFirestoreConnection();
      if (connectionResult.success) {
        console.log(connectionResult.message);
        // If connection is successful, you can proceed with seeding.
        // The call to seedDatabase() is intentionally left commented out.
        // Please uncomment it MANUALLY when you are ready to seed.
        // console.log("Attempting to seed database from HomePage...");
        // try {
        //   await seedDatabase(); 
        //   console.log("Database seeding initiated or checked.");
        // } catch (error) {
        //   console.error("Error during seeding:", error);
        // }
      } else {
        console.error("Firestore connection failed:", connectionResult.message);
        // Handle connection failure (e.g., show an error to the user or prevent seeding)
      }
    };

    checkConnectionAndSeed(); // Call the test function on component mount
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6 text-primary">
            Power Your Ambitions with VHost Solutions
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Experience blazing fast, reliable, and scalable VPS hosting tailored for your success. Get started today and unleash your project's full potential.
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

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Why Choose VHost Solutions?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">Blazing Fast Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Our NVMe SSD-powered servers ensure lightning-fast load times and optimal performance for your applications.</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">Scalable Resources</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Easily upgrade your CPU, RAM, and storage as your needs grow. Scale effortlessly with VHost Solutions.</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <HardDrive className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline">99.9% Uptime Guarantee</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">We guarantee high availability for your websites and applications, ensuring they are always accessible.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-12 bg-muted rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Flexible VPS Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mockVpsPlans.slice(0, 3).map((plan) => (
              <Card key={plan.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">{plan.name}</CardTitle>
                  <CardDescription>{plan.cpu}, {plan.ram}, {plan.storage}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-3xl font-bold mb-2">${plan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0,3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-accent mr-2" />
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
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/order">See All Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline mb-6">Ready to Elevate Your Hosting?</h2>
          <p className="text-lg text-foreground mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and experience the VHost Solutions difference.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/order">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
