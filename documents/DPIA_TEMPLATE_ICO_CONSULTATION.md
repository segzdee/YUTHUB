# Data Protection Impact Assessment (DPIA)
## YUTHUB Youth Housing Management Platform

**Date**: November 30, 2024  
**Version**: 1.0  
**Status**: DRAFT - REQUIRES ICO CONSULTATION  
**Review Date**: Every 12 months or upon significant system changes

---

## EXECUTIVE SUMMARY

**Purpose**: This DPIA assesses the data protection risks associated with YUTHUB, a multi-tenant SaaS platform processing personal data of vulnerable young people (ages 16-21) experiencing housing instability.

**Necessity Assessment**: DPIA is **MANDATORY** under UK GDPR Article 35 because:
1. ✅ **Systematic monitoring** of vulnerable individuals
2. ✅ **Large-scale processing** of special category data (health, safeguarding)
3. ✅ **Automated decision-making** (risk scoring, independence assessment)
4. ✅ **Vulnerable data subjects** (minors, care leavers)

**Risk Level**: **HIGH** - Processing sensitive data about vulnerable populations with safeguarding obligations

**ICO Consultation**: **REQUIRED** due to high residual risks identified

---

## PART 1: SYSTEMATIC DESCRIPTION OF PROCESSING

### 1.1 Nature of Processing

**Platform Overview**:
- Multi-tenant SaaS platform for youth housing management
- Serves UK-based housing charities, local authorities, and housing associations
- Processes data for residents aged 16-21 in supported accommodation

**Data Collection Methods**:
- Staff intake assessments
- Key worker observations and progress notes
- Incident reporting by staff
- Self-reported information from residents
- External agency referrals (social services, police, healthcare)
- Automated system-generated data (login times, data access patterns)

**Data Storage**:
- Cloud infrastructure: Supabase (PostgreSQL on AWS)
- Geographic location: UK/EU data centers
- Backup frequency: Daily automated backups
- Retention: Varies by data type (see Section 1.7)

### 1.2 Scope of Processing

**Data Subjects**:
1. **Primary**: Young people aged 16-21 in supported housing (~500-5,000 estimated at full deployment)
2. **Secondary**: Support workers, housing managers, administrative staff (~200-1,000)
3. **Tertiary**: Emergency contacts, family members (names only)

**Categories of Personal Data**:

#### Standard Personal Data:
- Full name, preferred name
- Date of birth, age
- Contact details (email, phone)
- Address history
- Nationality, ethnicity
- Primary language
- Emergency contact details

#### Special Category Data (Article 9 UK GDPR):
- **Health Data**:
  - Medical conditions
  - Medications and dosages
  - Allergies
  - GP details
  - Mental health status
  - Substance use history
- **Safeguarding Data**:
  - Abuse disclosures
  - Risk assessments
  - Vulnerability factors
  - Child protection records (for 16-17 year-olds)

#### Criminal Offence Data (Article 10):
- Legal status (remand, court orders)
- Police incident reports
- Criminal history (where relevant to safeguarding)

### 1.3 Purpose and Legal Basis

| Purpose | Legal Basis | Article 9 Condition (if applicable) |
|---------|-------------|-------------------------------------|
| Accommodation management | Contractual necessity (tenancy agreement) | N/A |
| Support planning | Legitimate interests (duty of care) | Substantial public interest (safeguarding) |
| Safeguarding monitoring | Legal obligation (Children Act 1989/2004, Care Act 2014) | Legal claims, vital interests |
| Risk assessment | Legitimate interests | Substantial public interest |
| Health & safety | Legal obligation (Health & Safety at Work Act) | Healthcare purposes |
| Financial management | Contractual necessity | N/A |
| Incident reporting | Legal obligation (safeguarding duties) | Legal claims |
| Performance analytics | Legitimate interests (service improvement) | N/A |

**Legitimate Interest Assessment (LIA)** completed: [Date] - Available on request

### 1.4 Context

**Relationship with Data Subjects**:
- **Power imbalance**: Housing providers have significant power over residents
- **Vulnerability**: Residents are in housing crisis, often with complex needs
- **Capacity considerations**: Some residents may lack capacity to consent
- **Age considerations**: 16-17 year-olds require specific consent protections

**Data Subject Expectations**:
- Residents expect data to be used for their support and safety
- Residents expect confidentiality except where safeguarding requires disclosure
- Staff expect access to necessary information to perform duties
- **Critical**: Residents may not expect algorithmic risk scoring

