import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Award, Calendar, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProgressTrackingForm from '@/components/Forms/ProgressTrackingForm';

interface ProgressEntry {
  id: string;
  residentName: string;
  goalArea: string;
  milestone: string;
  progress: number;
  lastUpdated: string;
  keyWorker: string;
  status: "on_track" | "attention_needed" | "achieved";
  notes: string;
}

const mockProgressEntries: ProgressEntry[] = [
  {
    id: "1",
    residentName: "Alice Johnson",
    goalArea: "Independent Living Skills",
    milestone: "Meal preparation without supervision",
    progress: 75,
    lastUpdated: "2024-11-28",
    keyWorker: "Sarah Smith",
    status: "on_track",
    notes: "Alice successfully prepared 3 meals independently this week",
  },
  {
    id: "2",
    residentName: "Ben Williams",
    goalArea: "Education & Employment",
    milestone: "Complete college enrollment",
    progress: 45,
    lastUpdated: "2024-11-25",
    keyWorker: "John Davis",
    status: "attention_needed",
    notes: "Application submitted, awaiting interview date",
  },
  {
    id: "3",
    residentName: "Charlie Brown",
    goalArea: "Financial Management",
    milestone: "Maintain budget for 3 months",
    progress: 100,
    lastUpdated: "2024-11-20",
    keyWorker: "Emma Wilson",
    status: "achieved",
    notes: "Successfully managed personal budget, ready for next milestone",
  },
  {
    id: "4",
    residentName: "Diana Martinez",
    goalArea: "Social Relationships",
    milestone: "Attend 2 community activities per week",
    progress: 60,
    lastUpdated: "2024-11-27",
    keyWorker: "Sarah Smith",
    status: "on_track",
    notes: "Attending youth club and sports group regularly",
  },
];

const statusColors = {
  on_track: "bg-green-500/10 text-green-700 dark:text-green-400",
  attention_needed: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  achieved: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

const goalAreas = [
  "Independent Living Skills",
  "Education & Employment",
  "Financial Management",
  "Social Relationships",
  "Health & Wellbeing",
];

export default function ProgressTracking() {
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ProgressEntry | null>(null);
  const [filterArea, setFilterArea] = useState<string>("all");

  const { data: entries = mockProgressEntries, isLoading } = useQuery({
    queryKey: ["/api/progress-tracking"],
    placeholderData: mockProgressEntries,
  });

  const filteredEntries = filterArea === "all"
    ? entries
    : entries.filter(e => e.goalArea === filterArea);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and record resident progress toward independence goals
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Progress
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {goalAreas.length} areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter(e => e.status === "on_track").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Making good progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achieved</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter(e => e.status === "achieved").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Milestones completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(entries.reduce((sum, e) => sum + e.progress, 0) / entries.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall completion
            </p>
          </CardContent>
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No progress entries yet
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Your First Progress Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="overflow-x-auto flex-wrap h-auto">
            <TabsTrigger value="all" onClick={() => setFilterArea("all")}>
              All Goals
            </TabsTrigger>
            {goalAreas.map((area) => (
              <TabsTrigger
                key={area}
                value={area}
                onClick={() => setFilterArea(area)}
              >
                {area}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filterArea || "all"} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{entry.residentName}</CardTitle>
                        <CardDescription className="text-sm">
                          {entry.goalArea}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[entry.status]} variant="outline">
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">{entry.milestone}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{entry.progress}%</span>
                        </div>
                        <Progress
                          value={entry.progress}
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.lastUpdated).toLocaleDateString("en-GB")}</span>
                      </div>
                      <div>
                        Key Worker: {entry.keyWorker}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Progress Entry</DialogTitle>
            <DialogDescription>
              Record progress updates and milestone achievements
            </DialogDescription>
          </DialogHeader>
          <ProgressTrackingForm />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Progress Details - {selectedEntry?.residentName}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Goal Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Goal Area:</span>
                    <p className="font-medium">{selectedEntry.goalArea}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={statusColors[selectedEntry.status]} variant="outline">
                      {selectedEntry.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Key Worker:</span>
                    <p className="font-medium">{selectedEntry.keyWorker}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium">
                      {new Date(selectedEntry.lastUpdated).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Milestone</h3>
                <p className="text-sm">{selectedEntry.milestone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <div className="space-y-2">
                  <Progress value={selectedEntry.progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {selectedEntry.progress}% complete
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{selectedEntry.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
