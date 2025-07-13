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
import { AlertTriangle, Clock, User, MapPin } from "lucide-react";
import FormWizard from "./FormWizard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const incidentBasicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  incidentType: z.enum(["maintenance", "behavioral", "medical", "safety", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  propertyId: z.coerce.number().min(1, "Please select a property"),
  residentId: z.coerce.number().optional(),
  location: z.string().min(1, "Please specify the location"),
  dateTime: z.string().min(1, "Please specify when the incident occurred"),
});

const incidentDetailsSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  immediateActions: z.string().optional(),
  witnessesPresent: z.boolean().default(false),
  witnessDetails: z.string().optional(),
  policeInvolved: z.boolean().default(false),
  emergencyServicesInvolved: z.boolean().default(false),
  servicesDetails: z.string().optional(),
});

const followUpSchema = z.object({
  injuriesReported: z.boolean().default(false),
  injuryDetails: z.string().optional(),
  damageReported: z.boolean().default(false),
  damageDetails: z.string().optional(),
  followUpRequired: z.boolean().default(true),
  followUpActions: z.string().optional(),
  managerNotified: z.boolean().default(false),
  additionalNotes: z.string().optional(),
});

// Step 1: Basic Incident Information
function IncidentBasicStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(incidentBasicSchema),
    defaultValues: data || {}
  });

  const handleSubmit = (values: any) => {
    onDataChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the incident" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="incidentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Critical
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Sunrise House</SelectItem>
                    <SelectItem value="2">Green Valley Residence</SelectItem>
                    <SelectItem value="3">City Centre Studios</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="residentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resident Involved (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resident if involved" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Emma Johnson</SelectItem>
                    <SelectItem value="3">Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Kitchen, Room 12, Common Area, Garden" {...field} />
              </FormControl>
              <FormDescription>
                Specify the exact location where the incident occurred
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date and Time of Incident</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Step 2: Detailed Description
function IncidentDetailsStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(incidentDetailsSchema),
    defaultValues: data || {}
  });

  const handleValueChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of what happened. Include who was involved, what occurred, and any contributing factors."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific and objective as possible
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="immediateActions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Immediate Actions Taken</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe any immediate actions taken to address the incident"
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
            <CardTitle className="text-lg">Witnesses & Emergency Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="witnessesPresent"
                checked={data?.witnessesPresent || false}
                onChange={(e) => handleValueChange("witnessesPresent", e.target.checked)}
              />
              <Label htmlFor="witnessesPresent">Were there any witnesses present?</Label>
            </div>

            {data?.witnessesPresent && (
              <FormField
                control={form.control}
                name="witnessDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Witness Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List witnesses and their contact information"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="policeInvolved"
                  checked={data?.policeInvolved || false}
                  onChange={(e) => handleValueChange("policeInvolved", e.target.checked)}
                />
                <Label htmlFor="policeInvolved">Police involved</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergencyServicesInvolved"
                  checked={data?.emergencyServicesInvolved || false}
                  onChange={(e) => handleValueChange("emergencyServicesInvolved", e.target.checked)}
                />
                <Label htmlFor="emergencyServicesInvolved">Emergency services involved</Label>
              </div>
            </div>

            {(data?.policeInvolved || data?.emergencyServicesInvolved) && (
              <FormField
                control={form.control}
                name="servicesDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Services Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about emergency services involvement (reference numbers, officer names, etc.)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}

// Step 3: Follow-up and Actions
function FollowUpStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: data || {}
  });

  const handleValueChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Injuries & Damage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="injuriesReported"
                checked={data?.injuriesReported || false}
                onChange={(e) => handleValueChange("injuriesReported", e.target.checked)}
              />
              <Label htmlFor="injuriesReported">Were any injuries reported?</Label>
            </div>

            {data?.injuriesReported && (
              <FormField
                control={form.control}
                name="injuryDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Injury Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any injuries, medical treatment provided, and follow-up required"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="damageReported"
                checked={data?.damageReported || false}
                onChange={(e) => handleValueChange("damageReported", e.target.checked)}
              />
              <Label htmlFor="damageReported">Was any property damage reported?</Label>
            </div>

            {data?.damageReported && (
              <FormField
                control={form.control}
                name="damageDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the damage and estimated repair costs"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-up Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={data?.followUpRequired !== false}
                onChange={(e) => handleValueChange("followUpRequired", e.target.checked)}
              />
              <Label htmlFor="followUpRequired">Follow-up actions required</Label>
            </div>

            {data?.followUpRequired !== false && (
              <FormField
                control={form.control}
                name="followUpActions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Follow-up Actions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List specific actions that need to be taken and by when"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="managerNotified"
                checked={data?.managerNotified || false}
                onChange={(e) => handleValueChange("managerNotified", e.target.checked)}
              />
              <Label htmlFor="managerNotified">Manager/supervisor notified</Label>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information that might be relevant"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

export default function IncidentReportForm() {
  const { toast } = useToast();

  const steps = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Essential details about the incident",
      component: IncidentBasicStep,
      validation: (data: any) => {
        try {
          incidentBasicSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      id: "details",
      title: "Detailed Description",
      description: "Comprehensive account of what happened",
      component: IncidentDetailsStep,
      validation: (data: any) => {
        try {
          incidentDetailsSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      id: "followup",
      title: "Follow-up Actions",
      description: "Required actions and next steps",
      component: FollowUpStep,
    },
  ];

  const handleComplete = async (data: any) => {
    try {
      const incidentData = {
        title: data.title,
        incidentType: data.incidentType,
        severity: data.severity,
        propertyId: data.propertyId,
        residentId: data.residentId,
        description: data.description,
        // Additional data would be stored in a separate incidents_details table
        // or as JSON in the existing incidents table
      };

      const response = await apiRequest("POST", "/api/incidents", incidentData);
      
      if (response.ok) {
        toast({
          title: "Incident Report Submitted",
          description: "The incident report has been successfully submitted and logged.",
        });
        
        // Redirect to incidents list or dashboard
        window.location.href = "/incidents";
      } else {
        throw new Error("Failed to submit incident report");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the incident report.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <FormWizard
      formType="incident_report"
      title="Incident Report"
      description="Report and document incidents for proper management and follow-up"
      steps={steps}
      onComplete={handleComplete}
      allowSaveAndContinue={true}
    />
  );
}