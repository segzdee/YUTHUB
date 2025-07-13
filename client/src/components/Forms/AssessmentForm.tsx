import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAssessmentFormSchema } from "@shared/schema";
import { ClipboardList, User, Calendar, Star } from "lucide-react";

interface AssessmentFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export default function AssessmentForm({ onSuccess, initialData }: AssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assessmentType, setAssessmentType] = useState("");

  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['/api/staff-members'],
  });

  const form = useForm({
    resolver: zodResolver(insertAssessmentFormSchema),
    defaultValues: initialData || {
      residentId: "",
      assessmentType: "",
      assessorId: "",
      responses: {},
      score: "",
      recommendations: "",
      nextReviewDate: "",
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/assessment-forms", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessment-forms'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete assessment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      residentId: parseInt(data.residentId),
      assessorId: parseInt(data.assessorId),
      score: data.score ? parseInt(data.score) : null,
      responses: typeof data.responses === 'string' ? JSON.parse(data.responses) : data.responses,
    };
    createAssessmentMutation.mutate(formattedData);
  };

  const getAssessmentQuestions = (type: string) => {
    const questions = {
      intake: [
        { id: 'housing_history', question: 'Previous housing experience', type: 'text' },
        { id: 'support_needs', question: 'Primary support needs', type: 'multiselect' },
        { id: 'independence_level', question: 'Current independence level (1-5)', type: 'number' },
        { id: 'risk_factors', question: 'Identified risk factors', type: 'multiselect' },
        { id: 'goals', question: 'Short-term goals', type: 'text' },
      ],
      review: [
        { id: 'progress_made', question: 'Progress since last review', type: 'text' },
        { id: 'challenges', question: 'Current challenges', type: 'text' },
        { id: 'support_effectiveness', question: 'Support plan effectiveness (1-5)', type: 'number' },
        { id: 'goal_achievement', question: 'Goals achieved', type: 'text' },
        { id: 'next_steps', question: 'Next steps', type: 'text' },
      ],
      move_on: [
        { id: 'readiness_level', question: 'Readiness for independent living (1-5)', type: 'number' },
        { id: 'skills_assessment', question: 'Life skills assessment', type: 'text' },
        { id: 'support_networks', question: 'Support networks in place', type: 'text' },
        { id: 'accommodation_preference', question: 'Preferred accommodation type', type: 'text' },
        { id: 'ongoing_support', question: 'Ongoing support requirements', type: 'text' },
      ],
      risk: [
        { id: 'risk_level', question: 'Overall risk level (1-5)', type: 'number' },
        { id: 'risk_factors', question: 'Identified risk factors', type: 'multiselect' },
        { id: 'protective_factors', question: 'Protective factors', type: 'text' },
        { id: 'mitigation_strategies', question: 'Risk mitigation strategies', type: 'text' },
        { id: 'monitoring_plan', question: 'Monitoring and review plan', type: 'text' },
      ],
    };
    return questions[type as keyof typeof questions] || [];
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Assessment Form
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
                name="assessmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Type</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setAssessmentType(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assessment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="intake">Initial Intake</SelectItem>
                        <SelectItem value="review">Regular Review</SelectItem>
                        <SelectItem value="move_on">Move-on Assessment</SelectItem>
                        <SelectItem value="risk">Risk Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assessorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessor" />
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

            {assessmentType && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Assessment Questions</h3>
                {getAssessmentQuestions(assessmentType).map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {index + 1}. {question.question}
                      </label>
                      {question.type === 'text' && (
                        <Textarea
                          placeholder="Enter your response..."
                          className="min-h-[80px]"
                          onChange={(e) => {
                            const currentResponses = form.getValues('responses') || {};
                            form.setValue('responses', {
                              ...currentResponses,
                              [question.id]: e.target.value,
                            });
                          }}
                        />
                      )}
                      {question.type === 'number' && (
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          onChange={(e) => {
                            const currentResponses = form.getValues('responses') || {};
                            form.setValue('responses', {
                              ...currentResponses,
                              [question.id]: parseInt(e.target.value),
                            });
                          }}
                        />
                      )}
                      {question.type === 'multiselect' && (
                        <div className="grid grid-cols-2 gap-2">
                          {['Mental Health', 'Substance Use', 'Education', 'Employment', 'Social Skills', 'Life Skills'].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${question.id}-${option}`}
                                onCheckedChange={(checked) => {
                                  const currentResponses = form.getValues('responses') || {};
                                  const currentOptions = currentResponses[question.id] || [];
                                  const newOptions = checked
                                    ? [...currentOptions, option]
                                    : currentOptions.filter((opt: string) => opt !== option);
                                  form.setValue('responses', {
                                    ...currentResponses,
                                    [question.id]: newOptions,
                                  });
                                }}
                              />
                              <label
                                htmlFor={`${question.id}-${option}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Overall Score (1-5)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextReviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Next Review Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter recommendations based on this assessment..."
                      className="min-h-[100px]"
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
              <Button type="submit" disabled={createAssessmentMutation.isPending}>
                {createAssessmentMutation.isPending ? "Completing..." : "Complete Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}