// Grok-like resume analysis service
// This file provides two exported functions used by the resume controller:
// - generateResumeSuggestions(text)
// - analyzeResumeAgainstJD(text, jobDescription)
// It will attempt to call a configured Grok endpoint if GROK_API_KEY and GROK_API_URL
// are present in the environment. Otherwise it returns a deterministic, rich mocked
// analysis (useful for development when OpenAI/Grok quotas are not available).

import fetch from 'node-fetch';

export const grokResumeService = {
  generateResumeSuggestions,
  analyzeResumeAgainstJD,
  getSkillResources
};

// Skill-specific learning resources
const FRONTEND_RESOURCES = {
  'react': [
    { type: 'documentation', title: 'React Official Documentation', url: 'https://react.dev', provider: 'React' },
    { type: 'course', title: 'Full Stack Open - React Deep Dive', url: 'https://fullstackopen.com/en/part1', provider: 'University of Helsinki' },
    { type: 'project', title: 'Build a React Portfolio', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/#react', provider: 'freeCodeCamp' }
  ],
  'javascript': [
    { type: 'documentation', title: 'JavaScript MDN Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', provider: 'MDN' },
    { type: 'course', title: 'JavaScript.info Complete Tutorial', url: 'https://javascript.info', provider: 'JavaScript.info' },
    { type: 'project', title: 'JavaScript 30 Day Challenge', url: 'https://javascript30.com/', provider: 'Wes Bos' }
  ],
  'typescript': [
    { type: 'documentation', title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', provider: 'TypeScript' },
    { type: 'course', title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript/', provider: 'GitBook' },
    { type: 'project', title: 'TypeScript Node.js Projects', url: 'https://www.newline.co/courses/newline-guide-to-modernizing-an-enterprise-web-app', provider: 'Newline' }
  ],
  'css': [
    { type: 'documentation', title: 'MDN CSS Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', provider: 'MDN' },
    { type: 'course', title: 'CSS Grid & Flexbox', url: 'https://cssgrid.io/', provider: 'Wes Bos' },
    { type: 'project', title: 'Build Responsive Layouts', url: 'https://www.kevinpowell.co/courses/', provider: 'Kevin Powell' }
  ],
  'html': [
    { type: 'documentation', title: 'HTML MDN Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', provider: 'MDN' },
    { type: 'course', title: 'HTML & CSS Fundamentals', url: 'https://www.internetingishard.com/', provider: 'Interneting Is Hard' },
    { type: 'project', title: 'Semantic HTML Projects', url: 'https://www.frontendmentor.io/challenges', provider: 'Frontend Mentor' }
  ],
  'next.js': [
    { type: 'documentation', title: 'Next.js Documentation', url: 'https://nextjs.org/docs', provider: 'Vercel' },
    { type: 'course', title: 'Next.js Full Course', url: 'https://nextjs.org/learn', provider: 'Vercel' },
    { type: 'project', title: 'Build a Full Stack App', url: 'https://create.t3.gg/', provider: 'T3 Stack' }
  ],
  'testing': [
    { type: 'documentation', title: 'React Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro/', provider: 'Testing Library' },
    { type: 'course', title: 'JavaScript Testing', url: 'https://www.udemy.com/course/javascript-unit-testing-the-practical-guide/', provider: 'Udemy' },
    { type: 'project', title: 'Test-Driven Development', url: 'https://testingjavascript.com/', provider: 'Kent C. Dodds' }
  ],
  'responsive': [
    { type: 'documentation', title: 'Responsive Design Guide', url: 'https://web.dev/responsive-web-design-basics/', provider: 'web.dev' },
    { type: 'course', title: 'Conquering Responsive Layouts', url: 'https://courses.kevinpowell.co/conquering-responsive-layouts', provider: 'Kevin Powell' },
    { type: 'project', title: 'Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', provider: 'freeCodeCamp' }
  ]
};

// Backend & platform resources
const BACKEND_RESOURCES = {
  'node.js': [
    { type: 'documentation', title: 'Node.js Docs', url: 'https://nodejs.org/en/docs', provider: 'Node.js' },
    { type: 'course', title: 'Node.js Design Patterns', url: 'https://www.nodejsdesignpatterns.com/', provider: 'Book' },
    { type: 'project', title: 'Build REST API with Node/Express', url: 'https://github.com/santiq/bulletproof-nodejs', provider: 'GitHub' }
  ],
  'express.js': [
    { type: 'documentation', title: 'Express Docs', url: 'https://expressjs.com/', provider: 'Express' },
    { type: 'course', title: 'Express.js Fundamentals', url: 'https://www.udemy.com/topic/expressjs/', provider: 'Udemy' },
    { type: 'project', title: 'Production-ready Express Boilerplate', url: 'https://github.com/sahat/hackathon-starter', provider: 'GitHub' }
  ],
  'mongodb': [
    { type: 'documentation', title: 'MongoDB University', url: 'https://learn.mongodb.com/', provider: 'MongoDB' },
    { type: 'course', title: 'MongoDB Basics', url: 'https://university.mongodb.com/', provider: 'MongoDB' },
    { type: 'project', title: 'Mongoose Patterns', url: 'https://mongoosejs.com/docs/', provider: 'Mongoose' }
  ],
  'postgresql': [
    { type: 'documentation', title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/', provider: 'PostgreSQL' },
    { type: 'course', title: 'The Complete SQL Bootcamp', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', provider: 'Udemy' },
    { type: 'project', title: 'Design a relational schema', url: 'https://www.sqlbolt.com/', provider: 'SQLBolt' }
  ],
  'redis': [
    { type: 'documentation', title: 'Redis Docs', url: 'https://redis.io/docs/', provider: 'Redis' },
    { type: 'course', title: 'Redis University RU101', url: 'https://university.redis.com/', provider: 'Redis' },
    { type: 'project', title: 'Cache Layer for APIs', url: 'https://github.com/redis/node-redis', provider: 'GitHub' }
  ],
  'docker': [
    { type: 'documentation', title: 'Docker Docs', url: 'https://docs.docker.com/', provider: 'Docker' },
    { type: 'course', title: 'Docker for Developers', url: 'https://www.udemy.com/course/docker-mastery/', provider: 'Udemy' },
    { type: 'project', title: 'Containerize Node App', url: 'https://nodejs.org/en/docs/guides/nodejs-docker-webapp', provider: 'Node.js' }
  ],
  'kubernetes': [
    { type: 'documentation', title: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/home/', provider: 'Kubernetes' },
    { type: 'course', title: 'CKAD Exercises', url: 'https://github.com/dgkanatsios/CKAD-exercises', provider: 'GitHub' },
    { type: 'project', title: 'Deploy Node on K8s', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', provider: 'Kubernetes' }
  ],
  'aws': [
    { type: 'documentation', title: 'AWS Well-Architected', url: 'https://aws.amazon.com/architecture/well-architected/', provider: 'AWS' },
    { type: 'course', title: 'AWS Cloud Practitioner', url: 'https://explore.skillbuilder.aws/learn', provider: 'AWS' },
    { type: 'project', title: 'Deploy on AWS (EC2/ALB/RDS)', url: 'https://aws.amazon.com/getting-started/hands-on/', provider: 'AWS' }
  ],
  'jwt': [
    { type: 'documentation', title: 'JWT Handbook', url: 'https://jwt.io/introduction', provider: 'JWT.io' },
    { type: 'project', title: 'Auth with JWT + Refresh Tokens', url: 'https://auth0.com/learn/json-web-tokens/', provider: 'Auth0' },
    { type: 'video', title: 'JWT Best Practices', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM', provider: 'YouTube' }
  ],
  'testing': [
    { type: 'documentation', title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started', provider: 'Jest' },
    { type: 'documentation', title: 'Supertest Docs', url: 'https://github.com/ladjs/supertest', provider: 'GitHub' },
    { type: 'project', title: 'Test Express APIs', url: 'https://github.com/goldbergyoni/nodebestpractices', provider: 'GitHub' }
  ],
  'rest': [
    { type: 'documentation', title: 'REST Maturity Model', url: 'https://martinfowler.com/articles/richardsonMaturityModel.html', provider: 'Martin Fowler' },
    { type: 'article', title: 'API Design Best Practices', url: 'https://cloud.google.com/blog/topics/developers-practitioners/api-design-best-practices', provider: 'Google Cloud' },
    { type: 'project', title: 'Design a REST API', url: 'https://github.com/marmelab/awesome-rest', provider: 'GitHub' }
  ]
};

// LLM/prompt-engineering resources
const LLM_RESOURCES = {
  'prompt engineering': [
    { type: 'documentation', title: 'OpenAI Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', provider: 'OpenAI' },
    { type: 'article', title: 'Prompting Guides', url: 'https://www.promptingguide.ai/', provider: 'Prompting Guide' },
    { type: 'course', title: 'DeepLearning.AI Prompt Engineering', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', provider: 'DeepLearning.AI' }
  ],
  'openai api': [
    { type: 'documentation', title: 'OpenAI API Docs', url: 'https://platform.openai.com/docs/overview', provider: 'OpenAI' }
  ],
  'groq': [
    { type: 'documentation', title: 'Groq API Docs', url: 'https://groq.com/', provider: 'Groq' }
  ],
  'anthropic': [
    { type: 'documentation', title: 'Anthropic API Docs', url: 'https://docs.anthropic.com/', provider: 'Anthropic' }
  ],
  'huggingface': [
    { type: 'documentation', title: 'Transformers', url: 'https://huggingface.co/docs/transformers/index', provider: 'HuggingFace' }
  ],
  'rag': [
    { type: 'documentation', title: 'RAG Overview', url: 'https://www.promptingguide.ai/techniques/rag', provider: 'Prompting Guide' },
    { type: 'article', title: 'RAG from scratch', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/', provider: 'Pinecone' }
  ],
  'embeddings': [
    { type: 'documentation', title: 'OpenAI Embeddings', url: 'https://platform.openai.com/docs/guides/embeddings', provider: 'OpenAI' }
  ],
  'pinecone': [
    { type: 'documentation', title: 'Pinecone Docs', url: 'https://docs.pinecone.io/', provider: 'Pinecone' }
  ],
  'faiss': [
    { type: 'documentation', title: 'FAISS Docs', url: 'https://github.com/facebookresearch/faiss', provider: 'Meta' }
  ],
  'chroma': [
    { type: 'documentation', title: 'Chroma Docs', url: 'https://docs.trychroma.com/', provider: 'Chroma' }
  ],
  'langchain': [
    { type: 'documentation', title: 'LangChain Docs', url: 'https://python.langchain.com/docs/get_started/introduction', provider: 'LangChain' }
  ],
  'llamaindex': [
    { type: 'documentation', title: 'LlamaIndex Docs', url: 'https://docs.llamaindex.ai/', provider: 'LlamaIndex' }
  ],
  'evaluation': [
    { type: 'article', title: 'LLM Evaluation and Benchmarks', url: 'https://arize.com/blog/llm-evaluation-guide/', provider: 'Arize AI' }
  ],
  'guardrails': [
    { type: 'documentation', title: 'Guardrails AI', url: 'https://www.guardrailsai.com/', provider: 'Guardrails' }
  ],
  'lora': [
    { type: 'article', title: 'LoRA Explained', url: 'https://huggingface.co/blog/lora', provider: 'HuggingFace' }
  ],
  'fine-tuning': [
    { type: 'documentation', title: 'OpenAI Fine-tuning', url: 'https://platform.openai.com/docs/guides/fine-tuning', provider: 'OpenAI' }
  ],
  'vector db': [
    { type: 'article', title: 'Vector Databases 101', url: 'https://www.pinecone.io/learn/vector-database/', provider: 'Pinecone' }
  ]
};

// ML/DS resources
const ML_RESOURCES = {
  'python': [
    { type: 'documentation', title: 'Python Docs', url: 'https://docs.python.org/3/', provider: 'Python' }
  ],
  'pandas': [
    { type: 'documentation', title: 'Pandas Docs', url: 'https://pandas.pydata.org/docs/', provider: 'Pandas' }
  ],
  'numpy': [
    { type: 'documentation', title: 'NumPy Docs', url: 'https://numpy.org/doc/', provider: 'NumPy' }
  ],
  'scikit-learn': [
    { type: 'documentation', title: 'scikit-learn Docs', url: 'https://scikit-learn.org/stable/', provider: 'scikit-learn' }
  ],
  'tensorflow': [
    { type: 'documentation', title: 'TensorFlow Guides', url: 'https://www.tensorflow.org/learn', provider: 'TensorFlow' }
  ],
  'pytorch': [
    { type: 'documentation', title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', provider: 'PyTorch' }
  ],
  'mlflow': [
    { type: 'documentation', title: 'MLflow Docs', url: 'https://mlflow.org/docs/latest/index.html', provider: 'MLflow' }
  ],
  'azure': [
    { type: 'documentation', title: 'Azure ML Docs', url: 'https://learn.microsoft.com/azure/machine-learning/', provider: 'Microsoft' }
  ],
  'gcp': [
    { type: 'documentation', title: 'Vertex AI Docs', url: 'https://cloud.google.com/vertex-ai/docs', provider: 'Google Cloud' }
  ],
  'langchain': [
    { type: 'documentation', title: 'LangChain Docs', url: 'https://python.langchain.com/docs/', provider: 'LangChain' }
  ],
  'rag': [
    { type: 'article', title: 'RAG from scratch', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/', provider: 'Pinecone' }
  ]
};

// Unified skill taxonomy (frontend + backend + platform + DS/ML + LLM)
const SKILL_TAXONOMY = [
  // Frontend
  'react', 'redux', 'next.js', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'sass', 'webpack', 'vite', 'testing', 'jest', 'rtl', 'cypress', 'playwright', 'accessibility', 'a11y', 'performance',
  // Backend/platform
  'node.js', 'express.js', 'rest', 'graphql', 'websockets', 'mongodb', 'mongoose', 'postgresql', 'mysql', 'redis', 'prisma', 'jwt', 'oauth2', 'rbac', 'zod', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'nginx', 'pm2',
  // DS/ML
  'python', 'r', 'sql', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'opencv', 'hadoop', 'hive', 'spark', 'storm', 'tableau', 'matplotlib', 'time series', 'bayesian', 'experiments', 'ab testing', 'etl', 'mysql', 'statistics',
  // LLM/prompt engineering
  'prompt engineering', 'openai api', 'groq', 'anthropic', 'huggingface', 'rag', 'embeddings', 'vector db', 'pinecone', 'faiss', 'chroma', 'langchain', 'llamaindex', 'few-shot', 'zero-shot', 'temperature', 'top-p', 'evaluation', 'hallucination', 'guardrails', 'lora', 'fine-tuning'
];

const ML_SKILLS = [
  'python','pandas','numpy','scikit-learn','tensorflow','pytorch','mlflow','azure','gcp','rag','embeddings','vector db','langchain','huggingface'
];

function buildEnhancedAnalysis(resumeText = '', jobDescription = '', isWebRole = false) {
  const jdSkills = extractSkillsFromJD(jobDescription, 25);
  const resumeSkills = extractSkillsFromResume(resumeText);
  const matched = uniq(jdSkills.filter(k => resumeSkills.includes(k)));
  const missing = uniq(jdSkills.filter(k => !resumeSkills.includes(k)));

  // Base scores from JD matching
  let atsScore = Math.round((matched.length / Math.max(1, jdSkills.length)) * 100);
  let matchScore = Math.round((matched.length * 1.1 / Math.max(1, jdSkills.length)) * 100);

  // Reward demonstrated depth: projects, research, publications, internships
  const lower = (resumeText || '').toLowerCase();
  const depthSignals = [
    { key: 'project', bonus: 4 },
    { key: 'projects', bonus: 4 },
    { key: 'research', bonus: 5 },
    { key: 'publication', bonus: 5 },
    { key: 'publications', bonus: 5 },
    { key: 'paper', bonus: 4 },
    { key: 'internship', bonus: 3 },
    { key: 'conference', bonus: 3 },
    { key: 'thesis', bonus: 4 }
  ];
  let bonus = 0;
  for (const s of depthSignals) {
    if (lower.includes(s.key)) bonus += s.bonus;
  }
  atsScore = Math.min(100, atsScore + Math.floor(bonus / 2));
  matchScore = Math.min(100, matchScore + bonus);

  // Strengths: show complete, logical tokens from the resume (prefer those relevant to JD, otherwise top resume skills)
  let strengthsTokens = matched.length ? matched : resumeSkills;
  strengthsTokens = strengthsTokens.slice(0, 12);

  // Build role-specific skill gaps with curated resources
  // Detect ML role and filter missing/non-ML as required
  const isMLRole = /\b(ml|machine learning|data scientist|data science|pytorch|tensorflow|scikit|sklearn|numpy|pandas|vertex ai|azure ml|langchain|rag|embedding|vector db)\b/i.test(jobDescription || '');
  const filteredMissing = isMLRole ? missing.filter(s => ML_SKILLS.includes(normalizeSkill(s))) : missing;

  const skillGaps = filteredMissing.slice(0, 8).map(skill => {
    const normalizedSkill = normalizeSkill(skill);
    const resources = ML_RESOURCES[normalizedSkill] || LLM_RESOURCES[normalizedSkill] || [];

    return {
      skill: titleCase(normalizedSkill),
      importance: filteredMissing.indexOf(skill) < 3 ? 'high' : 'medium',
      resources
    };
  });

  // Generate non-repetitive, resume-aware, beginner-friendly bullets based on JD focus
  const isLLMRole = /prompt|llm|rag|embedding|vector db|openai|anthropic|groq|huggingface/i.test(jobDescription || '');
  const jdFocus = pickJDFocus(jobDescription);
  const suggestedBullets = uniq(
    filteredMissing.slice(0, 6).flatMap((raw) => generateBeginnerBulletsForSkill(titleCase(normalizeSkill(raw)), jdFocus, isLLMRole)).slice(0, 6)
  );

  // Areas for improvement derived from missing skills and common backend gaps
  // Areas for Improvement: strictly JD - resume diff, simple, specific, non-generic
  const improvementBullets = filteredMissing.map(s => titleCase(normalizeSkill(s))).slice(0, 10);

  const verdict = isWebRole
    ? 'Focus on demonstrating practical frontend development experience with modern frameworks and responsive design principles.'
    : 'Consider adding more quantifiable achievements and technical details to your experience.';

  return {
    atsScore,
    matchScore,
    matchedKeywords: matched,
    missingKeywords: filteredMissing,
    strengths: strengthsTokens,
    suggestedBullets,
    skillGaps,
    improvementBullets,
    rewriteSuggestions: [
      // keep minimal and let UI ignore if not needed; dynamic content provided elsewhere
    ],
    finalVerdict: verdict
  };
}

function simpleTokenize(text = '') {
  return (text || '')
    .toLowerCase()
    .replace(/[\W_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const STOPWORDS = new Set([
  'the','and','for','with','that','this','from','will','are','have','has','using','use','work','solutions','experience','analysis','data','large','strong'
]);

function extractKeywordsFromJD(jd, maxKeywords = 30) {
  // Common tech skill keywords to prioritize
  const TECH_SKILLS = new Set([
    'react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css',
    'node', 'next.js', 'webpack', 'vite', 'sass', 'less', 'tailwind',
    'bootstrap', 'material-ui', 'redux', 'zustand', 'graphql', 'rest',
    'git', 'github', 'jest', 'testing', 'cypress', 'responsive', 'mobile-first',
    'seo', 'accessibility', 'a11y', 'performance', 'optimization'
  ]);

  // Extract both single words and important phrases
  const tokens = simpleTokenize(jd || '');
  const phrases = extractPhrases(jd || '');
  
  // Score and rank keywords
  const scores = {};
  
  // Score individual tokens
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (STOPWORDS.has(t)) continue;
    
    let score = 1;
    if (TECH_SKILLS.has(t.toLowerCase())) score += 3;  // Boost tech skills
    if (t.length > 4) score += 1;  // Slightly boost longer words
    
    scores[t] = (scores[t] || 0) + score;
  }
  
  // Score phrases (especially multi-word tech terms)
  for (const p of phrases) {
    if (p.includes(' ') && !STOPWORDS.has(p)) {  // Multi-word phrases
      scores[p] = (scores[p] || 0) + 2;
    }
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([k]) => k);

  // Prefer skills-like tokens: filter out obvious non-skills
  const NON_SKILL = /^(the|and|with|from|into|about|team|role|work|build|deliver|drive|help|ensure|apps?|services?|platform|product|customer|users?)$/i;
  return ranked.filter(k => !NON_SKILL.test(k));
}

function extractSkillsFromJD(jd = '', maxSkills = 30) {
  const lowered = jd.toLowerCase();
  const hits = [];
  for (const skill of SKILL_TAXONOMY) {
    const s = skill.toLowerCase();
    const re = new RegExp(`(?:^|[^a-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`, 'i');
    if (re.test(lowered)) hits.push(normalizeSkill(skill));
  }
  // Only return taxonomy hits to avoid generic words like "skills", "models" etc.
  return uniq(hits).slice(0, maxSkills);
}

function extractSkillsFromResume(text = '') {
  const lowered = (text || '').toLowerCase();
  const skills = [];
  for (const skill of SKILL_TAXONOMY) {
    const s = skill.toLowerCase();
    const re = new RegExp(`(?:^|[^a-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z0-9]|$)`, 'i');
    if (re.test(lowered)) skills.push(normalizeSkill(skill));
  }
  return uniq(skills);
}

function extractPhrases(text) {
  const phrases = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Match common tech skill patterns
    const matches = line.match(/[\w\s-]+\.(js|ts|css|html|io|dev)/gi) || [];
    phrases.push(...matches);
    
    // Capture hyphenated terms
    const hyphenated = line.match(/\w+-\w+(-\w+)*/g) || [];
    phrases.push(...hyphenated);
    
    // Capture quoted terms
    const quoted = line.match(/"([^"]+)"/g) || [];
    phrases.push(...quoted.map(q => q.replace(/"/g, '')));
  }
  
  return phrases;
}

function snippetForKeyword(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + 120);
  return (text.substring(start, end).replace(/\s+/g, ' ').trim());
}

function cleanSnippet(s = '') {
  if (!s) return s;
  // Remove emails, phones, links, and generic headings
  s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g, '')
       .replace(/https?:\/\/\S+/g, '')
       .replace(/linkedin|github|phone|email|education|skills|projects|internships/gi, '')
       .replace(/\s{2,}/g, ' ')
       .trim();
  // Trim to ~160 chars for readability
  if (s.length > 180) s = s.slice(0, 177) + '...';
  return s;
}

// Heuristically pick a simple JD focus phrase to make bullets contextual
function pickJDFocus(jd = '') {
  const lower = (jd || '').toLowerCase();
  const options = [
    { key: 'rag', label: 'a mini-RAG demo' },
    { key: 'evaluation', label: 'a small evaluation harness' },
    { key: 'guardrails', label: 'basic safety guardrails' },
    { key: 'openai', label: 'an OpenAI API integration' },
    { key: 'groq', label: 'a Groq API integration' },
    { key: 'anthropic', label: 'an Anthropic API integration' },
    { key: 'langchain', label: 'a small LangChain workflow' },
    { key: 'vector', label: 'a vector DB search demo' },
    { key: 'embedding', label: 'an embeddings similarity demo' },
    { key: 'node', label: 'a small Node API' },
    { key: 'python', label: 'a small Python script' }
  ];
  for (const opt of options) {
    if (lower.includes(opt.key)) return opt.label;
  }
  return 'a tiny demo aligned to the JD';
}

// Produce 1-2 short, beginner-friendly bullets for a missing skill
function generateBeginnerBulletsForSkill(skill = '', jdFocus = '', isLLM = false) {
  const bullets = [];
  if (isLLM) {
    bullets.push(`Do a 1–2 hour mini task: use ${skill} to build ${jdFocus}; write a 2-line result summary`);
    bullets.push(`Add a short README for ${skill} (setup, a tiny example, one metric)`);
  } else {
    bullets.push(`Create a small demo using ${skill} and document one measurable outcome`);
    bullets.push(`Write a brief bullet: "Applied ${skill} on a mini project; improved X by Y%"`);
  }
  return bullets;
}

function normalizeSkill(s = '') {
  return (s || '').trim().toLowerCase().replace(/[^a-z0-9.+#\- ]/g, '');
}

function titleCase(s = '') {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function uniq(arr = []) {
  return Array.from(new Set(arr));
}

function buildMockAnalysis(text = '', jd = '') {
  const jdKeywords = extractKeywordsFromJD(jd, 25);
  const matched = jdKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
  const missing = jdKeywords.filter(k => !text.toLowerCase().includes(k.toLowerCase()));

  const atsScore = Math.min(95, Math.round((matched.length / Math.max(1, jdKeywords.length)) * 100));
  const matchScore = Math.min(97, Math.round((matched.length * 1.1 / Math.max(1, jdKeywords.length)) * 100));

  const strengths = matched.map(k => ({ keyword: k, snippet: snippetForKeyword(text, k) }));
  const missing_keywords = missing;

  const suggested_bullets = missing.slice(0, 6).map(k => `Add a bullet demonstrating experience with ${k} — e.g. "Designed and implemented ${k}-based solution to ... (quantified impact)"`);

  const skill_gaps = missing.slice(0, 6).map((k, i) => ({
    skill: k,
    priority: i < 3 ? 'high' : 'medium',
    resources: DEFAULT_RESOURCES.slice(0,2)
  }));

  const rewrite_suggestions = [
    'Move publications/patents to a separate "Publications & Patents" section and add 1-2 bullets per item summarizing impact.',
    'For projects, quantify results (e.g., improved model accuracy by X%, reduced runtime by Y%).',
    'Add short bullets under each role that begin with action verbs and include metrics.'
  ];

  const finalVerdict = `Resume contains strong academic and project background (publications, patents). To increase ATS match, include more JD-specific keywords in bullet points and the Professional Profile.`;

  return {
    atsScore,
    matchScore,
    matchedKeywords: matched,
    missingKeywords: missing_keywords,
    strengths: strengths,
    suggestedBullets: suggested_bullets,
    skillGaps: skill_gaps,
    rewriteSuggestions: rewrite_suggestions,
    learningResources: skill_gaps.map(g => ({ skill: g.skill, priority: g.priority, resources: g.resources })),
    finalVerdict,
    scoreExplanation: `Matched ${matched.length} of ${jdKeywords.length} prioritized keywords extracted from the JD. Mock scoring used for development.`
  };
}

async function callGrokApi(prompt, options = {}) {
  const GROK_URL = process.env.GROK_API_URL;
  const GROK_KEY = process.env.GROK_API_KEY;
  if (!GROK_URL || !GROK_KEY) {
    throw new Error('GROK not configured');
  }

  const body = {
    prompt,
    max_tokens: options.max_tokens ?? 1500,
    temperature: options.temperature ?? 0.0
  };

  const resp = await fetch(GROK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(`Grok API error: ${resp.status} ${text}`);
    err.status = resp.status;
    throw err;
  }

  const json = await resp.json();
  return json;
}

export async function generateResumeSuggestions(resumeText = '') {
  // If Grok is configured, attempt to call it. The expected response shape is flexible.
  try {
    if (process.env.GROK_API_KEY && process.env.GROK_API_URL) {
      const prompt = `Provide a structured JSON analysis of the resume below. Return fields: atsScore, matchScore, matchedKeywords, missingKeywords, strengths (array), suggestedBullets (array), skillGaps (array with skill/priority/resources), rewriteSuggestions (array), finalVerdict, scoreExplanation. Resume:\n\n${resumeText}`;
      const grokResp = await callGrokApi(prompt, { max_tokens: 1200 });
      // Try to map grokResp into the expected shape; if not present, return raw
      return grokResp;
    }
  } catch (e) {
    console.warn('Grok call failed, falling back to mock analysis:', e.message);
  }

  // Fallback: return a deterministic mock analysis so UI sections are non-empty
  return buildMockAnalysis(resumeText, '');
}

export async function analyzeResumeAgainstJD(resumeText = '', jobDescription = '') {
  try {
    if (process.env.GROK_API_KEY && process.env.GROK_API_URL) {
      // First, analyze the job description to understand the role context
      const roleAnalysisPrompt = `Analyze this job description and identify the key role requirements:

${jobDescription}

Return a JSON object with:
1. Primary role category (e.g., "frontend", "backend", "fullstack", "devops")
2. Required skill level (e.g., "junior", "mid", "senior")
3. Key technical requirements
4. Industry/domain context`;

      const roleContext = await callGrokApi(roleAnalysisPrompt, { 
        max_tokens: 500,
        temperature: 0.1
      });

      // Now use this context for the detailed analysis
      const prompt = `You are an expert ATS system analyzing a resume for the following position:

${roleContext}

Job Description:
${jobDescription}

Resume:
${resumeText}

Perform a detailed gap analysis and provide learning recommendations that are:
1. Exactly matched to the missing skills
2. Appropriate for the required skill level
3. Focused on the specific job context
4. Progressively structured (fundamental to advanced)
5. Include hands-on, practical components

Return the analysis in this JSON format:

{
  "atsScore": number (0-100),
  "matchScore": number (0-100),
  "matchedKeywords": string[] (key skills found in resume),
  "missingKeywords": string[] (important skills from JD missing in resume),
  "strengths": [
    { "keyword": string, "snippet": string, "relevance": string }
  ],
  "skillGaps": [
    {
      "skill": string,
      "importance": "high|medium|low",
      "context": string (how this skill is used in the role),
      "currentLevel": string (candidate's current proficiency),
      "requiredLevel": string (job's required proficiency),
      "resources": [
        {
          "type": "documentation|course|video|project|practice",
          "title": string,
          "description": string (why this resource is relevant),
          "url": string,
          "provider": string,
          "difficulty": "beginner|intermediate|advanced",
          "duration": string (estimated time to complete),
          "cost": "free|paid",
          "outcomes": string[] (what you'll learn)
        }
      ],
      "practicalSteps": [
        {
          "step": string,
          "description": string,
          "estimatedTime": string,
          "resources": string[]
        }
      ]
    }
  ],
  "suggestedBullets": string[] (specific bullet points to add),
  "learningPath": {
    "immediate": string[] (next 2 weeks),
    "shortTerm": string[] (1-2 months),
    "longTerm": string[] (3-6 months)
  },
  "finalVerdict": string
}

For each skill gap:
1. Start with foundational resources if skill is entirely new
2. Suggest intermediate/advanced resources if candidate shows some experience
3. Include practical exercises and real-world projects
4. Provide both quick wins and comprehensive learning paths
5. Focus on resources specific to the job's tech stack and domain

IMPORTANT STYLE GUIDANCE:
- Tips MUST be actionable, beginner-friendly, and step-based — NOT enterprise-level research work.
- Prefer small, concrete tasks (e.g., "Build a mini-RAG on a public dataset") over vague objectives (e.g., "Prototype a RAG pipeline").
- Keep suggestions concise and realistic for students; include 1–2 sentence resume bullet examples aligned to the JD.`;

      // Enhanced analysis with GPT-4
      const analysisResp = await callGrokApi(prompt, { 
        max_tokens: 3000,
        temperature: 0.2  // Slightly higher temperature for more creative resource suggestions
      });

      // Parse and validate the response
      let analysis;
      if (typeof analysisResp === 'string') {
        analysis = JSON.parse(analysisResp);
      } else {
        analysis = analysisResp;
      }

      // For each skill gap, get specific learning recommendations
      const enhancedSkillGaps = await Promise.all(
        (analysis.skillGaps || []).map(async (gap) => {
          // Generate specific learning path for this skill
          const skillPrompt = `For a ${analysis.roleContext?.level || 'mid-level'} ${analysis.roleContext?.category || 'developer'} position:

Skill to learn: ${gap.skill}
Current level: ${gap.currentLevel || 'beginner'}
Required level: ${gap.requiredLevel || 'proficient'}
Job context: ${gap.context || jobDescription}

Provide a detailed, progressive learning path with:
1. Foundational concepts needed
2. Practical exercises
3. Real-world projects
4. Best practices
5. Common pitfalls to avoid
6. Industry-standard tools and workflows
7. Specific resource recommendations with direct links

Focus on resources that:
- Are highly relevant to the job requirements
- Include practical, hands-on components
- Progress from basics to advanced concepts
- Cover both theory and practical application
- Include project-based learning

STYLE:
- Tips MUST be actionable, beginner-friendly, and step-based — keep each step small.
- Include at least one mini-project suggestion (e.g., use a public dataset) and one 1–2 sentence resume bullet example aligned to the JD.`;

          try {
            const skillResp = await callGrokApi(skillPrompt, {
              max_tokens: 1000,
              temperature: 0.3
            });

            let skillResources;
            if (typeof skillResp === 'string') {
              skillResources = JSON.parse(skillResp);
            } else {
              skillResources = skillResp;
            }

            return {
              ...gap,
              resources: skillResources.resources || gap.resources,
              practicalSteps: skillResources.practicalSteps || gap.practicalSteps,
              learningPath: skillResources.learningPath || gap.learningPath
            };
          } catch (e) {
            console.warn(`Failed to get enhanced resources for ${gap.skill}:`, e);
            return gap;
          }
        })
      );

      // Return the enhanced analysis
      return {
        ...analysis,
        skillGaps: enhancedSkillGaps
      };
    }
  } catch (e) {
    console.warn('Grok JD call failed, using enhanced analysis:', e.message);
  }

  // If Grok fails, use an enhanced analysis that's specific to the job type
  const isWebRole = jobDescription.toLowerCase().includes('frontend') || 
                   jobDescription.toLowerCase().includes('web') ||
                   jobDescription.toLowerCase().includes('react');

  return buildEnhancedAnalysis(resumeText, jobDescription, isWebRole);
}

export async function getSkillResources(prompt) {
  try {
    if (process.env.GROK_API_KEY && process.env.GROK_API_URL) {
      // Enhanced prompt for better skill-specific resources
      const enhancedPrompt = `Given these skills and context, provide detailed learning resources. For each skill:
1. Determine its importance (high/medium/low) based on current job market demand
2. Provide 3-4 specific, high-quality learning resources
3. Include a mix of:
   - Official documentation/tutorials
   - Interactive courses
   - Video tutorials
   - Practice projects
4. Focus on respected platforms and free resources where possible

${prompt}

Return a JSON object in this exact format:
{
  "skillGaps": [
    {
      "skill": "<skill name>",
      "importance": "high|medium|low",
      "resources": [
        {
          "type": "course|documentation|video|project",
          "title": "<specific title>",
          "url": "<direct URL>",
          "provider": "<platform name>"
        }
      ]
    }
  ]
}

STYLE:
- Tips and projects MUST be actionable, beginner-friendly, and step-based (mini-projects over large systems).`;

      const grokResp = await callGrokApi(enhancedPrompt, { 
        max_tokens: 2000,
        temperature: 0.2  // Lower temperature for more focused results
      });

      // Parse and validate the response
      let skillGaps;
      if (typeof grokResp === 'string') {
        skillGaps = JSON.parse(grokResp).skillGaps;
      } else {
        skillGaps = grokResp.skillGaps;
      }

      // Ensure each skill has appropriate resources
      return skillGaps.map(gap => ({
        ...gap,
        importance: gap.importance || 'medium',
        resources: gap.resources.map(resource => ({
          ...resource,
          type: resource.type || 'course',
          provider: resource.provider || new URL(resource.url).hostname.replace('www.', '')
        }))
      }));
    }

    // If Grok is not configured, throw error to trigger fallback
    throw new Error('GROK_API_KEY not configured');
  } catch (e) {
    console.warn('Grok skill resources call failed:', e.message);
    throw e;
  }
}

// Export the default object for backward compatibility
export default grokResumeService;
