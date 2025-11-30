# Algorithmic Explainability & Transparency Implementation
## Risk Scoring Dashboard for YUTHUB Platform

**Version**: 1.0  
**Date**: November 30, 2024  
**Status**: SPECIFICATION - READY FOR DEVELOPMENT  
**Priority**: **P0 - CRITICAL** (Blocks production deployment)

---

## EXECUTIVE SUMMARY

**Problem**: YUTHUB currently implements risk scoring for residents without transparency about how scores are calculated. This violates:
- UK GDPR Article 22 (automated decision-making)
- UK GDPR Article 13/14 (right to information)
- Equality Act 2010 (potential indirect discrimination)

**Solution**: Implement "explainability dashboard" showing residents and staff:
1. What their risk score is
2. Which factors contributed to the score
3. How the score has changed over time
4. How to challenge the score

**Ethical Principle**: **"If you can't explain it, you shouldn't deploy it"**

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Existing Risk Scoring Logic

**Database Schema** (from `residents` table):
```typescript
risk_level: text CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
vulnerability_factors: jsonb  // Array of vulnerability indicators
support_needs: jsonb         // Array of support requirement codes
```

**Current Problems**:
❌ No documented algorithm (opaque "black box")
❌ No factor weighting transparency
❌ No historical tracking of score changes
❌ No explanation provided to residents or staff
❌ No fairness testing across demographics

### 1.2 Legal Obligations

**UK GDPR Article 22** - Right not to be subject to solely automated decision-making:
- **Applies if**: Score influences accommodation decisions, support allocation, or restrictions
- **Requires**: Human involvement in decision OR explicit consent OR legal basis + safeguards
- **YUTHUB Status**: ⚠️ LIKELY NON-COMPLIANT (need clarification on how scores used)

**UK GDPR Article 13/14** - Information to be provided:
- Existence of automated decision-making
- Logic involved
- Significance and envisaged consequences

**Equality Act 2010** - Indirect discrimination:
- If algorithm uses proxies correlated with protected characteristics (race, disability)
- If disparate impact on protected groups
- Requires justification + proportionality

---

## 2. PROPOSED SOLUTION: EXPLAINABILITY DASHBOARD

### 2.1 User Stories

**As a resident**, I want to:
1. See what my risk level is and understand what it means
2. Know which factors led to my risk score
3. Track how my score has changed over time
4. Challenge my score if I disagree
5. Understand what I can do to improve my score (if I want to)

**As a support worker**, I want to:
1. See the reasoning behind a resident's risk score
2. Override the algorithm if I disagree (with justification)
3. Understand which factors are most impactful
4. Identify residents whose scores have suddenly increased

**As a platform admin**, I want to:
1. Audit the algorithm for bias
2. See score distributions across demographics
3. Identify if the algorithm is performing as intended

### 2.2 Dashboard Components

#### Component 1: Risk Score Summary Card

**Display**:
- Current risk level (low/medium/high/critical)
- Plain English explanation: "What this means for you"
- Date of last assessment
- Assessed by: [Staff name] with system support

**Example**:
```
┌────────────────────────────────────┐
│ Your Risk Level: MEDIUM            │
│                                     │
│ This means you may need extra      │
│ support in some areas of your      │
│ life, and staff will check in      │
│ with you regularly.                │
│                                     │
│ Last assessed: 15 Nov 2024          │
│ By: Sarah Johnson (Key Worker)     │
│ [View full explanation →]          │
└────────────────────────────────────┘
```

#### Component 2: Contributing Factors Breakdown

**Display**:
- List of factors that influenced the score
- Weight/importance of each factor (visualized)
- Resident-friendly explanations

**Example**:
```
Factors influencing your score:

████████ (High influence)
Mental health support needs
→ You've told us you're receiving support from CAMHS, and we want to make sure you have the right help.

███████░ (Medium influence)
Previous incidents
→ There have been 2 incidents in the past 6 months. We're working with you to address underlying issues.

███░░░░░ (Low influence)
Length of placement
→ You've been here for 3 months. Adjusting to new accommodation can take time.

Not included in your score:
✗ Your ethnicity
✗ Your gender
✗ Your previous address
```

#### Component 3: Score History Timeline

**Display**:
- Line graph showing risk level over time
- Annotations for key events (e.g., "Started college", "Incident on 12 Oct")
- Option to view detailed change log

**Example**:
```
┌───────────────────────────────────────┐
│ Your Risk Level Over Time             │
│                                        │
│ Critical ┤                             │
│          │                             │
│ High     ┤     ●                       │
│          │    ╱ ╲                      │
│ Medium   ┤───●   ●───────●            │
│          │                ╲           │
│ Low      ┤                 ●──────●   │
│          └────┬────┬────┬────┬────    │
│              Aug  Sep  Oct  Nov        │
│                                        │
│ ● Oct 12: Incident at property         │
│ ● Nov 1: Started college              │
└────────────────────────────────────────┘
```

