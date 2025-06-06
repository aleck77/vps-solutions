import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <section className="text-center py-12 bg-primary/5 rounded-lg">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Privacy Policy</h1>
        <p className="text-xl text-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Welcome to VHost Solutions ("us", "we", or "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
          <p>This privacy policy applies to all information collected through our website (such as vhost.solutions), and/or any related services, sales, marketing or events (we refer to them collectively in this privacy policy as the "Services").</p>
          
          <h3 className="font-headline text-xl text-primary mt-6">Information We Collect</h3>
          <p>We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect can include the following: Name, Email Address, Contact Data, Payment Information.</p>

          <h3 className="font-headline text-xl text-primary mt-6">How We Use Your Information</h3>
          <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To send administrative information to you.</li>
            <li>To fulfill and manage your orders.</li>
            <li>To post testimonials.</li>
            <li>To request feedback.</li>
            {/* Add more uses as necessary */}
          </ul>

          <h3 className="font-headline text-xl text-primary mt-6">Sharing Your Information</h3>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          
          <h3 className="font-headline text-xl text-primary mt-6">Cookies and Tracking Technologies</h3>
          <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Data Retention</h3>
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).</p>

          <h3 className="font-headline text-xl text-primary mt-6">Your Privacy Rights</h3>
          <p>In some regions (like the European Economic Area), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Updates to This Policy</h3>
          <p>We may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.</p>

          <h3 className="font-headline text-xl text-primary mt-6">Contact Us</h3>
          <p>If you have questions or comments about this policy, you may email us at privacy@vhost.solutions or by post to:</p>
          <p>
            VHost Solutions<br />
            123 Tech Avenue<br />
            Silicon Valley, CA 94000<br />
            United States
          </p>
          <p className="mt-6 text-sm text-muted-foreground">This is a template Privacy Policy. Please consult with a legal professional to ensure it meets your specific needs and legal obligations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
