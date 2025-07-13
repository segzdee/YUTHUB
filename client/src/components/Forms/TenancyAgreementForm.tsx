import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTenancyAgreementSchema } from "@shared/schema";
import { FileText, Home, User, DollarSign, Calendar } from "lucide-react";

interface TenancyAgreementFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function TenancyAgreementForm({ onSuccess, initialData }: TenancyAgreementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['/api/staff-members'],
  });

  const form = useForm({
    resolver: zodResolver(insertTenancyAgreementSchema),
    defaultValues: initialData || {
      residentId: "",
      propertyId: "",
      agreementType: "",
      startDate: "",
      endDate: "",
      monthlyRent: "",
      deposit: "",
      serviceCharge: "",
      witnessedBy: "",
      terms: "",
    },
  });

  const createAgreementMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tenancy-agreements", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tenancy agreement has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tenancy-agreements'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tenancy agreement.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      residentId: parseInt(data.residentId),
      propertyId: parseInt(data.propertyId),
      witnessedBy: data.witnessedBy ? parseInt(data.witnessedBy) : null,
      monthlyRent: parseFloat(data.monthlyRent),
      deposit: data.deposit ? parseFloat(data.deposit) : null,
      serviceCharge: data.serviceCharge ? parseFloat(data.serviceCharge) : null,
      terms: data.terms ? JSON.parse(data.terms) : null,
    };
    createAgreementMutation.mutate(formattedData);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tenancy Agreement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="residentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Resident
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resident" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {residents.map((resident: any) => (
                          <SelectItem key={resident.id} value={resident.id.toString()}>
                            {resident.firstName} {resident.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Property
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property: any) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="agreementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agreement Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agreement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="license">License Agreement</SelectItem>
                      <SelectItem value="assured_shorthold">Assured Shorthold Tenancy</SelectItem>
                      <SelectItem value="supported_living">Supported Living Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monthly Rent (£)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge (£)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="witnessedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Witnessed By</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select witness" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffMembers.map((staff: any) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.firstName} {staff.lastName} - {staff.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter specific terms and conditions for this agreement"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={createAgreementMutation.isPending}>
                {createAgreementMutation.isPending ? "Creating..." : "Create Agreement"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}