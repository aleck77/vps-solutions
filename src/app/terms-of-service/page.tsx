import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Terms of Service</h1>
        <p className="text-xl text-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and VHost Solutions ("we," “us," or “our”), concerning your access to and use of the vhost.solutions website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).</p>
          <p>You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms of Service, then you are expressly prohibited from using the Site and you must discontinue use immediately.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Intellectual Property Rights</h3>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions.</p>

          <h3 className="font-headline text-xl text-primary mt-6">User Representations</h3>
          <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise; ...</p>
          {/* Add more sections as necessary: Prohibited Activities, User Generated Contributions, Site Management, Term and Termination, Modifications and Interruptions, Governing Law, Dispute Resolution, Disclaimer, Limitations of Liability, Indemnification, User Data, etc. */}

          <h3 className="font-headline text-xl text-primary mt-6">Service Usage and Acceptable Use</h3>
          <p>You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Site, Services, or general business of VHost Solutions.</p>
          <p>You further agree not to use the Service:</p>
          <ul>
            <li>To harass, abuse, or threaten others or otherwise violate any person's legal rights.</li>
            <li>To violate any intellectual property rights of us or any third party.</li>
            <li>To upload or otherwise disseminate any computer viruses or other software that may damage the property of another.</li>
            <li>To perpetrate any fraud.</li>
            {/* Add more prohibited uses */}
          </ul>

          <h3 className="font-headline text-xl text-primary mt-6">Payment and Renewal</h3>
          <p>By selecting a product or service, you agree to pay VHost Solutions the one-time and/or monthly or annual subscription fees indicated. Subscription payments will be charged on a pre-pay basis on the day you sign up for an Upgrade and will cover the use of that service for a monthly or annual subscription period as indicated. Payments are not refundable.</p>
          
          <h3 className="font-headline text-xl text-primary mt-6">Modifications to the Service and Prices</h3>
          <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Limitation of Liability</h3>
          <p>IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Contact Us</h3>
          <p>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:</p>
          <p>
            VHost Solutions<br />
            123 Tech Avenue<br />
            Silicon Valley, CA 94000<br />
            United States<br />
            Email: legal@vhost.solutions
          </p>
          <p className="mt-6 text-sm text-muted-foreground">This is a template Terms of Service. Please consult with a legal professional to ensure it meets your specific needs and legal obligations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
