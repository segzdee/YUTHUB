import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Building,
    Edit,
    Mail,
    Phone,
    Plus,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

const clientFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientType: z.enum(['local_authority', 'central_government', 'nhs_trust', 'housing_association']),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonEmail: z.string().email('Valid email is required'),
  contactPersonPhone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  invoiceFrequency: z.enum(['monthly', 'quarterly', 'annual']),
  specialInstructions: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface GovernmentClient {
  id: number;
  clientName: string;
  clientType: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  address: string;
  paymentTerms: string;
  invoiceFrequency: string;
  specialInstructions?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function GovernmentClientsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<GovernmentClient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery<GovernmentClient[]>({
    queryKey: ['/api/billing/government-clients'],
  });

  // Create a simple form handler without react-hook-form for now
  const [formData, setFormData] = useState<ClientFormData>({
    clientName: '',
    clientType: 'local_authority',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    address: '',
    paymentTerms: '',
    invoiceFrequency: 'monthly',
    specialInstructions: '',
    status: 'active',
  });

  const createMutation = useMutation({
    mutationFn: (data: ClientFormData) => apiRequest('/api/billing/government-clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/government-clients'] });
      toast({ title: 'Success', description: 'Government client created successfully' });
      setIsDialogOpen(false);
      setFormData({
        clientName: '',
        clientType: 'local_authority',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
        address: '',
        paymentTerms: '',
        invoiceFrequency: 'monthly',
        specialInstructions: '',
        status: 'active',
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create government client',
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientFormData> }) => 
      apiRequest(`/api/billing/government-clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/government-clients'] });
      toast({ title: 'Success', description: 'Government client updated successfully' });
      setIsDialogOpen(false);
      setEditingClient(null);
      setFormData({
        clientName: '',
        clientType: 'local_authority',
        contactPersonName: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
        address: '',
        paymentTerms: '',
        invoiceFrequency: 'monthly',
        specialInstructions: '',
        status: 'active',
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update government client',
        variant: 'destructive' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/billing/government-clients/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/government-clients'] });
      toast({ title: 'Success', description: 'Government client deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete government client',
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (client: GovernmentClient) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      clientType: client.clientType as any,
      contactPersonName: client.contactPersonName,
      contactPersonEmail: client.contactPersonEmail,
      contactPersonPhone: client.contactPersonPhone,
      address: client.address,
      paymentTerms: client.paymentTerms,
      invoiceFrequency: client.invoiceFrequency as any,
      specialInstructions: client.specialInstructions || '',
      status: client.status as any,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this government client?')) {
      deleteMutation.mutate(id);
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'local_authority': return 'Local Authority';
      case 'central_government': return 'Central Government';
      case 'nhs_trust': return 'NHS Trust';
      case 'housing_association': return 'Housing Association';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Government Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading government clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Government Clients
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingClient(null);
              setFormData({
                clientName: '',
                clientType: 'local_authority',
                contactPersonName: '',
                contactPersonEmail: '',
                contactPersonPhone: '',
                address: '',
                paymentTerms: '',
                invoiceFrequency: 'monthly',
                specialInstructions: '',
                status: 'active',
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Edit Government Client' : 'Add Government Client'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientType">Client Type</Label>
                  <Select 
                    value={formData.clientType} 
                    onValueChange={(value) => setFormData({ ...formData, clientType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local_authority">Local Authority</SelectItem>
                      <SelectItem value="central_government">Central Government</SelectItem>
                      <SelectItem value="nhs_trust">NHS Trust</SelectItem>
                      <SelectItem value="housing_association">Housing Association</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonName">Contact Person</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPersonEmail">Email</Label>
                  <Input
                    id="contactPersonEmail"
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonPhone">Phone</Label>
                  <Input
                    id="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="e.g., Net 30 days"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceFrequency">Invoice Frequency</Label>
                  <Select 
                    value={formData.invoiceFrequency} 
                    onValueChange={(value) => setFormData({ ...formData, invoiceFrequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  placeholder="Any special billing instructions..."
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingClient ? 'Update' : 'Create'} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {clients && clients.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Client Name</TableHead>
                  <TableHead className="min-w-[150px]">Type</TableHead>
                  <TableHead className="min-w-[150px] hidden md:table-cell">Contact Person</TableHead>
                  <TableHead className="min-w-[200px] hidden lg:table-cell">Contact Details</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.invoiceFrequency} invoicing
                      </div>
                      <div className="md:hidden text-sm text-muted-foreground mt-1">
                        {client.contactPersonName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {getClientTypeLabel(client.clientType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="font-medium">{client.contactPersonName}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.paymentTerms}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.contactPersonEmail}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.contactPersonPhone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(client)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(client.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Government Clients</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first government client to begin billing.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Client
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}