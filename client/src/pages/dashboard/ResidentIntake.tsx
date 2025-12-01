import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResidentIntakeForm from '@/components/Forms/ResidentIntakeForm';

export default function ResidentIntake() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resident Intake</h1>
        <p className="text-muted-foreground">
          Register a new resident and create their profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Resident Information</CardTitle>
          <CardDescription>
            Please fill out all required fields to register a new resident in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResidentIntakeForm />
        </CardContent>
      </Card>
    </div>
  );
}
