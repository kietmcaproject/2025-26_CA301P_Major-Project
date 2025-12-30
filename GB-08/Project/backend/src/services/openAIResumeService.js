import { OpenAI } from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract a JSON substring if the model added surrounding text
    const m = text.match(/\{[\s\S]*\}/m);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

export async function generateResumeSuggestions(resumeText) {
  try {
    const systemPrompt = `You are an expert ATS and resume analyst. Return STRICT JSON ONLY (no explanatory text or markdown) that follows the schema exactly. Reward deep, semantic matches (not exact token matches). Expand synonyms and implicit concepts (e.g., treat "ML deployment" as related to "MLOps"). Give high weight to demonstrated depth of experience and results.

Schema (RETURN THESE FIELDS):
{
  "atsScore": number (0-100),
  "matchScore": number (0-100),
  "matchedKeywords": string[] (MAX 25),
  "missingKeywords": string[] (MIN 10),
  "skillGaps": [ { "skill": string, "priority": "high|medium|low", "resources": [ { "title": string, "url": string } ] } ] (MIN 5 skill gaps),
  "improvementBullets": string[] (MIN 8 actionable bullet suggestions),
  "learningResources": [ { "skill": string, "priority": "high|medium|low", "resources": [ { "title": string, "url": string } ] } ],
  "rewriteSuggestions": string[] (UP TO 3 rewritten resume bullets — REQUIRED if atsScore < 80),
  "finalVerdict": string (one-line summary)
}

Rules:
- Return JSON only. No commentary, code fences, or extra text.
- Include implicit and synonym matches (semantic matching). Use synonyms and related domain terms.
- For matchedKeywords/missingKeywords, return up to 25 items each when possible; missingKeywords must include at least 10 items where applicable.
- For each skill gap include 3-7 high-quality learning resources (links allowed, but up to 5 per skill to keep output reasonable).
- Provide at least 8 highly actionable improvement bullets focused on results, metrics, and clear rewrites.
- If the resume demonstrates deep experience (senior-level projects, leadership, advanced degrees, measurable outcomes), increase matchScore and atsScore accordingly.
- When in doubt, err on the side of giving the candidate credit for semantic matches if responsibilities align.`;

    const userPrompt = `Analyze only the RESUME below and produce the JSON described. RESUME:\n\n${resumeText}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.0,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    // Try to parse JSON; if not parseable, return the raw content so frontend can inspect
    const parsed = safeParseJson(content);
    if (parsed) return JSON.stringify(parsed);
    console.warn('generateResumeSuggestions: response was not strict JSON — returning raw content');
    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // If quota exceeded or rate limited, return a mocked response so the app remains usable during development
    const isQuotaError = error?.status === 429 || error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota';
    if (isQuotaError) {
      console.warn('OpenAI quota exceeded — returning mocked analysis for development');
      const mock = {
        atsScore: 82,
        matchScore: 85,
        matchedKeywords: ['Python','SQL','Spark','Hadoop','AWS','ETL','Machine Learning','Kaggle','Statistics','MLOps'],
        missingKeywords: ['TensorFlow','Kubernetes','Docker','Seldon','Airflow','PyTorch','TensorBoard','MLflow','GCP','CloudFormation'],
        skillGaps: [
          { skill: 'TensorFlow', priority: 'medium', resources: [{ title: 'Intro to TensorFlow', url: 'https://coursera.org' }] },
          { skill: 'Kubernetes', priority: 'medium', resources: [{ title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/' }] },
          { skill: 'Docker', priority: 'low', resources: [{ title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' }] },
          { skill: 'MLflow', priority: 'low', resources: [{ title: 'MLflow Docs', url: 'https://mlflow.org' }] },
          { skill: 'TensorBoard', priority: 'low', resources: [{ title: 'TensorBoard Guide', url: 'https://www.tensorflow.org/tensorboard' }] }
        ],
        improvementBullets: [
          'Rewrite project bullets to include clear metrics (e.g., "improved X by Y%" )',
          'Add tech stack for ETL pipelines and include data scale',
          'Highlight deployment experience (containers, orchestration)',
          'Add links to production demos or GitHub repos for key projects',
          'Quantify ML model performance and business impact',
          'Group ML and data engineering skills under clear section headings',
          'Replace vague phrases like "worked on" with specific actions and outcomes',
          'Add a concise professional profile at the top that summarizes senior-level impact'
        ],
        learningResources: [
          { skill: 'TensorFlow', priority: 'medium', resources: [{ title: 'Intro to TensorFlow', url: 'https://coursera.org' }] }
        ],
        rewriteSuggestions: [
          'Designed and productionized ETL pipelines processing 10M+ events/day using Spark and AWS, reducing data latency by 40%',
          'Developed and deployed ML models achieving 0.87 AUC for churn prediction, improving retention by 12%',
          'Led migration of batch workloads to cloud-based data platform on AWS, enabling 3x faster reporting'
        ],
        finalVerdict: 'Strong senior data scientist candidate with production ML and data engineering experience; recommend highlighting deployment and MLOps skills.'
      };
      return JSON.stringify(mock);
    }

    throw new Error('Failed to analyze resume');
  }
}

export async function analyzeResumeAgainstJD(resumeText, jobDescription) {
  try {
    const systemPrompt = `You are an expert ATS and resume analyst. Return STRICT JSON ONLY (no explanatory text) with the following schema. Favor semantic matches, synonyms, and depth of experience when scoring. Schema:
{
  "atsScore": number (0-100),
  "matchScore": number (0-100),
  "matchingKeywords": string[] (MAX 25),
  "missingKeywords": string[] (MIN 10),
  "improvementBullets": string[] (MIN 8),
  "suggestedBullets": string[] (up to 10),
  "skillGaps": [ { "skill": string, "priority": "high|medium|low", "resources": [ { "title": string, "url": string } ] } ],
  "rewriteSuggestions": string[] (UP TO 3 if atsScore < 80),
  "finalVerdict": string
}`;

    const userPrompt = `Analyze the RESUME and JOB DESCRIPTION below and return JSON that matches the schema exactly. RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt } ],
      temperature: 0.0,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    const parsed = safeParseJson(content);
    if (parsed) return JSON.stringify(parsed);
    console.warn('analyzeResumeAgainstJD: response was not strict JSON — returning raw content');
    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    const isQuotaError = error?.status === 429 || error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota';
    if (isQuotaError) {
      console.warn('OpenAI quota exceeded — returning mocked JD analysis for development');
      // Create a role-aware mock based on the job description when possible
      const jdText = (jobDescription || '').toLowerCase();
      const isFrontend = jdText.includes('frontend') || jdText.includes('react') || jdText.includes('javascript') || jdText.includes('ui') || jdText.includes('css');

      if (isFrontend) {
        const mockFrontend = {
          atsScore: 78,
          matchScore: 75,
          matchingKeywords: ['JavaScript','React','HTML','CSS'],
          missingKeywords: ['TypeScript','Accessibility','Performance Optimization','Testing (Jest/RTL)','State Management (Redux/Zustand)'],
          improvementBullets: [
            'Add TypeScript usage in project bullets and indicate level of adoption',
            'Include measurable performance improvements (reduced LCP/TTI, bundle size reductions)',
            'Showcase responsive design examples and accessibility (a11y) fixes'
          ],
          suggestedBullets: ['Implemented responsive React components with optimized bundle splitting, reducing initial load by 30%'],
          skillGaps: [
            { skill: 'TypeScript', priority: 'high', resources: [{ title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', provider: 'TypeScript' }] },
            { skill: 'Accessibility', priority: 'high', resources: [{ title: 'Web Accessibility by MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', provider: 'MDN' }] },
            { skill: 'Performance Optimization', priority: 'medium', resources: [{ title: 'Web Performance Fundamentals', url: 'https://web.dev/fast/', provider: 'web.dev' }] }
          ],
          rewriteSuggestions: [ 'Converted legacy JS components to TypeScript and reduced runtime errors by X% (quantify if possible)' ],
          finalVerdict: 'Frontend-focused candidate; strengthen TypeScript, testing, accessibility, and performance examples.'
        };
        return JSON.stringify(mockFrontend);
      }

      // Default to a generic mock when job type is unknown
      const mock = {
        atsScore: 78,
        matchScore: 75,
        matchingKeywords: ['Python','SQL','Spark'],
        missingKeywords: ['TensorFlow','Kubernetes','Docker','Airflow','MLflow','TensorBoard','GCP','Seldon','Kinesis','CloudFormation'],
        improvementBullets: [
          'Emphasize ML deployment/serving experience with tech stack and outcomes',
          'Add measurable results to project bullets',
          'Group data engineering and ML responsibilities clearly'
        ],
        suggestedBullets: ['Built ETL pipelines processing 10M+ events/day using Spark and AWS'],
        skillGaps: [ { skill: 'Kubernetes', priority: 'medium', resources: [{ title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/', provider: 'Kubernetes' }] } ],
        rewriteSuggestions: [ 'Designed and productionized ETL pipelines processing 10M+ events/day using Spark and AWS, reducing latency by 40%' ],
        finalVerdict: 'Strong match; consider highlighting MLOps and deployment details.'
      };
      return JSON.stringify(mock);
    }

    throw new Error('Failed to analyze resume against job description');
  }
}

export async function getSkillResources(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { 
          role: 'system', 
          content: `You are an expert career advisor. Generate learning resources for skills based on the job requirements. Return STRICT JSON in the format:
{
  "skillGaps": [
    {
      "skill": string,
      "importance": "high|medium|low",
      "resources": [
        {
          "type": "course|tutorial|documentation",
          "title": string,
          "url": string,
          "provider": string
        }
      ]
    }
  ]
}

Rules:
- Resources must be real, high-quality learning materials from reputable platforms
- Avoid bootcamps or subscription services unless they're industry standards
- Prefer official documentation and free resources where available
- Include a mix of beginner and advanced materials
- Resources should match the job level and requirements
- URLs must be valid and point to specific courses/materials`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    const parsed = safeParseJson(content);
    if (parsed?.skillGaps) {
      return parsed.skillGaps;
    }
    throw new Error('Invalid response format from OpenAI');
  } catch (error) {
    console.error('OpenAI API error in getSkillResources:', error);
    throw error;
  }
}

export const openAIResumeService = {
  generateResumeSuggestions,
  analyzeResumeAgainstJD,
  getSkillResources
};

// Export default for backward compatibility
export default openAIResumeService;
