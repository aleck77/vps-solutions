
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getContactInfo } from '@/lib/firestoreBlog';
import type { ContactInfo } from '@/types';
import ContactForm from './ContactForm';

const defaultContactInfo: ContactInfo = {
    address: "123 Tech Avenue, Silicon Valley, CA 94000",
    salesEmail: "sales@vhost.solutions",
    supportEmail: "support@vhost.solutions",
    phone: "+1 (555) 123-4567",
    salesHours: "Monday - Friday, 9 AM - 6 PM (PST)",
    supportHours: "24/7 via email and ticketing system"
};

export default async function ContactPage() {
  const fetchedContactInfo = await getContactInfo();
  const contactInfo = fetchedContactInfo || defaultContactInfo;

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Contact Us</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          We're here to help. Reach out to us with any questions or inquiries.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        <ContactForm />
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold">Our Office</h3>
                  <p className="text-muted-foreground">{contactInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-muted-foreground">
                    Sales: <a href={`mailto:${contactInfo.salesEmail}`} className="text-primary hover:underline">{contactInfo.salesEmail}</a><br />
                    Support: <a href={`mailto:${contactInfo.supportEmail}`} className="text-primary hover:underline">{contactInfo.supportEmail}</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-muted-foreground">{contactInfo.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p><strong>Sales:</strong> {contactInfo.salesHours}</p>
              <p><strong>Support:</strong> {contactInfo.supportHours}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
