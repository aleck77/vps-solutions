
'use client';

import { useState, useActionState, startTransition } from 'react'; // Добавлен startTransition
import { useAuth } from '@/lib/authContext';
import { getAuthInstance } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { seedDatabaseAction } from '@/app/actions/adminActions'; 
import { Newspaper, Zap } from 'lucide-react'; 
import { testBasicGeneration, type TestBasicGenerationOutput } from '@/ai/flows/test-basic-generation-flow';

export default function AdminDashboardPage() {
  const { user, loading, isAdmin } = useAuth();
  const auth = getAuthInstance();
  const router = useRouter();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTestingGen, setIsTestingGen] = useState(false);
  const [testGenResult, setTestGenResult] = useState<string | null>(null);


  console.log('[AdminDashboardPage] State update: user:', user, 'loading:', loading, 'isAdmin:', isAdmin);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const handleSeedDatabase = () => { // Убрал async, так как startTransition работает с промисами
    setIsSeeding(true);
    console.log('[AdminDashboardPage] Calling seedDatabaseAction...');
    startTransition(async () => { // Обертка в startTransition
      try {
        const result = await seedDatabaseAction();
        console.log('[AdminDashboardPage] seedDatabaseAction result:', result);
        if (result.success) {
          toast({ title: 'Success!', description: result.message });
        } else {
          toast({ title: 'Error Seeding', description: result.message, variant: 'destructive' });
        }
      } catch (error: any) {
        console.error('[AdminDashboardPage] Error calling seedDatabaseAction:', error);
        toast({ title: 'Operation Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      } finally {
        setIsSeeding(false);
      }
    });
  };

  const handleTestBasicGeneration = () => { // Убрал async
    setIsTestingGen(true);
    setTestGenResult(null);
    console.log('[AdminDashboardPage] Calling testBasicGeneration...');
    startTransition(async () => { // Обертка в startTransition
      try {
        const result: TestBasicGenerationOutput = await testBasicGeneration();
        console.log('[AdminDashboardPage] testBasicGeneration result:', result);
        if (result.success) {
          setTestGenResult(`Success: ${result.generatedText}`);
          toast({ title: 'AI Test Success!', description: result.generatedText });
        } else {
          setTestGenResult(`Failed: ${result.generatedText}`);
          toast({ title: 'AI Test Failed', description: result.generatedText, variant: 'destructive' });
        }
      } catch (error: any) {
        console.error('[AdminDashboardPage] Error calling testBasicGeneration:', error);
        const errorMessage = error.message || 'An unexpected error occurred during AI test.';
        setTestGenResult(`Error: ${errorMessage}`);
        toast({ title: 'AI Test Error', description: errorMessage, variant: 'destructive' });
      } finally {
        setIsTestingGen(false);
      }
    });
  };


  if (loading) {
    console.log('[AdminDashboardPage] Auth data is loading. Rendering loading message.');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-primary">Admin Dashboard: Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    console.log('[AdminDashboardPage] Auth data loaded, but no user found. Rendering user not found message (should be redirected by guard).');
    return (
       <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-destructive">Admin Dashboard: User not found.</p>
        <p className="text-muted-foreground">You might be redirected to login if authentication failed or is incomplete.</p>
      </div>
    );
  }

  console.log('[AdminDashboardPage] User is authenticated and data loaded. Rendering dashboard content for:', user.email, 'Is Admin:', isAdmin);
  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the VHost Solutions admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Hello, <span className="font-semibold text-accent">{user.email}</span>!
            (Admin status: {isAdmin ? 'Yes' : 'No'})
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-headline text-xl font-semibold">Content Management</h3>
              <Button asChild variant="outline" className="mt-2" disabled={!isAdmin}>
                <Link href="/admin/posts" className="flex items-center">
                  <Newspaper className="h-4 w-4 mr-2" />
                  Manage Blog Posts
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Create, edit, and manage blog posts. (Requires admin rights)
              </p>
            </div>
            <div>
              <h3 className="font-headline text-xl font-semibold">Database Operations</h3>
              <Button 
                variant="outline"
                onClick={handleSeedDatabase}
                disabled={isSeeding || !isAdmin} 
                className="mt-2"
              >
                {isSeeding ? 'Seeding...' : 'Seed Database'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                This button will trigger the database seeding process. (Requires admin rights)
              </p>
            </div>
            <div>
              <h3 className="font-headline text-xl font-semibold">AI Test</h3>
              <Button
                variant="outline"
                onClick={handleTestBasicGeneration}
                disabled={isTestingGen || !isAdmin}
                className="mt-2 flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isTestingGen ? 'Testing AI...' : 'Test Basic AI Generation'}
              </Button>
              {testGenResult && (
                <p className={`text-sm mt-2 p-2 rounded-md ${testGenResult.startsWith('Success:') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testGenResult}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                This button attempts a direct call to the AI model via Genkit's ai.generate(). (Requires admin rights & API key)
              </p>
            </div>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto mt-4">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    