**Technology Used**:
- Cloud-based database (PostgreSQL)
- Web application (React frontend)
- Mobile access capability
- Algorithmic risk scoring (methodology: see Section 3.3)
- Automated alerts for high-risk incidents

### 1.5 Data Flow Mapping

```
[Resident Intake] → [Staff Data Entry] → [YUTHUB Database] → [Risk Algorithm] → [Staff Dashboard]
                                              ↓
                                    [Audit Log (Immutable)]
                                              ↓
                                    [Local Authority Reporting]
                                              ↓
                                    [Multi-Agency Safeguarding Hub (MASH)]
```

**External Data Sharing**:
1. **Local Authorities**: Statutory reporting obligations
2. **Police**: Safeguarding concerns, missing persons
3. **NHS**: Medical emergencies, mental health crises
4. **Courts**: Legal proceedings, eviction hearings

### 1.6 Retention Periods

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| **Safeguarding records (minors)** | 25 years after 18th birthday | Children Act 1989 guidance |
| **Safeguarding records (adults)** | 25 years after incident | Care Act 2014 guidance |
| **Standard support records** | 7 years after departure | Limitation Act 1980 |
| **Financial records** | 7 years | HMRC requirements |
| **Audit logs** | 7-25 years (depends on event type) | GDPR accountability |
| **Staff records** | 6 years after employment ends | Employment law |

### 1.7 Data Security Measures

**Technical Measures**:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Encryption in transit (TLS 1.3)
- ✅ Encryption at rest (AES-256)
- ✅ Immutable audit logging
- ✅ Multi-factor authentication (MFA) for staff
- ❌ **GAP**: End-to-end encryption for sensitive fields (planned)
- ❌ **GAP**: Database activity monitoring (planned)

**Organizational Measures**:
- ✅ Role-based access control (RBAC)
- ✅ Staff confidentiality agreements
- ✅ Data breach response plan
- ⚠️ **PARTIAL**: DBS checks for staff (client responsibility)
- ⚠️ **PARTIAL**: Staff safeguarding training (client responsibility)

---

## PART 2: NECESSITY AND PROPORTIONALITY

### 2.1 Necessity Assessment

| Processing Activity | Necessity Justification | Less Intrusive Alternative Considered? |
|---------------------|------------------------|---------------------------------------|
| Risk scoring algorithm | Required for staff safety and resource allocation | ✅ Manual risk assessment (rejected: inconsistent, time-intensive) |
| Medical data collection | Required for emergency response | ✅ External NHS records only (rejected: delayed access in crisis) |
| Safeguarding incident details | Legal obligation (Children Act) | ❌ No alternative |
| Ethnicity data | Equality monitoring (Equality Act 2010) | ✅ Optional field, resident can decline |
| Location tracking | ⚠️ **NOT CURRENTLY IMPLEMENTED** | N/A |

**Data Minimization**:
- ✅ No biometric data collected
- ✅ No social media data collected
- ✅ Criminal history only where directly relevant
- ⚠️ **REVIEW NEEDED**: "Notes" fields allow free text (risk of excessive data capture)

### 2.2 Proportionality

**Balancing Test**:
- **Aim**: Provide safe accommodation and support for vulnerable young people
- **Means**: Collect and process personal/sensitive data
- **Impact**: High privacy intrusion for individuals
- **Conclusion**: Proportionate ONLY if:
  1. Data access is strictly limited to those with legitimate need
  2. Residents understand what data is collected and why
  3. Algorithmic scoring is transparent and contestable
  4. Data security is robust

**Current Status**: ⚠️ **REQUIRES IMPROVEMENT** (see Section 5)

---

## PART 3: RISKS TO DATA SUBJECT RIGHTS AND FREEDOMS

### 3.1 Risk: Unauthorized Access to Sensitive Data

**Likelihood**: MEDIUM  
**Severity**: HIGH  
**Overall Risk**: HIGH

**Scenario**:
- SQL injection vulnerability
- Compromised staff credentials
- Insider threat (staff accessing records without legitimate need)

**Potential Harm to Data Subjects**:
- Disclosure of safeguarding concerns to unauthorized parties
- Reputational damage if abuse history revealed
- Emotional distress from privacy violation
- Safety risk if addresses shared with abusers

**Current Controls**:
- ✅ RLS enabled on all tables
- ✅ Parameterized queries (SQL injection protection)
- ✅ Audit logging of all data access
- ❌ **GAP**: No real-time anomaly detection for unusual access patterns

**Residual Risk**: MEDIUM

### 3.2 Risk: Discriminatory Algorithmic Decision-Making

