import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Vite + React + TypeScript + shadcn/ui</CardTitle>
          <CardDescription>
            A modern starter template with Supabase integration
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
