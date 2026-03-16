import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
            <Clock className="w-7 h-7 text-warning" />
          </div>
          <CardTitle className="font-display text-2xl text-foreground">
            Pending Approval
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your account has been created but is awaiting admin approval. 
            Please contact the administrator to get your account approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
