/**
 * services/geminiService.js
 * BharatSetu AI — Backend AI service
 *
 * Function names kept as generateCivicTwin / analyzeLifeEvent / generateComplaint
 * so controllers/routes need ZERO changes.
 *
 * Internally calls Groq (free, no credit card, OpenAI-compatible endpoint)
 * instead of Gemini. If the live call fails for ANY reason, it falls back
 * to CATEGORY-MATCHED sample data based on keywords in the user's actual
 * input — never a random/generic mock. A student always gets student-shaped
 * fallback data, a farmer always gets farmer-shaped fallback data, etc.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ─────────────────────────────────────────────────────────────────────────
// Core Groq caller — internal only
// ─────────────────────────────────────────────────────────────────────────
async function callAI(prompt) {
  if (!GROQ_API_KEY) {
    const err = new Error('No Groq API key configured on the server')
    err.code = 'NO_API_KEY'
    throw err
  }

  let response
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    })
  } catch (networkErr) {
    const err = new Error('Network error while calling the AI API')
    err.code = 'NETWORK_ERROR'
    throw err
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    const err = new Error(`AI API returned status ${response.status}: ${bodyText}`)
    err.code = 'AI_API_ERROR'
    throw err
  }

  const data = await response.json()
  const rawText = data?.choices?.[0]?.message?.content

  if (!rawText) {
    const err = new Error('AI API returned an empty response')
    err.code = 'EMPTY_RESPONSE'
    throw err
  }

  const cleaned = rawText.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (parseErr) {
    const err = new Error('Could not parse AI response as JSON')
    err.code = 'PARSE_ERROR'
    throw err
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Keyword-based category detector — used ONLY for picking the right
// fallback dataset when the live AI call fails. Never used for live output.
// ─────────────────────────────────────────────────────────────────────────
function detectCategory(text) {
  const t = (text || '').toLowerCase()

  const buckets = [
    { key: 'student', words: ['student', 'college', 'engineering', 'school', 'university', 'exam', 'graduate', 'scholarship', 'degree', 'study'] },
    { key: 'farmer', words: ['farm', 'farming', 'agriculture', 'crop', 'kisan', 'field', 'irrigation', 'harvest'] },
    { key: 'employee', words: ['job', 'employee', 'salary', 'office', 'work', 'unemployed', 'lost my job', 'laid off', 'company', 'resign'] },
    { key: 'business', words: ['business', 'shop', 'startup', 'msme', 'entrepreneur', 'store', 'trade', 'vendor', 'self-employed'] },
    { key: 'senior', words: ['senior', 'elderly', 'pension', 'retired', 'old age', 'grandparent'] },
    { key: 'family', words: ['parent', 'child', 'baby', 'pregnant', 'maternity', 'newborn', 'family'] },
    { key: 'health', words: ['health', 'hospital', 'medical', 'illness', 'disability', 'treatment'] },
  ]

  for (const bucket of buckets) {
    if (bucket.words.some((w) => t.includes(w))) return bucket.key
  }
  return 'general'
}

// ─────────────────────────────────────────────────────────────────────────
// Fallback datasets — keyed by category, used only when live AI fails
// ─────────────────────────────────────────────────────────────────────────
const CIVIC_TWIN_FALLBACK = {
  student: {
    eligibleSchemes: [
      {
        schemeName: 'National Scholarship Portal (NSP)',
        category: 'Education',
        eligibilityReason: 'Sample data matched to your student profile — connect a live API key for reasoning personalized to your exact state and income.',
        requiredDocuments: ['Aadhaar Card', 'Previous Mark Sheet', 'Income Certificate', 'Bank Account'],
        applicationSteps: ['Register on scholarships.gov.in', 'Fill academic and income details', 'Upload documents', 'Track application status'],
        timeline: '2-4 months',
        department: 'Ministry of Education',
      },
      {
        schemeName: 'PM Kaushal Vikas Yojana (PMKVY)',
        category: 'Skill Development',
        eligibilityReason: 'Sample data — students and young graduates are typically eligible for skill certification support.',
        requiredDocuments: ['Aadhaar Card', 'Educational Certificates'],
        applicationSteps: ['Visit nearest PMKVY training center', 'Choose certified course', 'Complete training and assessment'],
        timeline: '3-6 months',
        department: 'Ministry of Skill Development and Entrepreneurship',
      },
    ],
    summary: 'This is sample data matched to a student profile. Add a live API key for output personalized to your exact details.',
  },
  farmer: {
    eligibleSchemes: [
      {
        schemeName: 'PM-KISAN Samman Nidhi',
        category: 'Agriculture Support',
        eligibilityReason: 'Sample data matched to your farming profile — direct income support scheme for landholding farmers.',
        requiredDocuments: ['Land Records', 'Aadhaar Card', 'Bank Account Details'],
        applicationSteps: ['Register on pmkisan.gov.in', 'Submit land and bank details', 'Verification by revenue officer', 'Receive direct transfer'],
        timeline: '1-2 months',
        department: 'Ministry of Agriculture and Farmers Welfare',
      },
      {
        schemeName: 'Kisan Credit Card (KCC)',
        category: 'Agriculture Finance',
        eligibilityReason: 'Sample data — farmers are typically eligible for low-interest crop loans through KCC.',
        requiredDocuments: ['Land Records', 'Aadhaar Card', 'Bank Passbook'],
        applicationSteps: ['Apply at nearest bank branch', 'Submit land ownership proof', 'Credit assessment', 'Card issued'],
        timeline: '3-4 weeks',
        department: 'Ministry of Agriculture and Farmers Welfare',
      },
    ],
    summary: 'This is sample data matched to a farming profile. Add a live API key for output personalized to your exact details.',
  },
  employee: {
    eligibleSchemes: [
      {
        schemeName: 'Employees Provident Fund (EPF) Services',
        category: 'Employment Benefits',
        eligibilityReason: 'Sample data matched to your employment profile — covers PF withdrawal, transfer, and pension queries.',
        requiredDocuments: ['UAN Number', 'Aadhaar Card', 'Bank Account Details'],
        applicationSteps: ['Login to EPFO member portal', 'Verify UAN with Aadhaar', 'Submit request online'],
        timeline: '2-4 weeks',
        department: 'Employees Provident Fund Organisation',
      },
      {
        schemeName: 'National Career Service (NCS) Portal',
        category: 'Employment Support',
        eligibilityReason: 'Sample data — job seekers and employees can access free job matching and career counselling.',
        requiredDocuments: ['Aadhaar Card', 'Resume', 'Educational Certificates'],
        applicationSteps: ['Register on ncs.gov.in', 'Complete profile', 'Browse matched openings'],
        timeline: 'Immediate to 4 weeks',
        department: 'Ministry of Labour and Employment',
      },
    ],
    summary: 'This is sample data matched to an employment profile. Add a live API key for output personalized to your exact details.',
  },
  business: {
    eligibleSchemes: [
      {
        schemeName: 'MSME Udyam Registration',
        category: 'Business Support',
        eligibilityReason: 'Sample data matched to your business profile — official registration unlocks subsidies and priority lending.',
        requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Business Address Proof'],
        applicationSteps: ['Register on udyamregistration.gov.in', 'Enter business details', 'Receive Udyam certificate'],
        timeline: '1-2 weeks',
        department: 'Ministry of Micro, Small and Medium Enterprises',
      },
      {
        schemeName: 'PM Mudra Yojana',
        category: 'Business Finance',
        eligibilityReason: 'Sample data — small business owners are typically eligible for collateral-free loans up to ₹10 lakh.',
        requiredDocuments: ['Business Plan', 'Aadhaar Card', 'Bank Statement'],
        applicationSteps: ['Approach any bank/NBFC/MFI', 'Submit business plan', 'Loan sanctioned based on category'],
        timeline: '2-4 weeks',
        department: 'Ministry of Finance',
      },
    ],
    summary: 'This is sample data matched to a business profile. Add a live API key for output personalized to your exact details.',
  },
  senior: {
    eligibleSchemes: [
      {
        schemeName: 'Indira Gandhi National Old Age Pension Scheme',
        category: 'Senior Citizen Welfare',
        eligibilityReason: 'Sample data matched to your senior citizen profile — monthly pension for eligible elderly citizens.',
        requiredDocuments: ['Aadhaar Card', 'Age Proof', 'BPL Certificate (if applicable)'],
        applicationSteps: ['Apply at local municipal/panchayat office', 'Submit age and income proof', 'Verification and approval'],
        timeline: '4-6 weeks',
        department: 'Ministry of Rural Development',
      },
    ],
    summary: 'This is sample data matched to a senior citizen profile. Add a live API key for output personalized to your exact details.',
  },
  family: {
    eligibleSchemes: [
      {
        schemeName: 'Pradhan Mantri Matru Vandana Yojana',
        category: 'Maternity Benefit',
        eligibilityReason: 'Sample data matched to your family situation — cash benefit for pregnant and lactating mothers.',
        requiredDocuments: ['Aadhaar Card', 'Bank Account', 'Pregnancy/Birth Certificate'],
        applicationSteps: ['Register at nearest Anganwadi center', 'Submit documents in phases', 'Receive benefit in installments'],
        timeline: 'Ongoing through pregnancy term',
        department: 'Ministry of Women and Child Development',
      },
    ],
    summary: 'This is sample data matched to your family situation. Add a live API key for output personalized to your exact details.',
  },
  health: {
    eligibleSchemes: [
      {
        schemeName: 'Ayushman Bharat — PMJAY',
        category: 'Healthcare',
        eligibilityReason: 'Sample data matched to your health-related query — free health cover up to ₹5 lakh per family per year.',
        requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
        applicationSteps: ['Check eligibility on pmjay.gov.in', 'Visit empanelled hospital', 'Avail cashless treatment'],
        timeline: 'Immediate once verified',
        department: 'National Health Authority',
      },
    ],
    summary: 'This is sample data matched to a health-related query. Add a live API key for output personalized to your exact details.',
  },
  general: {
    eligibleSchemes: [
      {
        schemeName: 'Digital India / UMANG Services',
        category: 'General Governance',
        eligibilityReason: 'Sample general-purpose data — connect a live API key so we can match schemes to your exact profile instead of a general list.',
        requiredDocuments: ['Aadhaar Card'],
        applicationSteps: ['Download the UMANG app', 'Search relevant department services', 'Apply directly'],
        timeline: 'Varies by service',
        department: 'Ministry of Electronics and IT',
      },
    ],
    summary: 'This is general sample data because live AI is currently unavailable. Add a Groq API key for output personalized to your exact profile.',
  },
}

const LIFE_EVENT_FALLBACK = {
  employee: {
    detectedEvent: 'Job Loss / Employment Change (Sample)',
    urgency: 'high',
    recommendedServices: [
      { serviceName: 'National Career Service Registration', description: 'Sample data — free job matching for those between jobs.', documentsRequired: ['Aadhaar Card', 'Resume'] },
      { serviceName: 'Unemployment Support Schemes', description: 'Sample data — state-specific unemployment allowance may apply.', documentsRequired: ['Aadhaar Card', 'Last Employment Proof'] },
    ],
    warnings: ['This is sample data matched to a job-related situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Employment exchange registration and government job portals are completely free — never pay anyone for registration.',
  },
  farmer: {
    detectedEvent: 'Agriculture-Related Situation (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'PM-KISAN Registration', description: 'Sample data — direct income support for landholding farmers.', documentsRequired: ['Land Records', 'Aadhaar Card'] },
      { serviceName: 'Kisan Credit Card', description: 'Sample data — low-interest crop loans.', documentsRequired: ['Land Records', 'Bank Passbook'] },
    ],
    warnings: ['This is sample data matched to a farming situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Land record verification and PM-KISAN registration are free at the local revenue office — never pay agents.',
  },
  family: {
    detectedEvent: 'Family Life Event (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'PM Matru Vandana Yojana', description: 'Sample data — maternity benefit cash support.', documentsRequired: ['Aadhaar Card', 'Bank Account'] },
      { serviceName: 'Birth Certificate Registration', description: 'Sample data — required for most future benefits.', documentsRequired: ['Hospital Discharge Summary', 'Parents\' ID Proof'] },
    ],
    warnings: ['This is sample data matched to a family-related situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Birth registration at your local municipal office is free and usually completed within a week.',
  },
  student: {
    detectedEvent: 'Education-Related Situation (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'National Scholarship Portal', description: 'Sample data — scholarships based on merit and income.', documentsRequired: ['Income Certificate', 'Mark Sheet'] },
    ],
    warnings: ['This is sample data matched to an education-related situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Scholarship applications are free on the official portal — never pay agents for form filling.',
  },
  business: {
    detectedEvent: 'Business / Entrepreneurship Situation (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'Udyam MSME Registration', description: 'Sample data — official registration for small businesses.', documentsRequired: ['Aadhaar Card', 'PAN Card'] },
    ],
    warnings: ['This is sample data matched to a business-related situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Udyam registration is completely free and takes minutes on the official portal.',
  },
  senior: {
    detectedEvent: 'Senior Citizen Situation (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'Old Age Pension Scheme', description: 'Sample data — monthly pension support for eligible seniors.', documentsRequired: ['Age Proof', 'Aadhaar Card'] },
    ],
    warnings: ['This is sample data matched to a senior-citizen situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Pension applications at the panchayat/municipal office are free — never pay middlemen.',
  },
  health: {
    detectedEvent: 'Health-Related Situation (Sample)',
    urgency: 'high',
    recommendedServices: [
      { serviceName: 'Ayushman Bharat PMJAY', description: 'Sample data — free treatment cover up to ₹5 lakh.', documentsRequired: ['Aadhaar Card', 'Ration Card'] },
    ],
    warnings: ['This is sample data matched to a health-related situation — connect a live API key for guidance specific to your exact case.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Ayushman Bharat enrollment and empanelled hospital treatment are free — never pay for eligibility checks.',
  },
  general: {
    detectedEvent: 'General Civic Query (Sample)',
    urgency: 'medium',
    recommendedServices: [
      { serviceName: 'UMANG App Services', description: 'Sample general-purpose data — connect a live API key for a situation-specific analysis.', documentsRequired: ['Aadhaar Card'] },
    ],
    warnings: ['This is sample data — live AI is currently unavailable.'],
    nextActions: ['Add your Groq API key in server .env', 'Retry to get a live, personalized analysis'],
    antiMiddlemanNote: 'Government services are free through official portals — never pay agents or middlemen.',
  },
}

const COMPLAINT_FALLBACK = {
  road: {
    category: 'Road Infrastructure (Sample)',
    department: 'Public Works Department (PWD) / Municipal Road Authority',
    priority: 'High',
    priorityReason: 'Sample data — road damage is typically classified as high priority due to safety risk.',
  },
  water: {
    category: 'Water Supply (Sample)',
    department: 'Municipal Water Supply Department',
    priority: 'High',
    priorityReason: 'Sample data — water supply issues are typically classified as high priority.',
  },
  garbage: {
    category: 'Sanitation / Waste Management (Sample)',
    department: 'Municipal Solid Waste Management Department',
    priority: 'Medium',
    priorityReason: 'Sample data — sanitation issues are typically classified as medium priority.',
  },
  electricity: {
    category: 'Electricity Supply (Sample)',
    department: 'State Electricity Distribution Board',
    priority: 'High',
    priorityReason: 'Sample data — power supply issues are typically classified as high priority.',
  },
  general: {
    category: 'General Civic Issue (Sample)',
    department: 'Local Municipal Corporation',
    priority: 'Medium',
    priorityReason: 'Sample data shown because live AI is currently unavailable.',
  },
}

function buildComplaintFallback({ issueType, location, description, userName }) {
  const t = `${issueType} ${description}`.toLowerCase()
  let key = 'general'
  if (t.includes('road') || t.includes('pothole') || t.includes('street')) key = 'road'
  else if (t.includes('water')) key = 'water'
  else if (t.includes('garbage') || t.includes('waste') || t.includes('sanitation') || t.includes('trash')) key = 'garbage'
  else if (t.includes('electric') || t.includes('power') || t.includes('light')) key = 'electricity'

  const base = COMPLAINT_FALLBACK[key]

  return {
    ...base,
    formalComplaint: `Subject: Formal Complaint Regarding ${issueType || 'Civic Issue'} at ${location || 'Local Area'}

To,
The Concerned Authority,
${base.department}

Respected Sir/Madam,

This is sample data shown because live AI is currently unavailable. In production, this letter would formally describe the following issue on your behalf:

Issue Type: ${issueType || 'N/A'}
Location: ${location || 'N/A'}
Description: ${description || 'N/A'}

Please add a valid Groq API key to the server .env file to generate a complete, personalized formal complaint letter.

Thank you for your attention to this matter.

Yours sincerely,
${userName || 'A Concerned Citizen'}`,
    estimatedDays: '7-10 days',
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Exported functions — same signatures the controllers already call
// ─────────────────────────────────────────────────────────────────────────

async function generateCivicTwin({ age, state, profession, income, situation }) {
  const prompt = `You are BharatSetu AI, an expert Indian government schemes advisor with deep knowledge of central and state welfare programs.

Citizen Profile:
- Age: ${age}
- State: ${state}
- Profession: ${profession}
- Income Level: ${income || 'Not specified'}
- Situation: ${situation}

Based on this REAL profile, identify actual eligible Indian government schemes (central + ${state}-specific state schemes). Do not use generic examples — reason about what this specific person would genuinely qualify for.

Respond ONLY with valid JSON, no markdown, no extra text, in this exact structure:
{
  "eligibleSchemes": [
    {
      "schemeName": "",
      "category": "",
      "eligibilityReason": "why THIS specific user qualifies, referencing their age/state/income/profession",
      "requiredDocuments": ["", ""],
      "applicationSteps": ["step 1", "step 2", "step 3"],
      "timeline": "realistic processing time",
      "department": "exact government department/ministry responsible"
    }
  ],
  "summary": "one encouraging sentence personalized to this user"
}

Return 3-5 schemes maximum, ranked by relevance to this specific person.`

  try {
    return await callAI(prompt)
  } catch (err) {
    console.warn('[geminiService] generateCivicTwin falling back:', err.message)
    const category = detectCategory(`${profession} ${situation}`)
    return CIVIC_TWIN_FALLBACK[category] || CIVIC_TWIN_FALLBACK.general
  }
}

async function analyzeLifeEvent(userInput) {
  const prompt = `You are BharatSetu AI, a proactive Indian civic advisor. A citizen just shared this life event:

"${userInput}"

Understand the real implications of this specific situation (not a generic template) and respond ONLY with valid JSON, no markdown:
{
  "detectedEvent": "short specific label for what happened",
  "urgency": "low" | "medium" | "high",
  "recommendedServices": [
    {
      "serviceName": "",
      "description": "specific to this situation",
      "documentsRequired": ["", ""]
    }
  ],
  "warnings": ["any risks, deadlines, or common mistakes for this specific situation"],
  "nextActions": ["immediate step 1", "immediate step 2"],
  "antiMiddlemanNote": "one sentence warning against paying agents for this specific process, pointing to the correct free official channel"
}

Base every field on the ACTUAL situation described, not generic advice.`

  try {
    return await callAI(prompt)
  } catch (err) {
    console.warn('[geminiService] analyzeLifeEvent falling back:', err.message)
    const category = detectCategory(userInput)
    return LIFE_EVENT_FALLBACK[category] || LIFE_EVENT_FALLBACK.general
  }
}

async function generateComplaint({ issueType, location, description, userName }) {
  const prompt = `You are a government complaint drafting assistant for India.

Issue Type: ${issueType}
Location: ${location}
Description: "${description}"
Citizen Name: ${userName || 'Citizen'}

Analyze this specific complaint and respond ONLY with valid JSON, no markdown:
{
  "category": "specific category based on the actual issue",
  "department": "the exact correct Indian government department/authority for THIS issue and location type",
  "priority": "Low" | "Medium" | "High",
  "priorityReason": "why this priority level, based on the actual description",
  "formalComplaint": "a complete, professional complaint letter, properly formatted with subject line, addressed to the department, referencing the specific location and description given, signed off with the citizen's name — ready to submit as-is",
  "estimatedDays": "realistic number range for this specific category"
}`

  try {
    return await callAI(prompt)
  } catch (err) {
    console.warn('[geminiService] generateComplaint falling back:', err.message)
    return buildComplaintFallback({ issueType, location, description, userName })
  }
}

function hasApiKey() {
  return Boolean(GROQ_API_KEY)
}

module.exports = {
  generateCivicTwin,
  analyzeLifeEvent,
  generateComplaint,
  hasApiKey,
}
