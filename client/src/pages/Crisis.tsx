import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Phone, Shield, Users, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Crisis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [crisisType, setCrisisType] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const crisisConnectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/crisis-connect", data),
    onSuccess: () => {
      toast({
        title: "Crisis Response Initiated",
        description: "Emergency services have been notified. Help is on the way.",
      });
      setCrisisType("");
      setMessage("");
      setLocation("");
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to initiate crisis response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCrisisConnect = () => {
    if (!crisisType) {
      toast({
        title: "Missing Information",
        description: "Please select a crisis type before proceeding.",
        variant: "destructive",
      });
      return;
    }

    crisisConnectMutation.mutate({
      type: crisisType,
      message,
      location,
    });
  };

  const emergencyContacts = [
    { name: "Emergency Services", number: "999", type: "emergency" },
    { name: "Crisis Support Team", number: "0800-123-4567", type: "crisis" },
    { name: "Mental Health Crisis", number: "116-123", type: "mental-health" },
    { name: "Domestic Violence", number: "0808-2000-247", type: "domestic-violence" },
  ];

  const crisisProtocols = [
    {
      title: "Immediate Safety",
      steps: [
        "Ensure the immediate safety of all individuals",
        "Call 999 if there is immediate danger",
        "Evacuate if necessary",
        "Provide first aid if required",
      ],
    },
    {
      title: "Assessment",
      steps: [
        "Assess the situation and severity",
        "Identify all individuals involved",
        "Determine required support services",
        "Document the incident",
      ],
    },
    {
      title: "Response",
      steps: [
        "Contact appropriate emergency services",
        "Notify senior management",
        "Provide ongoing support",
        "Follow up with all parties",
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Crisis Connect</h1>
            <p className="text-muted-foreground mt-2">
              Emergency response system for crisis situations
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Crisis Response Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Crisis Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Crisis Type</label>
                      <Select value={crisisType} onValueChange={setCrisisType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crisis type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical Emergency</SelectItem>
                          <SelectItem value="mental-health">Mental Health Crisis</SelectItem>
                          <SelectItem value="violence">Violence/Aggression</SelectItem>
                          <SelectItem value="self-harm">Self-Harm Risk</SelectItem>
                          <SelectItem value="missing">Missing Person</SelectItem>
                          <SelectItem value="fire">Fire/Evacuation</SelectItem>
                          <SelectItem value="other">Other Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Sunrise House</SelectItem>
                          <SelectItem value="2">Meadow View</SelectItem>
                          <SelectItem value="3">Oak Lodge</SelectItem>
                          <SelectItem value="4">Riverside Court</SelectItem>
                          <SelectItem value="5">Haven Place</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Additional Information</label>
                      <Textarea
                        placeholder="Describe the situation and any immediate actions taken..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleCrisisConnect}
                      disabled={crisisConnectMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {crisisConnectMutation.isPending ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Initiating Response...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Initiate Crisis Response
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Crisis Protocols */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Crisis Response Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {crisisProtocols.map((protocol, index) => (
                      <div key={index}>
                        <h3 className="font-semibold mb-3">{protocol.title}</h3>
                        <div className="space-y-2">
                          {protocol.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2">
                              <span className="text-sm bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {stepIndex + 1}
                              </span>
                              <p className="text-sm">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{contact.number}</span>
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    On-Call Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground">Senior Manager</p>
                      </div>
                      <Badge variant="default">On Duty</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Mike Chen</p>
                        <p className="text-xs text-muted-foreground">Support Worker</p>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      View Incident Log
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Check Staff Status
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Property Locations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}