export const mockCivicTwinResult = {
  eligibleSchemes: [
    {
      schemeName: 'PM Kaushal Vikas Yojana (PMKVY)',
      category: 'Skill Development',
      eligibilityReason:
        'Sample data — connect a Gemini API key to see reasoning personalized to your exact age, state, income and profession.',
      requiredDocuments: ['Aadhaar Card', 'Educational Certificates', 'Bank Passbook'],
      applicationSteps: [
        'Visit the PMKVY portal or nearest Skill Center',
        'Register with Aadhaar-based verification',
        'Choose a certified training course',
        'Complete training and appear for assessment',
      ],
      timeline: '3-6 months',
      department: 'Ministry of Skill Development and Entrepreneurship',
    },
    {
      schemeName: 'PM-KISAN Samman Nidhi',
      category: 'Agriculture Support',
      eligibilityReason: 'Sample data — real output will reason about your specific profile.',
      requiredDocuments: ['Land Records', 'Aadhaar Card', 'Bank Account Details'],
      applicationSteps: [
        'Visit PM-KISAN portal',
        'Register with land and bank details',
        'Verification by local revenue officer',
        'Receive direct benefit transfer',
      ],
      timeline: '1-2 months',
      department: 'Ministry of Agriculture and Farmers Welfare',
    },
    {
      schemeName: 'National Scholarship Portal Schemes',
      category: 'Education',
      eligibilityReason: 'Sample data — actual eligibility reasoning appears with a live API key.',
      requiredDocuments: ['Income Certificate', 'Previous Mark Sheet', 'Bank Account'],
      applicationSteps: [
        'Register on National Scholarship Portal',
        'Fill application with academic details',
        'Upload required documents',
        'Track status online',
      ],
      timeline: '2-4 months',
      department: 'Ministry of Education',
    },
  ],
  summary:
    'This is sample offline data. Add your Gemini API key to get a civic journey personalized to your exact situation.',
}

export const mockLifeEventResult = {
  detectedEvent: 'General Civic Query (Sample)',
  urgency: 'medium',
  recommendedServices: [
    {
      serviceName: 'Employment Exchange Registration',
      description: 'Sample recommendation — live mode reasons about your exact situation.',
      documentsRequired: ['Aadhaar Card', 'Educational Certificates', 'Resume'],
    },
    {
      serviceName: 'Skill Certification Support',
      description: 'Sample recommendation shown in offline mode.',
      documentsRequired: ['Aadhaar Card', 'Passport Photo'],
    },
  ],
  warnings: ['This is sample data — connect your Gemini API key for situation-specific warnings.'],
  nextActions: ['Add your Gemini API key in .env', 'Retry to get a live, personalized analysis'],
  antiMiddlemanNote:
    'Government services are free through official portals — never pay agents or middlemen for standard applications.',
}

export const mockComplaintResult = {
  category: 'General Civic Issue (Sample)',
  department: 'Local Municipal Corporation',
  priority: 'Medium',
  priorityReason: 'Sample data shown because live AI is currently unavailable.',
  formalComplaint: `Subject: Formal Complaint Regarding Civic Issue in Local Area

To,
The Concerned Authority,
Local Municipal Corporation

Respected Sir/Madam,

This is a sample complaint letter shown in offline mode. Please add your Gemini API key to generate a real, personalized formal complaint letter based on your actual issue description.

Thank you for your attention to this matter.

Yours sincerely,
A Concerned Citizen`,
  estimatedDays: '7-10 days',
}