**Likelihood**: MEDIUM  
**Severity**: HIGH  
**Overall Risk**: HIGH

**Scenario**:
- Risk scoring algorithm uses proxies correlated with race, disability
- Staff rely on algorithmic scores without independent judgment
- Young people labeled "high risk" receive less autonomy/trust

**Potential Harm to Data Subjects**:
- Discrimination (protected characteristics)
- Self-fulfilling prophecy (labeled "high risk" → treated as risky → behavior worsens)
- Limited opportunities (e.g., denied independent accommodation due to score)
- Psychological harm (internalization of "risk" label)

**Current Controls**:
- ❌ **GAP**: No algorithmic transparency (residents cannot see how scores calculated)
- ❌ **GAP**: No fairness testing across demographic groups
- ❌ **GAP**: No human override mechanism documented
- ❌ **GAP**: No regular bias audits

**Residual Risk**: **HIGH - UNACCEPTABLE**

**ICO Consultation Required**: YES

### 3.3 Risk: Data Breach Exposing Vulnerable Individuals

**Likelihood**: LOW  
**Severity**: CRITICAL  
**Overall Risk**: HIGH

**Scenario**:
- Ransomware attack encrypts database
- Backup tapes stolen
- Cloud provider breach

**Potential Harm to Data Subjects**:
- Safety risk if addresses disclosed to perpetrators of abuse
- Blackmail risk (sensitive safeguarding information)
- Identity theft (full names, DOBs, addresses)
- Discrimination if health/criminal data publicly disclosed

**Current Controls**:
- ✅ Encryption at rest and in transit
- ✅ Daily backups to secure location
- ✅ Incident response plan
- ⚠️ **PARTIAL**: Penetration testing (not yet conducted)
- ❌ **GAP**: No cyber insurance

**Residual Risk**: MEDIUM

### 3.4 Risk: Inadequate Consent from Minors

**Likelihood**: MEDIUM  
**Severity**: MEDIUM  
**Overall Risk**: MEDIUM

**Scenario**:
- 16-17 year-olds deemed not "Gillick competent" to consent
- Consent obtained under duress (e.g., "consent or no accommodation")
- Parental consent not obtained where required

**Potential Harm to Data Subjects**:
- Invalid processing of special category data
- Erosion of trust in housing provider
- Legal claims against organization

**Current Controls**:
- ⚠️ **PARTIAL**: Consent forms used (need review for age-appropriateness)
- ❌ **GAP**: No Gillick competence assessment process
- ❌ **GAP**: No parental consent workflow for under-16s (if applicable)

**Residual Risk**: MEDIUM

### 3.5 Risk: Excessive Data Retention

**Likelihood**: MEDIUM  
**Severity**: MEDIUM  
**Overall Risk**: MEDIUM

**Scenario**:
- Data retained beyond legal requirements
- No automated deletion after retention period expires
- Backups retained indefinitely

**Potential Harm to Data Subjects**:
- Continued privacy intrusion after leaving service
- Data used out of context years later
- Stale data affects future housing applications

**Current Controls**:
- ✅ Retention periods defined in policy
- ❌ **GAP**: No automated deletion workflow
- ❌ **GAP**: Backups not covered by retention policy

**Residual Risk**: MEDIUM

---

## PART 4: CONSULTATION OUTCOMES

### 4.1 Internal Stakeholders

**Consulted**:
- Platform technical team
- Data protection officer (if appointed)
- Information security lead

**Key Concerns Raised**:
1. Algorithmic transparency insufficient
2. Need for regular penetration testing
3. Staff training on data protection inadequate

### 4.2 Data Subjects (Residents)

**Consultation Method**: ⚠️ **NOT YET CONDUCTED**

**Planned Approach**:
- Focus groups with 15-20 care-experienced young people
- Anonymous survey of current residents
- Representation from diverse demographics

**Key Questions**:
1. What data do you think should be collected about you?
2. Who should have access to your information?
3. How would you feel about risk scoring? Should you see your score?
4. What concerns you most about your data being stored digitally?

### 4.3 External Experts

**Consulted**:
- ⚠️ **PLANNED**: ICO (mandatory consultation due to high residual risks)
- ⚠️ **PLANNED**: Youth homelessness charities (Centrepoint, St Basils)
- ⚠️ **PLANNED**: Data ethics advisory board (to be established)

---

## PART 5: MEASURES TO REDUCE RISKS

### 5.1 Immediate Actions (0-3 months)

