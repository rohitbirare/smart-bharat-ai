import { Code2 } from 'lucide-react'

const prompts = [
  {
    title: '1. Civic Twin Analysis Prompt',
    why: 'We interpolate the real age, state, income and profession directly into the prompt and force JSON output so the AI reasons about eligibility for this exact person rather than returning a generic scheme list.',
    text: `You are BharatSetu AI, an expert Indian government schemes advisor...

Citizen Profile:
- Age: {age}
- State: {state}
- Profession: {profession}
- Income Level: {income}
- Situation: {situation}

Respond ONLY with valid JSON:
{
  "eligibleSchemes": [...],
  "summary": "..."
}`,
  },
  {
    title: '2. Life Event Analysis Prompt',
    why: 'The user\'s free-text description is passed through unmodified so the model can pick up on nuance (job loss vs. resignation, farming vs. starting a shop) instead of matching against fixed keywords.',
    text: `You are BharatSetu AI, a proactive Indian civic advisor. A citizen just shared this life event:

"{userInput}"

Respond ONLY with valid JSON:
{
  "detectedEvent": "...",
  "urgency": "low|medium|high",
  "recommendedServices": [...],
  "warnings": [...],
  "nextActions": [...],
  "antiMiddlemanNote": "..."
}`,
  },
  {
    title: '3. Complaint Generation Prompt',
    why: 'Issue type, location, and description are all fed in so the generated letter references the specific complaint rather than a generic template — and the department/priority are derived from the actual issue, not hardcoded.',
    text: `You are a government complaint drafting assistant for India.

Issue Type: {issueType}
Location: {location}
Description: "{description}"

Respond ONLY with valid JSON:
{
  "category": "...",
  "department": "...",
  "priority": "Low|Medium|High",
  "priorityReason": "...",
  "formalComplaint": "...",
  "estimatedDays": "..."
}`,
  },
]

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">How the AI Works</h1>
        <p className="mt-2 text-white/55">
          Full transparency into how Gemini powers BharatSetu AI — every prompt used, and why it's
          designed the way it is.
        </p>
      </div>

      <div className="space-y-6">
        {prompts.map((p) => (
          <div key={p.title} className="glass rounded-2xl p-6">
            <div className="mb-2 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-teal-400" />
              <h2 className="font-display font-semibold">{p.title}</h2>
            </div>
            <p className="mb-4 text-sm text-white/55">{p.why}</p>
            <pre className="overflow-auto rounded-lg bg-black/30 p-4 text-xs leading-relaxed text-white/60 font-mono whitespace-pre-wrap">
              {p.text}
            </pre>
          </div>
        ))}
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <h2 className="font-display mb-2 font-semibold">Why Force JSON Output?</h2>
        <p className="text-sm leading-relaxed text-white/55">
          Every prompt above forces Gemini to respond only in structured JSON. This keeps the AI's
          guidance reliable and renderable in the UI, instead of free-flowing conversational text that
          would need fragile parsing. If Gemini is unreachable or returns malformed data, BharatSetu AI
          automatically falls back to clearly-labeled sample data so the interface never breaks.
        </p>
      </div>
    </div>
  )
}
