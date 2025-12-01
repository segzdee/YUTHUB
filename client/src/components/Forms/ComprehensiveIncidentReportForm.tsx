import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Upload, X, Plus, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PersonInvolved {
  id: string;
  personType: 'resident' | 'staff' | 'visitor' | 'external';
  personId?: string;
  personName?: string;
  involvementRole: string;
  description?: string;
}

interface IncidentFormData {
  incidentDate: string;
  incidentTime: string;
  locationType: string;
  propertyId?: string;
  roomId?: string;
  externalLocation?: string;
  incidentCategory: string;
  incidentTitle: string;
  incidentDescription: string;
  immediateActionsTaken: string;
  injuriesSustained: boolean;
  injuryDescription?: string;
  harmLevel?: string;
  witnessPresent: boolean;
}

export default function ComprehensiveIncidentReportForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const [peopleInvolved, setPeopleInvolved] = useState<PersonInvolved[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [followUpActions, setFollowUpActions] = useState<Array<{
    title: string;
    description: string;
    priority: string;
    assignedTo: string;
    dueDate: string;
  }>>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IncidentFormData>({
    defaultValues: {
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: new Date().toTimeString().slice(0, 5),
      locationType: 'property',
      injuriesSustained: false,
      witnessPresent: false,
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['/api/staff-members'],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents'] });
      toast.success('Incident report created successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create incident: ${error.message}`);
    }
  });

  const watchLocationType = watch('locationType');
  const watchPropertyId = watch('propertyId');
  const watchIncidentCategory = watch('incidentCategory');
  const watchInjuries = watch('injuriesSustained');

  const calculateSeverity = (category: string, harmLevel: string): number => {
    const categoryScores: Record<string, number> = {
      'safeguarding_concern': 3,
      'self_harm': 3,
      'violence_aggression': 3,
      'missing_person': 3,
      'health_medical': 2,
      'substance_use': 2,
      'behavioral': 1,
      'property_damage': 1,
      'other': 1,
    };

    const harmScores: Record<string, number> = {
      'life_threatening': 4,
      'severe': 3,
      'moderate': 2,
      'minor': 1,
      'none': 0,
    };

    const catScore = categoryScores[category] || 1;
    const harmScore = harmScores[harmLevel] || 0;

    return Math.max(catScore, harmScore);
  };

  const addPersonInvolved = () => {
    setPeopleInvolved([
      ...peopleInvolved,
      {
        id: crypto.randomUUID(),
        personType: 'resident',
        involvementRole: 'subject',
      }
    ]);
  };

  const removePersonInvolved = (id: string) => {
    setPeopleInvolved(peopleInvolved.filter(p => p.id !== id));
  };

  const updatePersonInvolved = (id: string, field: string, value: any) => {
    setPeopleInvolved(peopleInvolved.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addFollowUpAction = () => {
    setFollowUpActions([
      ...followUpActions,
      {
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: IncidentFormData) => {
    const today = new Date();
    const incidentDateTime = new Date(`${data.incidentDate}T${data.incidentTime}`);

    if (incidentDateTime > today) {
      toast.error('Incident date and time cannot be in the future');
      return;
    }

    if (data.incidentDescription.length < 50) {
      toast.error('Incident description must be at least 50 characters');
      return;
    }

    const severity = calculateSeverity(
      data.incidentCategory,
      data.harmLevel || 'none'
    );

    const incidentData = {
      ...data,
      calculated_severity: severity,
      people_involved: peopleInvolved,
      follow_up_actions: followUpActions,
      attachment_count: attachments.length,
    };

    createIncidentMutation.mutate(incidentData);
  };

  const selectedProperty = properties.find((p: any) => p.id === watchPropertyId);
  const filteredRooms = rooms.filter((r: any) => r.property_id === watchPropertyId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Incident Details
          </CardTitle>
          <CardDescription>
            Record the core details of the incident
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incidentDate">Incident Date *</Label>
              <Input
                id="incidentDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('incidentDate', { required: 'Date is required' })}
              />
              {errors.incidentDate && (
                <p className="text-sm text-red-500 mt-1">{errors.incidentDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="incidentTime">Incident Time *</Label>
              <Input
                id="incidentTime"
                type="time"
                {...register('incidentTime', { required: 'Time is required' })}
              />
              {errors.incidentTime && (
                <p className="text-sm text-red-500 mt-1">{errors.incidentTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="incidentCategory">Incident Category *</Label>
            <Select
              onValueChange={(value) => setValue('incidentCategory', value)}
              defaultValue={watchIncidentCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safeguarding_concern">Safeguarding Concern</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="health_medical">Health/Medical</SelectItem>
                <SelectItem value="property_damage">Property Damage</SelectItem>
                <SelectItem value="missing_person">Missing Person</SelectItem>
                <SelectItem value="substance_use">Substance Use</SelectItem>
                <SelectItem value="self_harm">Self-Harm</SelectItem>
                <SelectItem value="violence_aggression">Violence/Aggression</SelectItem>
                <SelectItem value="discrimination">Discrimination</SelectItem>
                <SelectItem value="bullying">Bullying</SelectItem>
                <SelectItem value="exploitation">Exploitation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.incidentCategory && (
              <p className="text-sm text-red-500 mt-1">{errors.incidentCategory.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="incidentTitle">Incident Title *</Label>
            <Input
              id="incidentTitle"
              placeholder="Brief summary of the incident"
              {...register('incidentTitle', { required: 'Title is required' })}
            />
            {errors.incidentTitle && (
              <p className="text-sm text-red-500 mt-1">{errors.incidentTitle.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="incidentDescription">Detailed Description * (minimum 50 characters)</Label>
            <Textarea
              id="incidentDescription"
              rows={6}
              placeholder="Provide a detailed account of what happened, including context, sequence of events, and any relevant background information..."
              {...register('incidentDescription', {
                required: 'Description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.incidentDescription && (
                  <p className="text-sm text-red-500">{errors.incidentDescription.message}</p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {watch('incidentDescription')?.length || 0} / 50 characters minimum
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="immediateActionsTaken">Immediate Actions Taken *</Label>
            <Textarea
              id="immediateActionsTaken"
              rows={4}
              placeholder="Describe what actions were taken immediately following the incident..."
              {...register('immediateActionsTaken', { required: 'This field is required' })}
            />
            {errors.immediateActionsTaken && (
              <p className="text-sm text-red-500 mt-1">{errors.immediateActionsTaken.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="locationType">Location Type *</Label>
            <Select
              onValueChange={(value) => setValue('locationType', value)}
              defaultValue={watchLocationType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="external">External Location</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="education">Education Setting</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watchLocationType === 'property' && (
            <>
              <div>
                <Label htmlFor="propertyId">Property *</Label>
                <Select
                  onValueChange={(value) => setValue('propertyId', value)}
                  value={watchPropertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {watchPropertyId && filteredRooms.length > 0 && (
                <div>
                  <Label htmlFor="roomId">Room (Optional)</Label>
                  <Select onValueChange={(value) => setValue('roomId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRooms.map((room: any) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {watchLocationType === 'external' && (
            <div>
              <Label htmlFor="externalLocation">External Location Details *</Label>
              <Input
                id="externalLocation"
                placeholder="Enter location address or description"
                {...register('externalLocation', { required: 'Location is required for external incidents' })}
              />
              {errors.externalLocation && (
                <p className="text-sm text-red-500 mt-1">{errors.externalLocation.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            People Involved
          </CardTitle>
          <CardDescription>
            Add all people involved in the incident with their roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {peopleInvolved.map((person, index) => (
            <div key={person.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <Badge>Person {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePersonInvolved(person.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Person Type</Label>
                  <Select
                    value={person.personType}
                    onValueChange={(value) => updatePersonInvolved(person.id, 'personType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="external">External Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {person.personType === 'resident' && (
                  <div>
                    <Label>Select Resident</Label>
                    <Select
                      value={person.personId}
                      onValueChange={(value) => updatePersonInvolved(person.id, 'personId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose resident" />
                      </SelectTrigger>
                      <SelectContent>
                        {residents.map((resident: any) => (
                          <SelectItem key={resident.id} value={resident.id}>
                            {resident.first_name} {resident.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {person.personType === 'staff' && (
                  <div>
                    <Label>Select Staff Member</Label>
                    <Select
                      value={person.personId}
                      onValueChange={(value) => updatePersonInvolved(person.id, 'personId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member: any) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(person.personType === 'visitor' || person.personType === 'external') && (
                  <div>
                    <Label>Person Name</Label>
                    <Input
                      value={person.personName || ''}
                      onChange={(e) => updatePersonInvolved(person.id, 'personName', e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                )}

                <div>
                  <Label>Role in Incident</Label>
                  <Select
                    value={person.involvementRole}
                    onValueChange={(value) => updatePersonInvolved(person.id, 'involvementRole', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subject">Subject</SelectItem>
                      <SelectItem value="witness">Witness</SelectItem>
                      <SelectItem value="reporter">Reporter</SelectItem>
                      <SelectItem value="first_responder">First Responder</SelectItem>
                      <SelectItem value="victim">Victim</SelectItem>
                      <SelectItem value="perpetrator">Perpetrator</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Additional Details</Label>
                <Textarea
                  value={person.description || ''}
                  onChange={(e) => updatePersonInvolved(person.id, 'description', e.target.value)}
                  placeholder="Describe their involvement..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addPersonInvolved}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Person Involved
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Injuries and Harm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="injuriesSustained"
              checked={watchInjuries}
              onCheckedChange={(checked) => setValue('injuriesSustained', checked as boolean)}
            />
            <Label htmlFor="injuriesSustained">Were there any injuries sustained?</Label>
          </div>

          {watchInjuries && (
            <>
              <div>
                <Label htmlFor="harmLevel">Harm Level *</Label>
                <Select onValueChange={(value) => setValue('harmLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select harm level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="life_threatening">Life-Threatening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="injuryDescription">Injury Description *</Label>
                <Textarea
                  id="injuryDescription"
                  rows={4}
                  placeholder="Describe the injuries in detail, including location, severity, and any first aid provided..."
                  {...register('injuryDescription', {
                    required: watchInjuries ? 'Injury description is required' : false
                  })}
                />
                {errors.injuryDescription && (
                  <p className="text-sm text-red-500 mt-1">{errors.injuryDescription.message}</p>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  For serious injuries, body map documentation may be required.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Evidence Attachments
          </CardTitle>
          <CardDescription>
            Upload photos, documents, or other evidence related to the incident
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
            <p className="text-sm text-gray-500 mt-2">
              Accepted formats: Images, PDF, Word documents
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files:</Label>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={createIncidentMutation.isPending}>
          {createIncidentMutation.isPending ? 'Submitting...' : 'Submit Incident Report'}
        </Button>
      </div>
    </form>
  );
}
