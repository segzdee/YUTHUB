import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building, MapPin, Users, Settings } from "lucide-react";
import FormWizard from "./FormWizard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const propertyBasicSchema = z.object({
  name: z.string().min(2, "Property name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  propertyType: z.enum(["shared_housing", "studio_units", "transition_units"]),
  totalUnits: z.coerce.number().min(1, "Must have at least 1 unit"),
});

const propertyDetailsSchema = z.object({
  description: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  transportLinks: z.string().optional(),
  emergencyProcedures: z.string().optional(),
});

const propertyConfigSchema = z.object({
  allowPets: z.boolean().default(false),
  smokingPolicy: z.enum(["no_smoking", "designated_areas", "allowed"]).default("no_smoking"),
  visitingHours: z.string().optional(),
  internetProvided: z.boolean().default(true),
  laundryFacilities: z.boolean().default(true),
  parkingSpaces: z.coerce.number().min(0).default(0),
});

// Step 1: Basic Information
function BasicInfoStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(propertyBasicSchema),
    defaultValues: data || {}
  });

  const handleSubmit = (values: any) => {
    onDataChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sunrise House" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="shared_housing">Shared Housing</SelectItem>
                    <SelectItem value="studio_units">Studio Units</SelectItem>
                    <SelectItem value="transition_units">Transition Units</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the complete address including postcode"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalUnits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Number of Units</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>
                Total accommodation units/rooms available
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Step 2: Property Details
function PropertyDetailsStep({ data, onDataChange }: any) {
  const [facilities, setFacilities] = useState<string[]>(data?.facilities || []);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>(data?.accessibilityFeatures || []);

  const form = useForm({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: data || {}
  });

  const facilityOptions = [
    "Common Room", "Kitchen", "Dining Area", "Laundry Room", "Garden/Outdoor Space",
    "Parking", "Bike Storage", "CCTV", "Secure Entry", "Wi-Fi", "Study Area"
  ];

  const accessibilityOptions = [
    "Wheelchair Access", "Accessible Bathroom", "Hearing Loop", "Visual Aids",
    "Accessible Parking", "Lift Access", "Accessible Kitchen", "Emergency Alarms"
  ];

  const toggleFacility = (facility: string) => {
    const updated = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    setFacilities(updated);
    onDataChange({ ...data, facilities: updated });
  };

  const toggleAccessibility = (feature: string) => {
    const updated = accessibilityFeatures.includes(feature)
      ? accessibilityFeatures.filter(f => f !== feature)
      : [...accessibilityFeatures, feature];
    setAccessibilityFeatures(updated);
    onDataChange({ ...data, accessibilityFeatures: updated });
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the property, its atmosphere, and what makes it special"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facilities Available</CardTitle>
            <CardDescription>Select all facilities available at this property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {facilityOptions.map((facility) => (
                <Button
                  key={facility}
                  type="button"
                  variant={facilities.includes(facility) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFacility(facility)}
                  className="justify-start"
                >
                  {facility}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accessibility Features</CardTitle>
            <CardDescription>Select accessibility features available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {accessibilityOptions.map((feature) => (
                <Button
                  key={feature}
                  type="button"
                  variant={accessibilityFeatures.includes(feature) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAccessibility(feature)}
                  className="justify-start"
                >
                  {feature}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="transportLinks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Links</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe nearby transport options"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyProcedures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Procedures</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Outline emergency procedures and contacts"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}

// Step 3: Configuration
function ConfigurationStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(propertyConfigSchema),
    defaultValues: data || {}
  });

  const handleValueChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pet Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowPets"
                  checked={data?.allowPets || false}
                  onChange={(e) => handleValueChange("allowPets", e.target.checked)}
                />
                <Label htmlFor="allowPets">Allow pets</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Smoking Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={data?.smokingPolicy || "no_smoking"}
              onValueChange={(value) => handleValueChange("smokingPolicy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_smoking">No Smoking</SelectItem>
                <SelectItem value="designated_areas">Designated Areas Only</SelectItem>
                <SelectItem value="allowed">Smoking Allowed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visiting Hours</CardTitle>
          <CardDescription>When can residents have visitors?</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., 9:00 AM - 9:00 PM daily"
            value={data?.visitingHours || ""}
            onChange={(e) => handleValueChange("visitingHours", e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Internet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="internetProvided"
                checked={data?.internetProvided !== false}
                onChange={(e) => handleValueChange("internetProvided", e.target.checked)}
              />
              <Label htmlFor="internetProvided">Internet provided</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Laundry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="laundryFacilities"
                checked={data?.laundryFacilities !== false}
                onChange={(e) => handleValueChange("laundryFacilities", e.target.checked)}
              />
              <Label htmlFor="laundryFacilities">Laundry facilities</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parking</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              placeholder="Number of spaces"
              value={data?.parkingSpaces || 0}
              onChange={(e) => handleValueChange("parkingSpaces", parseInt(e.target.value) || 0)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PropertyRegistrationForm() {
  const { toast } = useToast();

  const steps = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Enter the core details about your property",
      component: BasicInfoStep,
      validation: (data: any) => {
        try {
          propertyBasicSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      id: "details",
      title: "Property Details",
      description: "Describe facilities and features",
      component: PropertyDetailsStep,
    },
    {
      id: "config",
      title: "Configuration",
      description: "Set policies and preferences",
      component: ConfigurationStep,
    },
  ];

  const handleComplete = async (data: any) => {
    try {
      const response = await apiRequest("POST", "/api/properties", data);
      
      if (response.ok) {
        toast({
          title: "Property Registered",
          description: "Your property has been successfully registered.",
        });
        // Redirect to properties page or dashboard
        window.location.href = "/dashboard";
      } else {
        throw new Error("Failed to register property");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error registering your property.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <FormWizard
      formType="property_registration"
      title="Register New Property"
      description="Register a new property in your housing management system"
      steps={steps}
      onComplete={handleComplete}
      allowSaveAndContinue={true}
    />
  );
}