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

const detailedAnswerBatchPrompt = (questions, role, topics, performanceLevel = "average") => `
You are an expert technical interviewer. Generate a structured answer for each question.

Role: ${role} | Topics: ${topics} | Level: ${performanceLevel}

Questions:
${questions.map((q, i) => `${i + 1}. ${typeof q === 'string' ? q : q.question}`).join("\n")}

Return a JSON array only, one object per question:
[{
  "question": "exact question text",
  "importance": "High|Medium|Low",
  "duration": "X-Y mins",
  "companyTags": ["Company1"],
  "idealInterviewAnswer": "1-2 sentence recruiter-style summary",
  "explanation": "core concept + approach${performanceLevel === 'weak' ? ' with analogy' : ' with tradeoffs'}",
  "architectureDiagram": "mermaid diagram string or null",
  "howToDrawStepByStep": ["Step 1", "Step 2"],
  "detailedSections": [
    {"title": "Algorithm/Architecture", "content": "implementation detail"},
    {"title": "Optimizations", "content": "performance improvements"},
    {"title": "Tradeoffs", "content": "pros and cons"}
  ],
  "productionConcerns": ["concern1", "concern2"],
  "realWorldExample": "how a top company handles this",
  "interviewerTip": "what interviewer looks for",
  "commonMistakes": ["mistake1", "mistake2"],
  "possibleFollowUps": ["follow-up1", "follow-up2"],
  "suggestedTechStack": "recommended tools",
  "codeExample": "clean commented snippet or null",
  "keyInsights": {
    "coreConcepts": ["kw1", "kw2"],
    "scalabilityConcepts": ["kw3"],
    "interviewKeywords": ["kw4", "kw5"]
  }
}]`;

const resourceSemanticFilterPrompt = (question, candidates, role = "Software Engineer") => `
You are a technical mentor and relevance engine for interview preparation.

Context:
- Target Role: ${role}
- Interview Question: "${question}"

Candidate Resources to Evaluate:
${candidates.map((c, i) => `[${i}] TYPE: ${c.type} | TITLE: "${c.title}" | URL: "${c.url}" | DESCRIPTION: "${c.snippet || "N/A"}"`).join("\n")}

STRICT RELEVANCE RULES:
1. CORE TOPIC MATCH: The resource MUST explain the core technical topic in the question (e.g., Palindrome, Activity Lifecycle).
2. ROLE & FUNDAMENTALS: 
   - For technical fundamentals (DSA, OOP, System Design, Language features like Java/Kotlin), accept high-quality resources even if they don't explicitly mention the role (${role}).
   - For role-specific topics (e.g., "Android Fragments"), reject resources from unrelated domains (e.g., "React Components").
3. QUALITY CONTROL: Favor established technical educators (e.g., Computerphile, GeeksforGeeks, Traversy Media, Programming with Mosh, etc.).
4. PREFER SPECIFICITY: A video titled "Palindrome in Java" is BETTER for this question than "Java Full Course".
5. OUTPUT LIMIT: Return max 2 videos and 2 articles. If the pool is weak, pick the best available match rather than returning empty.
6. FAIL-SAFE: ONLY use provided URLs.

Return ONLY a valid JSON object:
{
  "videos": [
    { "title": "...", "url": "...", "tags": ["..."] }
  ],
  "articles": [
    { "title": "...", "url": "...", "tags": ["..."] }
  ]
}
`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
  resourcePrompt,
  detailedAnswerPrompt,
  detailedAnswerBatchPrompt,
  resourceSemanticFilterPrompt,
};