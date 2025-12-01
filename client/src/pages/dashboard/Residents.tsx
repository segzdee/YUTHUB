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

type ResidentStatus = "active" | "pending" | "moved_out" | "suspended";

interface Resident {
  id: string;
  name: string;
  age: number;
  property: string;
  room: string;
  keyWorker: string;
  independenceScore: number;
  status: ResidentStatus;
  moveInDate: string;
}

const mockResidents: Resident[] = [
  {
    id: "1",
    name: "Alice Johnson",
    age: 19,
    property: "Maple House",
    room: "101",
    keyWorker: "Sarah Smith",
    independenceScore: 75,
    status: "active",
    moveInDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Ben Williams",
    age: 18,
    property: "Oak Lodge",
    room: "205",
    keyWorker: "John Davis",
    independenceScore: 62,
    status: "active",
    moveInDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Charlie Brown",
    age: 20,
    property: "Pine Court",
    room: "303",
    keyWorker: "Emma Wilson",
    independenceScore: 88,
    status: "active",
    moveInDate: "2023-11-10",
  },
  {
    id: "4",
    name: "Diana Martinez",
    age: 19,
    property: "Maple House",
    room: "102",
    keyWorker: "Sarah Smith",
    independenceScore: 45,
    status: "pending",
    moveInDate: "2024-11-01",
  },
  {
    id: "5",
    name: "Ethan Taylor",
    age: 21,
    property: "Oak Lodge",
    room: "201",
    keyWorker: "John Davis",
    independenceScore: 92,
    status: "active",
    moveInDate: "2023-09-05",
  },
];

const statusColors: Record<ResidentStatus, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  moved_out: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  suspended: "bg-red-500/10 text-red-700 dark:text-red-400",
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

  const { data: residents = mockResidents, isLoading } = useQuery({
    queryKey: ["/api/residents"],
    placeholderData: mockResidents,
  });

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const matchesSearch =
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.keyWorker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.room.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || resident.status === statusFilter;
      const matchesProperty = propertyFilter === "all" || resident.property === propertyFilter;
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [residents, searchTerm, statusFilter, propertyFilter]);

  const uniqueProperties = useMemo(() => {
    return Array.from(new Set(residents.map((r) => r.property)));
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
                filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.age}</TableCell>
                    <TableCell>{resident.property}</TableCell>
                    <TableCell>{resident.room}</TableCell>
                    <TableCell>{resident.keyWorker}</TableCell>
                    <TableCell>
                      <span className={getScoreColor(resident.independenceScore)}>
                        {resident.independenceScore}/100
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[resident.status]} variant="outline">
                        {resident.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(resident.moveInDate).toLocaleDateString("en-GB")}
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
                ))
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
