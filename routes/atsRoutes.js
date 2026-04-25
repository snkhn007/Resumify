const express  = require('express');
const atsRouter = express.Router();
const Groq     = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ats/analyze
atsRouter.post('/analyze', async (req, res) => {
  try {
    const { role, resume } = req.body;

    if (!resume || resume.trim().length < 30) {
      return res.status(400).json({ error: 'Resume content is too short to analyse.' });
    }

    const prompt = `
You are an ATS (Applicant Tracking System) Resume Evaluator.

IMPORTANT:
- Output ONLY valid JSON. No markdown, no explanation, no text before or after.
- This is NOT an official ATS system — it is a tool to help job seekers improve.

EVALUATION RUBRIC (total 100 points):
1. Keyword Relevance     — 25 pts
2. Skills Strength       — 15 pts
3. Experience Quality    — 20 pts
4. Achievements Impact   — 15 pts
5. Formatting            — 10 pts
6. Completeness          — 10 pts
7. Clarity               —  5 pts

Return STRICT JSON ONLY in this exact shape:
{
  "ats_score": <number 0-100>,
  "breakdown": {
    "keyword_relevance":    <number 0-25>,
    "skills_strength":      <number 0-15>,
    "experience_quality":   <number 0-20>,
    "achievements_impact":  <number 0-15>,
    "formatting":           <number 0-10>,
    "completeness":         <number 0-10>,
    "clarity":              <number 0-5>
  },
  "missing_keywords": [<string>, ...],
  "improvements":     [<string>, ...],
  "summary":          "<one sentence>"
}

Target Role: ${role || 'Software Engineer'}

Resume:
${resume}
`;

    const response = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content.trim();

    // Strip markdown fences if model wraps in ```json ... ```
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const json = JSON.parse(cleaned);
    return res.json(json);

  } catch (err) {
    console.error('ATS route error:', err);
    return res.status(500).json({ error: 'Failed to analyse resume. Please try again.' });
  }
});

module.exports = atsRouter;