#### Component 4: Challenge & Appeal Process

**Display**:
- Button: "I don't agree with this assessment"
- Form to submit challenge
- Explanation of what happens next

**Challenge Form**:
```
Why do you disagree with your risk level?
[Text area]

What evidence can you provide?
- Supporting letter from counselor
- Evidence of progress (e.g., attendance records)
- Witness statements

Your challenge will be reviewed by:
1. Your key worker (within 3 days)
2. Senior manager (within 7 days)
3. Independent review (if still unresolved)
```

#### Component 5: Action Plan (Optional)

**Display** (if resident wants to engage):
- Suggested actions to reduce risk level
- Progress tracker
- Resources and support

**Example**:
```
Ways you can work on your risk level (if you want to):

☑ Attend weekly support sessions
   → You've been to 3 out of 4 sessions this month. Great!

☐ Complete budgeting course
   → Course starts next week. Interested? [Sign up]

☐ Reconnect with family (if safe)
   → Let's talk about whether this feels right for you.
```

---

## 3. TECHNICAL IMPLEMENTATION

### 3.1 Database Schema Changes

**New Table**: `risk_assessments`
```sql
CREATE TABLE risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES residents(id),
  assessment_date timestamptz NOT NULL DEFAULT now(),
  assessed_by_staff_id uuid NOT NULL REFERENCES staff_members(id),
  
  -- Score
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Explainability
  contributing_factors jsonb NOT NULL, -- See format below
  algorithm_version text NOT NULL, -- e.g., "v1.2.3"
  manual_override boolean DEFAULT false,
  override_reason text,
  
  -- Audit trail
  previous_risk_level text,
  score_change_reason text,
  
  -- GDPR
  resident_notified_at timestamptz,
  resident_viewed_at timestamptz,
  resident_challenged_at timestamptz,
  challenge_outcome text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_assessments_resident ON risk_assessments(resident_id, assessment_date DESC);
```

**`contributing_factors` JSONB format**:
```json
{
  "factors": [
    {
      "factor_id": "mental_health_support",
      "factor_name": "Mental Health Support Needs",
      "weight": 0.3,
      "value": "high",
      "explanation": "Receiving CAMHS support for anxiety and depression",
      "resident_explanation": "You've told us you're receiving support from CAMHS",
      "data_source": "support_plan",
      "modifiable": false
    },
    {
      "factor_id": "recent_incidents",
      "factor_name": "Recent Incidents",
      "weight": 0.25,
      "value": 2,
      "explanation": "2 incidents in past 6 months",
      "resident_explanation": "There have been 2 incidents in the past 6 months",
      "data_source": "incidents_table",
      "modifiable": true,
      "improvement_actions": ["attend_anger_management", "regular_checkins"]
    }
  ],
  "excluded_factors": [
    "ethnicity",
    "gender",
    "previous_address"
  ],
  "confidence_level": 0.85,
  "fairness_checked": true,
  "bias_mitigation_applied": ["demographic_parity", "equal_opportunity"]
}
```

### 3.2 Algorithm Documentation

**Risk Scoring Formula** (transparent, not ML black box):
```
overall_score = Σ (factor_weight * factor_score)

Where:
- factor_weight: Predetermined weight (set by experts, not data-driven to avoid bias)
- factor_score: Normalized value (0-100)

Risk Level Thresholds:
- Low: 0-25
- Medium: 26-50
- High: 51-75
- Critical: 76-100

Factor Weights (v1.0):
- Mental health needs: 0.30
- Substance use concerns: 0.25
- Recent incidents: 0.20
- Support network strength: -0.15 (protective factor)
- Engagement with support: -0.10 (protective factor)
- Housing stability history: 0.10
```

**Prohibited Factors** (NEVER use):
- Race, ethnicity, nationality
- Gender, sexual orientation
- Religion
- Disability (unless directly relevant to specific support need)
- Previous address (postcode discrimination)
- Family structure

### 3.3 Frontend Components

**Component File Structure**:
```
client/src/components/RiskExplainability/
├── RiskScoreSummary.tsx         // Main card
├── ContributingFactors.tsx      // Factor breakdown
├── RiskScoreTimeline.tsx        // Historical chart
├── ChallengeForm.tsx            // Appeal submission
├── ActionPlan.tsx               // Improvement suggestions
└── ExplainabilityDashboard.tsx  // Container component
```

**Example Component** (`RiskScoreSummary.tsx`):
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info } from 'lucide-react';

interface RiskScoreSummaryProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assessmentDate: Date;
  assessedBy: string;
  explanation: string;
}

