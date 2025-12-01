import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type ResidentStatus = "active" | "pending" | "on_leave" | "moved_on" | "discharged" | "transferred";

interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_email?: string;
  contact_phone?: string;
  current_property_id?: string;
  current_room_id?: string;
  key_worker_id?: string;
  support_level?: string;
  risk_level?: string;
  status: ResidentStatus;
  admission_date?: string;
  properties?: { property_name: string };
  rooms?: { room_number: string };
  staff_members?: { first_name: string; last_name: string };
}

const statusColors: Record<ResidentStatus, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  on_leave: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  moved_on: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  discharged: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  transferred: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export default function Residents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  const { data: residents = [], isLoading, error } = useQuery({
    queryKey: ["residents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("residents")
        .select(`
          *,
          properties:current_property_id(property_name),
          rooms:current_room_id(room_number),
          staff_members:key_worker_id(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching residents:", error);
        throw error;
      }
      return data || [];
    },
  });

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
      const keyWorkerName = resident.staff_members
        ? `${resident.staff_members.first_name} ${resident.staff_members.last_name}`.toLowerCase()
        : "";
      const roomNumber = resident.rooms?.room_number || "";

      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        keyWorkerName.includes(searchTerm.toLowerCase()) ||
        roomNumber.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || resident.status === statusFilter;
      const matchesProperty = propertyFilter === "all" || resident.properties?.property_name === propertyFilter;
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [residents, searchTerm, statusFilter, propertyFilter]);

  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(residents.map((r) => r.properties?.property_name).filter(Boolean)));
  }, [residents]);

  const handleView = (id: string) => {
    toast({
      title: "View Resident",
      description: "Opening resident details...",
    });
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Edit Resident",
      description: "Opening edit form...",
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Delete Resident",
      description: "This action requires confirmation.",
      variant: "destructive",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Data",
      description: "Preparing CSV file...",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Residents</h1>
          <p className="text-muted-foreground">
            Manage and view all residents in your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate("/app/dashboard/residents/intake")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Resident
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, key worker, or room..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="moved_out">Moved Out</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {uniqueProperties.map((property) => (
              <SelectItem key={property} value={property}>
                {property}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Key Worker</TableHead>
                <TableHead>Independence Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No residents found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResidents.map((resident) => {
                  const age = resident.date_of_birth
                    ? Math.floor((Date.now() - new Date(resident.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : 0;
                  const supportScore = resident.support_level === 'low' ? 80 : resident.support_level === 'medium' ? 60 : resident.support_level === 'high' ? 40 : 20;

                  return (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.first_name} {resident.last_name}</TableCell>
                    <TableCell>{age}</TableCell>
                    <TableCell>{resident.properties?.property_name || "Unassigned"}</TableCell>
                    <TableCell>{resident.rooms?.room_number || "N/A"}</TableCell>
                    <TableCell>
                      {resident.staff_members
                        ? `${resident.staff_members.first_name} ${resident.staff_members.last_name}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <span className={getScoreColor(supportScore)}>
                        {supportScore}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[resident.status]} variant="outline">
                        {resident.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resident.admission_date
                        ? new Date(resident.admission_date).toLocaleDateString("en-GB")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleView(resident.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(resident.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(resident.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredResidents.length} of {residents.length} resident(s)
        </div>
      </div>
    </div>
  );
}
