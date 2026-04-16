const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
You are a senior software engineer conducting a REAL technical interview 
for top product-based companies like Google, Amazon, Microsoft.

Candidate Details:
- Role: ${role}
- Experience: ${experience} years
- Focus Topics: ${topicsToFocus}

Instructions:
- Generate ${numberOfQuestions} HIGH-QUALITY interview questions.
- Questions must simulate REAL interviews (NOT textbook theory).

Question Distribution:
- 30% Coding / DSA problems
- 30% Conceptual (but NOT basic definitions)
- 30% Real-world scenario-based questions
- 10% Follow-up / deep-dive questions

Requirements:

1. Coding Questions:
- Include problem statement
- Include constraints
- Ask for optimal approach
- Example: arrays, strings, hashmap, recursion, etc.

2. Scenario-Based Questions:
- Ask practical questions like:
  "How would you design..."
  "What would you do if..."
  "How would you optimize..."
- Must reflect real engineering problems

3. Conceptual Questions:
- Avoid basic definitions
- Ask "WHY", "HOW", "TRADE-OFFS"

4. Follow-Up:
- At least 1–2 questions based on previous answers
- Should increase difficulty

Answer Guidelines:
- Provide structured answers
- Keep them concise but meaningful
- Include code ONLY for coding questions

Return ONLY valid JSON:
[
  {
    "type": "coding | concept | scenario | follow-up",
    "question": "Question here?",
    "answer": "Answer here",
    "difficulty": "easy | medium | hard"
  }
]

Strict Rules:
- Do NOT generate basic textbook questions
- Do NOT repeat similar questions
- Do NOT add extra text outside JSON
`;

const conceptExplainPrompt = (question) => `
You are an AI teacher. Explain the following technical concept or answer the following question clearly and concisely.

Concept/Question: ${question}

Requirements:
1. Provide a clear, simple explanation.
2. Break it down into key points.
3. Provide a code example or a real-world analogy if applicable.

Return ONLY valid JSON in this format:
{
  "explanation": "...",
  "keyPoints": ["...", "..."],
  "example": "..."
}
`;

const resourcePrompt = (questions, blueprint) => `
You are an AI learning assistant. Generate highly specific learning resources for EACH interview question provided below.

User Profile:
- Role: ${blueprint?.role || "Software Engineer"}
- Experience: ${blueprint?.experienceLevel || "Entry"}

Interview Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

STRICT REQUIREMENTS:
1. Generate exactly 2 resources PER QUESTION (1 Video, 1 Article).
2. For each question, extract 3-5 "core technical keywords" (e.g., if the question is "Java synchronized vs ReentrantLock", keywords are ["synchronized", "ReentrantLock", "Java", "Concurrency"]).
3. PROHIBITED: Do NOT suggest generic tutorials, "Full Courses", "Complete Guides", or "Beginner Tutorials". 
4. PREFER: Tutorials titled with "Deep Dive", "Explained", or "Interview Question".
5. Set "link" to "VERIFYING..." (the system will provide the verified URL).

Return ONLY a valid JSON object in this format:
{
  "sections": [
    {
      "question": "The exact interview question",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "topic": "The core technical term",
      "resources": [
        {
          "title": "Specific Technical Title",
          "type": "video", // or "article"
          "link": "VERIFYING...",
          "description": "How this specific resource answers this exact question."
        }
      ]
    }
  ]
}

No markdown, no extra text.
`;

const detailedAnswerPrompt = (question, role, topics) => `
You are an expert technical interviewer for top tier companies.
Provide a high-quality, professional answer for the following interview question.

Role: ${role}
Context/Topics: ${topics}
Question: "${question}"

Requirements:
1. EXPLANATION: Provide a clear, interview-ready explanation (2-3 paragraphs).
2. KEY INSIGHTS: Provide 3-5 bullet points of the most important takeaways.
3. INTERVIEWER TIP: Tell the candidate what the interviewer is specifically looking for or a common pitfall to avoid.
4. CODE SNIPPET (Mandatory for Technical/Coding Questions):
   - If the role is AI/ML or Data Science, use PYTHON.
   - If the role is Frontend, use JAVASCRIPT/REACT.
   - For Backend, use JAVA or PYTHON.
   - Keep the code clean and well-commented.
   - If the question is purely behavioral, set "codeSnippet" to null.

Return ONLY a valid JSON object:
{
  "explanation": "...",
  "keyInsights": ["...", "...", "..."],
  "interviewerTip": "...",
  "codeSnippet": "..." // Use \n for newlines in code
}
`;

const detailedAnswerBatchPrompt = (questions, role, topics) => `
You are an expert technical interviewer. Return ONLY valid JSON. No text. No explanation outside JSON.
Role: ${role} | Topics: ${topics}

Questions:
${questions.map((q, i) => `${i + 1}. ${typeof q === 'string' ? q : q.question}`).join("\n")}

Format:
[
  {
    "question": "Exact original question text",
    "explanation": "2 paragraphs of interview-ready detail",
    "keyInsights": ["Point 1", "Point 2", "Point 3"],
    "interviewerTip": "Strategic advice",
    "codeExample": "Implementation code or null"
  }
]
`;

const resourceSemanticFilterPrompt = (question, candidates) => `
You are a senior technical interviewer and curriculum designer.
Your task is to filter a list of search results to find ONLY the ones that are highly relevant to answering or explaining this specific interview question.

Interview Question: "${question}"

Candidates to Evaluate:
${candidates.map((c, i) => `[${i}] TITLE: "${c.title}" | DESCRIPTION: "${c.snippet || "N/A"}"`).join("\n")}

STRICT RELEVANCE CRITERIA:
1. YES (relevant): The resource title or description specifically mentions the core technical concept or problem in the question.
2. NO (irrelevant): The resource is a generic tutorial (e.g., "Learn Java from Scratch" for a "Java memory leaks" question), a full course, or covers a different topic entirely.
3. NO (vague): The title is too broad and doesn't explicitly link to the unique challenge in the question.

Return ONLY a valid JSON array of indices (strings) for the RELEVANT resources only. 
Expected Format: ["0", "2", "5"]

No markdown, no explanation.
`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
  resourcePrompt,
  detailedAnswerPrompt,
  detailedAnswerBatchPrompt,
  resourceSemanticFilterPrompt,
};