
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">About VHost Solutions</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Empowering innovation with reliable and high-performance hosting.
        </p>
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Target className="h-7 w-7 mr-3 text-accent" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-foreground space-y-4">
            <p>
              At VHost Solutions, our mission is to provide cutting-edge VPS hosting services that are powerful, reliable, and accessible. We strive to empower developers, entrepreneurs, and businesses of all sizes to achieve their online goals by offering top-tier infrastructure, exceptional customer support, and a commitment to continuous innovation.
            </p>
            <p>
              We believe that great hosting is the foundation of online success, and we are dedicated to building that foundation for our clients with integrity and expertise.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold font-headline mb-6 text-primary">Our Story</h2>
          <div className="space-y-4 text-foreground">
            <p>
              Founded by a team of passionate engineers and tech enthusiasts, VHost Solutions was born out of a desire to create a hosting company that truly understands the needs of its users. We saw a gap in the market for a provider that combines state-of-the-art technology with a customer-centric approach.
            </p>
            <p>
              Since our inception, we've grown steadily, driven by our core values of performance, reliability, and support. We are constantly exploring new technologies and refining our services to ensure we offer the best possible hosting experience.
            </p>
            <p>
              Our journey is one of continuous improvement and dedication to helping our customers thrive in the digital world.
            </p>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl">
          <Image
            src="https://source.unsplash.com/600x400/?team,office"
            alt="VHost Solutions Team"
            width={600}
            height={400}
            data-ai-hint="team office" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline text-center mb-10">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-headline">Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">We embrace new technologies to provide cutting-edge solutions.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-headline">Customer Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Our customers are at the heart of everything we do.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <CardTitle className="font-headline">Reliability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">We deliver consistent and dependable hosting services.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
