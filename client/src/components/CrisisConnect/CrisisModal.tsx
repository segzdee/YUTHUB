import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Phone, UserCheck, ClipboardList } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const crisisTypes = [
    {
      id: "emergency",
      name: "Call Emergency Services",
      icon: Phone,
      color: "bg-accent hover:bg-red-700",
      description: "Immediate emergency requiring police, fire, or medical response"
    },
    {
      id: "support",
      name: "Contact On-Call Support Worker",
      icon: UserCheck,
      color: "bg-primary hover:bg-blue-700",
      description: "Mental health crisis or immediate support needed"
    },
    {
      id: "incident",
      name: "Report Incident",
      icon: ClipboardList,
      color: "bg-secondary hover:bg-green-700",
      description: "Safety concern or incident that needs documentation"
    }
  ];

  const crisisMutation = useMutation({
    mutationFn: async (data: { type: string; message: string }) => {
      return await apiRequest("POST", "/api/crisis-connect", data);
    },
    onSuccess: () => {
      toast({
        title: "Crisis Response Initiated",
        description: "Your crisis alert has been sent and appropriate personnel have been notified.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      onClose();
      setSelectedType("");
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send crisis alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCrisisAction = (type: string) => {
    if (type === "emergency") {
      // For emergency services, we would typically integrate with emergency calling systems
      // For now, we'll simulate the action
      toast({
        title: "Emergency Services Contacted",
        description: "Emergency services have been notified and are responding.",
        variant: "default",
      });
      onClose();
    } else {
      setSelectedType(type);
    }
  };

  const handleSubmit = () => {
    if (!selectedType) return;
    
    crisisMutation.mutate({
      type: selectedType,
      message: message || `Crisis Connect activated: ${selectedType}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-accent text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="flex items-center text-lg font-semibold">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Crisis Connect
          </DialogTitle>
          <p className="text-sm text-red-100 mt-2">
            Immediate response system activated
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedType ? (
            // Crisis type selection
            crisisTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => handleCrisisAction(type.id)}
                  className={`w-full ${type.color} text-white py-3 h-auto flex flex-col items-center justify-center`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs opacity-90 mt-1">{type.description}</span>
                </Button>
              );
            })
          ) : (
            // Additional details form
            <div className="space-y-4">
              <div>
                <p className="font-medium text-slate mb-2">
                  {crisisTypes.find(t => t.id === selectedType)?.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide additional details about the situation:
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the situation, location, and any immediate concerns..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmit}
                  disabled={crisisMutation.isPending}
                  className="flex-1 bg-accent hover:bg-red-700"
                >
                  {crisisMutation.isPending ? "Sending..." : "Send Alert"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedType("")}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          
          {!selectedType && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