export function RiskScoreSummary({ riskLevel, assessmentDate, assessedBy, explanation }: RiskScoreSummaryProps) {
  const riskConfig = {
    low: { color: 'green', icon: Info, text: 'Low Support Needs' },
    medium: { color: 'yellow', icon: AlertCircle, text: 'Medium Support Needs' },
    high: { color: 'orange', icon: AlertCircle, text: 'Higher Support Needs' },
    critical: { color: 'red', icon: AlertCircle, text: 'Intensive Support Needs' }
  };

  const config = riskConfig[riskLevel];

  return (
    <Card className="border-l-4 border-l-${config.color}-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <config.icon className="h-5 w-5" />
          Your Support Level: {config.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {explanation}
        </p>
        <div className="text-xs text-muted-foreground">
          <p>Last assessed: {assessmentDate.toLocaleDateString()}</p>
          <p>By: {assessedBy}</p>
        </div>
        <Button variant="link" className="mt-2 p-0">
          View full explanation →
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 3.4 API Endpoints

**GET** `/api/residents/:id/risk-assessment/current`
- Returns: Current risk assessment with full explainability data
- Access: Resident (own data), assigned staff, managers

**GET** `/api/residents/:id/risk-assessment/history`
- Returns: Array of past risk assessments (timeline)
- Access: Same as above

**POST** `/api/residents/:id/risk-assessment/challenge`
- Body: `{ reason: string, evidence: string[] }`
- Returns: Challenge submission confirmation
- Access: Resident (own data only)

**POST** `/api/residents/:id/risk-assessment/calculate`
- Triggers: Manual recalculation of risk score
- Returns: New risk assessment with explainability
- Access: Assigned staff only

---

## 4. FAIRNESS & BIAS MITIGATION

### 4.1 Bias Testing Protocol

**Pre-Deployment**:
1. Calculate score distribution across demographic groups
2. Test for disparate impact (80% rule: no group >20% different from baseline)
3. Test for equal opportunity (true positive rate similar across groups)
4. Document findings in bias audit report

**Example Test**:
```sql
-- Check if "high risk" proportion varies by ethnicity
SELECT 
  ethnicity,
  COUNT(*) as total_residents,
  SUM(CASE WHEN risk_level IN ('high', 'critical') THEN 1 ELSE 0 END) as high_risk_count,
  ROUND(100.0 * SUM(CASE WHEN risk_level IN ('high', 'critical') THEN 1 ELSE 0 END) / COUNT(*), 2) as high_risk_percentage
FROM residents
WHERE status = 'active'
GROUP BY ethnicity;

-- If ANY group has >20% difference from overall average: INVESTIGATE
```

### 4.2 Mitigation Strategies

**If Bias Detected**:
1. **Remove biased factor**: If factor correlates with protected characteristic
2. **Adjust weights**: Reduce weight of problematic factors
3. **Post-processing**: Threshold adjustment to equalize outcomes
4. **Human override mandatory**: Flag for human review before use

**Continuous Monitoring**:
- Quarterly bias audits
- Alert if score distributions shift significantly
- Annual external audit by independent data scientist

---

## 5. ROLLOUT PLAN

### Phase 1: Staff-Only View (Month 1)
- Staff can see explainability dashboard for residents
- Staff training on interpreting scores
- Staff feedback collected

### Phase 2: Resident Opt-In (Month 2-3)
- Residents can request to see their score
- Key worker supports interpretation
- Challenge process tested with pilot group

### Phase 3: Default Visibility (Month 4+)
- All residents see their score by default (can opt out)
- Ongoing monitoring of impact on resident wellbeing
- Continuous improvement based on feedback

---

## 6. SUCCESS METRICS

**Technical**:
- ✅ Algorithm documented and version-controlled
- ✅ Explainability data generated for 100% of scores
- ✅ No bias detected in quarterly audits (80% rule)

**User Experience**:
- ✅ 80%+ of residents understand their score (survey)
- ✅ <5% of scores challenged (low controversy)
- ✅ 90%+ of challenges resolved within 7 days

**Ethical**:
- ✅ Zero complaints to ICO about algorithmic discrimination
- ✅ Ethics Board approves algorithm design
- ✅ Independent audit confirms fairness

---

## 7. GOVERNANCE & OVERSIGHT

**Algorithm Review Board** (meets quarterly):
- 1x Data Scientist (external)
- 1x Care-Experienced Young Person
- 1x Safeguarding Expert
- 1x Housing Manager
- 1x Data Protection Officer

**Responsibilities**:
- Review bias audit results
- Approve algorithm changes
- Review challenge cases
- Recommend improvements

---

## APPENDICES

### Appendix A: Plain English Explanation Template
[To be developed with residents]

### Appendix B: Staff Training Materials
[To be developed]

### Appendix C: Algorithm Version Control Log
[To be maintained by engineering team]

### Appendix D: Bias Audit Report Template
[To be completed quarterly]

---

**Document Control**  
Version: 1.0  
Status: SPECIFICATION  
Development Priority: **P0 - BLOCKER**  
Estimated Effort: 3 developer-weeks  
Dependencies: DPIA approval, Ethics Board sign-off

**DO NOT DEPLOY RISK SCORING** without this explainability layer implemented.

