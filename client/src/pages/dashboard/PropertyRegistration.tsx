import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyRegistrationForm from '@/components/Forms/PropertyRegistrationForm';

export default function PropertyRegistration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Registration</h1>
        <p className="text-muted-foreground">
          Register a new property or housing unit in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Property Details</CardTitle>
          <CardDescription>
            Enter property information including address, capacity, and amenities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
