import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskDomain {
  domain_name: string;
  likelihood: number;
  impact: number;
  evidence: string;
  current_controls: string;
  additional_controls_needed: string;
}

const RISK_DOMAINS = [
  { value: 'self_harm', label: 'Self-Harm', description: 'Risk of self-inflicted injury or harm' },
  { value: 'harm_to_others', label: 'Harm to Others', description: 'Risk of causing harm to others' },
  { value: 'exploitation', label: 'Exploitation', description: 'Vulnerability to exploitation' },
  { value: 'substance_misuse', label: 'Substance Misuse', description: 'Risk related to drug/alcohol use' },
  { value: 'missing_episodes', label: 'Missing Episodes', description: 'Risk of going missing' },
  { value: 'mental_health', label: 'Mental Health', description: 'Mental health deterioration risk' },
  { value: 'physical_health', label: 'Physical Health', description: 'Physical health concerns' },
  { value: 'criminal_activity', label: 'Criminal Activity', description: 'Risk of involvement in crime' },
  { value: 'accommodation', label: 'Accommodation', description: 'Housing stability risk' },
  { value: 'financial', label: 'Financial', description: 'Financial vulnerability' },
];

export default function RiskAssessmentModule({ residentId }: { residentId: string }) {
  const queryClient = useQueryClient();
  const [currentDomain, setCurrentDomain] = useState(0);
  const [domains, setDomains] = useState<RiskDomain[]>(
    RISK_DOMAINS.map(d => ({
      domain_name: d.value,
      likelihood: 1,
      impact: 1,
      evidence: '',
      current_controls: '',
      additional_controls_needed: '',
    }))
  );

  const [assessmentData, setAssessmentData] = useState({
    assessment_type: 'routine' as const,
    risk_summary: '',
    protective_factors: '',
    trigger_factors: '',
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: previousAssessments = [] } = useQuery({
    queryKey: [`/api/residents/${residentId}/risk-assessments`],
  });

  const { data: resident } = useQuery({
    queryKey: [`/api/residents/${residentId}`],
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/risk-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create risk assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/residents/${residentId}/risk-assessments`] });
      toast.success('Risk assessment completed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save assessment: ${error.message}`);
    },
  });

  const updateDomain = (index: number, field: keyof RiskDomain, value: any) => {
    setDomains(domains.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const calculateOverallRisk = () => {
    const scores = domains.map(d => d.likelihood * d.impact);
    const avgLikelihood = Math.round(domains.reduce((sum, d) => sum + d.likelihood, 0) / domains.length);
    const avgImpact = Math.round(domains.reduce((sum, d) => sum + d.impact, 0) / domains.length);
    const overallScore = avgLikelihood * avgImpact;
    return { avgLikelihood, avgImpact, overallScore };
  };

  const getRiskLevel = (score: number) => {
    if (score <= 8) return { label: 'Green', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score <= 15) return { label: 'Amber', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Red', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const handleSubmit = () => {
    const { avgLikelihood, avgImpact } = calculateOverallRisk();

    const completeAssessment = {
      resident_id: residentId,
      ...assessmentData,
      overall_likelihood: avgLikelihood,
      overall_impact: avgImpact,
      domains: domains,
    };

    createAssessmentMutation.mutate(completeAssessment);
  };

  const currentDomainData = domains[currentDomain];
  const domainInfo = RISK_DOMAINS[currentDomain];
  const { overallScore } = calculateOverallRisk();
  const riskLevel = getRiskLevel(overallScore);

  const previousRiskScore = previousAssessments[0]?.overall_risk_score || 0;
  const riskTrend = overallScore > previousRiskScore ? 'increasing' : overallScore < previousRiskScore ? 'decreasing' : 'stable';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Comprehensive risk evaluation for {resident?.first_name} {resident?.last_name}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-600">Overall Risk:</span>
                <Badge className={`${riskLevel.color} text-white`}>
                  {riskLevel.label} ({overallScore}/25)
                </Badge>
              </div>
              {previousAssessments.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  {riskTrend === 'increasing' && (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Risk Increasing</span>
                    </>
                  )}
                  {riskTrend === 'decreasing' && (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Risk Decreasing</span>
                    </>
                  )}
                  {riskTrend === 'stable' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600">Risk Stable</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Assessment Type</Label>
            <Select
              value={assessmentData.assessment_type}
              onValueChange={(value: any) =>
                setAssessmentData({ ...assessmentData, assessment_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial Assessment</SelectItem>
                <SelectItem value="routine">Routine Review</SelectItem>
                <SelectItem value="incident_triggered">Incident-Triggered</SelectItem>
                <SelectItem value="review">Scheduled Review</SelectItem>
                <SelectItem value="discharge">Discharge Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Risk Domains</h3>
              <span className="text-sm text-gray-600">
                Domain {currentDomain + 1} of {RISK_DOMAINS.length}
              </span>
            </div>
            <Progress value={((currentDomain + 1) / RISK_DOMAINS.length) * 100} />
          </div>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{domainInfo.label}</CardTitle>
              <CardDescription>{domainInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Likelihood (1-5)</Label>
                  <div className="mt-2 space-y-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateDomain(currentDomain, 'likelihood', value)}
                        className={`w-full p-2 text-left rounded border transition-colors ${
                          currentDomainData.likelihood === value
                            ? 'bg-blue-100 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{value}</span> -{' '}
                        {value === 1 && 'Rare'}
                        {value === 2 && 'Unlikely'}
                        {value === 3 && 'Possible'}
                        {value === 4 && 'Likely'}
                        {value === 5 && 'Almost Certain'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Impact (1-5)</Label>
                  <div className="mt-2 space-y-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateDomain(currentDomain, 'impact', value)}
                        className={`w-full p-2 text-left rounded border transition-colors ${
                          currentDomainData.impact === value
                            ? 'bg-blue-100 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{value}</span> -{' '}
                        {value === 1 && 'Insignificant'}
                        {value === 2 && 'Minor'}
                        {value === 3 && 'Moderate'}
                        {value === 4 && 'Major'}
                        {value === 5 && 'Severe'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Risk Score</Label>
                  <Badge className={getRiskLevel(currentDomainData.likelihood * currentDomainData.impact).color + ' text-white'}>
                    {currentDomainData.likelihood * currentDomainData.impact} / 25
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="evidence">Evidence and Rationale *</Label>
                <Textarea
                  id="evidence"
                  value={currentDomainData.evidence}
                  onChange={(e) => updateDomain(currentDomain, 'evidence', e.target.value)}
                  rows={4}
                  placeholder="Provide specific evidence, incidents, behaviors, or concerns that support this risk rating..."
                />
              </div>

              <div>
                <Label htmlFor="current_controls">Current Controls in Place</Label>
                <Textarea
                  id="current_controls"
                  value={currentDomainData.current_controls}
                  onChange={(e) => updateDomain(currentDomain, 'current_controls', e.target.value)}
                  rows={3}
                  placeholder="Describe existing support, interventions, or safeguards currently in place..."
                />
              </div>

              <div>
                <Label htmlFor="additional_controls">Additional Controls Needed</Label>
                <Textarea
                  id="additional_controls"
                  value={currentDomainData.additional_controls_needed}
                  onChange={(e) => updateDomain(currentDomain, 'additional_controls_needed', e.target.value)}
                  rows={3}
                  placeholder="Identify any additional support, interventions, or measures that should be implemented..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentDomain(Math.max(0, currentDomain - 1))}
                  disabled={currentDomain === 0}
                >
                  Previous Domain
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentDomain(Math.min(RISK_DOMAINS.length - 1, currentDomain + 1))}
                  disabled={currentDomain === RISK_DOMAINS.length - 1}
                >
                  Next Domain
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentDomain === RISK_DOMAINS.length - 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Overall Risk Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="risk_summary">Risk Summary *</Label>
                  <Textarea
                    id="risk_summary"
                    value={assessmentData.risk_summary}
                    onChange={(e) =>
                      setAssessmentData({ ...assessmentData, risk_summary: e.target.value })
                    }
                    rows={4}
                    placeholder="Provide an overall summary of the key risks identified..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="protective_factors">Protective Factors</Label>
                  <Textarea
                    id="protective_factors"
                    value={assessmentData.protective_factors}
                    onChange={(e) =>
                      setAssessmentData({ ...assessmentData, protective_factors: e.target.value })
                    }
                    rows={3}
                    placeholder="List strengths, support systems, and factors that help mitigate risks..."
                  />
                </div>

                <div>
                  <Label htmlFor="trigger_factors">Trigger Factors</Label>
                  <Textarea
                    id="trigger_factors"
                    value={assessmentData.trigger_factors}
                    onChange={(e) =>
                      setAssessmentData({ ...assessmentData, trigger_factors: e.target.value })
                    }
                    rows={3}
                    placeholder="Identify situations, events, or conditions that may escalate risks..."
                  />
                </div>

                <div>
                  <Label htmlFor="next_review_date">Next Review Date *</Label>
                  <input
                    type="date"
                    id="next_review_date"
                    value={assessmentData.next_review_date}
                    onChange={(e) =>
                      setAssessmentData({ ...assessmentData, next_review_date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This risk assessment will be saved and linked to the resident's support plan.
                    High-risk assessments will trigger automatic notifications to key staff.
                  </AlertDescription>
                </Alert>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createAssessmentMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createAssessmentMutation.isPending ? 'Saving Assessment...' : 'Complete Risk Assessment'}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {previousAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment History</CardTitle>
            <CardDescription>Previous assessments and risk trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {previousAssessments.slice(0, 5).map((assessment: any) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(assessment.assessment_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{assessment.assessment_type.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge className={`${getRiskLevel(assessment.overall_risk_score).color} text-white`}>
                    {getRiskLevel(assessment.overall_risk_score).label} ({assessment.overall_risk_score}/25)
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
