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
import { insertPropertyRoomSchema } from "@shared/schema";
import { Bed, Home, Users, DollarSign } from "lucide-react";

interface RoomAllocationFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function RoomAllocationForm({ onSuccess, initialData }: RoomAllocationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const form = useForm({
    resolver: zodResolver(insertPropertyRoomSchema),
    defaultValues: initialData || {
      propertyId: "",
      roomNumber: "",
      roomType: "",
      capacity: "1",
      weeklyRent: "",
      isOccupied: false,
      residentId: "",
      facilities: "",
      accessibility: "",
      notes: "",
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/property-rooms", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room has been allocated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/property-rooms'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to allocate room.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      propertyId: parseInt(data.propertyId),
      capacity: parseInt(data.capacity),
      weeklyRent: parseFloat(data.weeklyRent),
      residentId: data.residentId ? parseInt(data.residentId) : null,
      facilities: data.facilities?.split(',').map((f: string) => f.trim()) || [],
      accessibility: data.accessibility?.split(',').map((a: string) => a.trim()) || [],
    };
    createRoomMutation.mutate(formattedData);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5" />
          Room Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101, A1, Ground Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single Room</SelectItem>
                        <SelectItem value="double">Double Room</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="shared">Shared Room</SelectItem>
                        <SelectItem value="bedsit">Bedsit</SelectItem>
                        <SelectItem value="flat">Flat/Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="weeklyRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Weekly Rent (£)
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
              name="residentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Resident (if applicable)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resident or leave empty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No resident assigned</SelectItem>
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
              name="facilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilities</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., En-suite, Shared bathroom, Kitchenette, WiFi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accessibility Features</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Wheelchair accessible, Ground floor, Grab rails"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this room..."
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
              <Button type="submit" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending ? "Allocating..." : "Allocate Room"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}