| Risk | Measure | Responsibility | Deadline |
|------|---------|---------------|----------|
| Algorithmic discrimination | Implement explainability dashboard | CTO | Month 1 |
| Unauthorized access | Deploy database activity monitoring | DevOps Lead | Month 2 |
| Data breach | Conduct penetration test | Security Consultant | Month 3 |
| Minor consent issues | Create Gillick competence assessment tool | Legal + Product | Month 2 |
| Excessive retention | Implement automated deletion workflow | Engineering | Month 3 |

### 5.2 Short-Term Improvements (3-6 months)

1. **Algorithmic Fairness Audit**:
   - Test risk scoring across demographic groups (race, disability, gender)
   - Adjust algorithm if disparate impact identified
   - Publish methodology and fairness results

2. **Enhanced Transparency**:
   - Privacy dashboard for residents (view what data held, download copy)
   - Risk score explainability (show factors contributing to score)
   - Data sharing log (show which agencies accessed data)

3. **Resident Consent Portal**:
   - Granular consent options (e.g., consent to share with education but not police)
   - Easy consent withdrawal
   - Age-appropriate language and design

4. **Staff Training**:
   - Mandatory data protection training (annually)
   - Safeguarding-specific data handling
   - Consequences of unauthorized access

### 5.3 Medium-Term Enhancements (6-12 months)

1. **Independent Ethics Oversight**:
   - Establish Data Ethics Advisory Board
   - Quarterly reviews of algorithmic decision-making
   - Include care-experienced youth on board

2. **Technical Enhancements**:
   - Field-level encryption for most sensitive data
   - Anomaly detection for unusual access patterns
   - Automated backup retention enforcement

3. **External Validation**:
   - ISO 27001 certification
   - Cyber Essentials Plus certification
   - Independent audit of RLS policies

---

## PART 6: APPROVAL AND SIGN-OFF

### 6.1 DPIA Approval

**Completed by**:  
Name: _____________________  
Role: Data Protection Officer  
Date: _____________________  
Signature: _____________________

**Approved by**:  
Name: _____________________  
Role: Chief Executive Officer  
Date: _____________________  
Signature: _____________________

### 6.2 ICO Consultation

**Status**: ☐ Not yet submitted  
**Submission Date**: _____________________  
**ICO Reference**: _____________________  
**ICO Outcome**: ☐ Approved ☐ Approved with conditions ☐ Rejected  
**ICO Feedback**: _____________________

### 6.3 Review Schedule

**Next Review Date**: _____________________  
**Trigger for Early Review**:
- ☐ Significant system changes (new features processing personal data)
- ☐ Data breach or security incident
- ☐ Change in legal requirements
- ☐ Expansion to new geographic regions
- ☐ New categories of data subjects

---

## APPENDICES

### Appendix A: Legitimate Interest Assessment (LIA)
[Separate document - available on request]

### Appendix B: Risk Scoring Algorithm Methodology
[Technical specification - available on request]

### Appendix C: Data Sharing Agreements
[Templates for local authorities, police, healthcare - available on request]

### Appendix D: Resident Privacy Notice
[Age-appropriate version - available on request]

### Appendix E: Staff Data Protection Policy
[Internal policy document - available on request]

### Appendix F: Data Breach Response Plan
[Incident response procedures - available on request]

---

## GLOSSARY

**Gillick Competence**: Legal test of whether a child under 16 can consent without parental permission (originates from Gillick v West Norfolk and Wisbech AHA 1985)

**MASH**: Multi-Agency Safeguarding Hub - coordinated response team for safeguarding concerns

**RLS**: Row Level Security - database access control limiting users to specific rows

**Article 9 Data**: Special category personal data (health, ethnicity, religion, sexual orientation, etc.)

---

**Document Control**  
Version: 1.0 DRAFT  
Classification: CONFIDENTIAL  
Distribution: DPO, CEO, ICO (upon consultation)  
Next Review: 12 months from approval or upon triggering event

---

**CRITICAL NEXT STEPS**:

1. ✅ **CONSULT ICO** - Mandatory due to high residual risks (algorithmic discrimination)
2. ✅ **CONSULT DATA SUBJECTS** - Speak to 15-20 young people with experience of care system
3. ✅ **IMPLEMENT ALGORITHMIC EXPLAINABILITY** - Before production deployment
4. ✅ **CONDUCT PENETRATION TEST** - Identify vulnerabilities
5. ✅ **ESTABLISH ETHICS BOARD** - Independent oversight of algorithmic systems

**DO NOT DEPLOY TO PRODUCTION** until ICO consultation complete and high-risk items addressed.

