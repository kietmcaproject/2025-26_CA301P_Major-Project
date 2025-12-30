import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface StrengthItem {
  keyword?: string;
  snippet?: string;
}

interface SkillResource {
  type: 'course' | 'project' | 'article' | 'video';
  title: string;
  url: string;
  provider: string;
}

interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  resources: SkillResource[];
}

interface AnalysisData {
  score: number;
  atsScore: number;
  strengths: Array<string | StrengthItem>;
  improvements: string[];
  missingKeywords: string[];
  suggestedBullets: string[];
  skillGaps: SkillGap[];
}
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Copy,
  Zap,
  ExternalLink,
  BookOpen,
  Play
} from "lucide-react";
import { resumeAnalysisData as defaultAnalysisData } from "@/data/dummyData";

// Helper functions to map API responses to UI format
const mapBasicAnalysis = (suggestions: string) => {
  try {
    // Parse the OpenAI response and map it to our UI structure
    const parsed = JSON.parse(suggestions);
    return {
      score: parsed.overall_score || 70,
      atsScore: parsed.ats_score || 65,
      strengths: parsed.strengths || [],
      improvements: parsed.areas_for_improvement || [],
      missingKeywords: parsed.missing_keywords || [],
      suggestedBullets: parsed.suggested_bullets || [],
      skillGaps: parsed.skill_gaps || []
    };
  } catch (e) {
    // If parsing fails, return a simplified version
    return {
      score: 70,
      atsScore: 65,
      strengths: suggestions.split('\n').filter(s => s.includes('Strength')),
      improvements: suggestions.split('\n').filter(s => s.includes('Improve')),
      missingKeywords: [],
      suggestedBullets: [],
      skillGaps: []
    };
  }
};

const mapJDAnalysis = (analysis: string) => {
  try {
    // Parse the response if it's a string, otherwise use as-is
    const parsed = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
    
    // Map the skill gaps structure from the AI response
    const skillGaps = (parsed.skillGaps || parsed.skill_gaps || []).map((gap: any) => ({
      skill: gap.skill || gap.name || '',
      importance: gap.importance || gap.priority || 'medium',
      resources: (gap.resources || []).map((resource: any) => ({
        type: resource.type || 'course',
        title: resource.title || resource.name || '',
        url: resource.url || resource.link || '',
        provider: resource.provider || resource.platform || ''
      }))
    }));

    return {
      score: parsed.matchScore || parsed.match_score || parsed.overall_score || 70,
      atsScore: parsed.atsScore || parsed.ats_score || 65,
      strengths: parsed.strengths || parsed.matchedKeywords || parsed.matching_skills || [],
      improvements: parsed.areas_for_improvement || parsed.improvementBullets || parsed.improvement_suggestions || [],
      missingKeywords: parsed.missingKeywords || parsed.missing_keywords || [],
      suggestedBullets: parsed.suggestedBullets || parsed.suggested_bullets || [],
      skillGaps: skillGaps
    };
  } catch (e) {
    console.error('Error parsing analysis:', e);
    // If parsing fails and it's a string, try to extract sections
    if (typeof analysis === 'string') {
      return {
        score: 70,
        atsScore: 65,
        strengths: analysis.split('\n').filter(s => s.includes('Match')),
        improvements: analysis.split('\n').filter(s => s.includes('Improve')),
        missingKeywords: analysis.split('\n').filter(s => s.includes('Missing')),
        suggestedBullets: [],
        skillGaps: [] // Empty skill gaps when parsing fails
      };
    }
    // If not even a string, return empty structure
    return {
      score: 70,
      atsScore: 65,
      strengths: [],
      improvements: [],
      missingKeywords: [],
      suggestedBullets: [],
      skillGaps: []
    };
  }
};

// Generate useful suggested bullets from missing keywords and improvements
const generateSuggestedBullets = (missingKeywords: string[], improvements: string[], roleHint = '') => {
  const bullets: string[] = [];
  // Turn keywords into concrete, quantified bullet points
  missingKeywords.slice(0, 6).forEach((kw) => {
    const clean = kw.replace(/[•\u2022]/g, '').trim();
    bullets.push(`• Demonstrated experience with ${clean} by implementing ... (add metric or impact)`);
  });

  // Use improvements to produce tailored bullets
  improvements.slice(0, 4).forEach((imp) => {
    const short = imp.replace(/Add |Include |Mention /ig, '').trim();
    bullets.push(`• ${short.charAt(0).toUpperCase() + short.slice(1)} — e.g. "${roleHint || 'Led'} the project to ... (quantified)"`);
  });

  // If nothing produced, include a generic optimization bullet
  if (bullets.length === 0) {
    bullets.push('• Highlight projects with measurable impact (users, performance, revenue) and include technologies used.');
  }

  return bullets;
};

// Request skill gap recommendations from the backend based on job description and missing keywords
const generateSkillGaps = async (missingKeywords: string[], jobDescription: string) => {
  try {
    const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE}/api/resume/get-skill-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        missingKeywords,
        jobDescription
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch skill resources');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to get skill resources');
    }

    return data.skillGaps.map((gap: any) => ({
      skill: gap.skill,
      importance: gap.importance || 'medium',
      resources: gap.resources || []
    }));
  } catch (error) {
    console.error('Error getting skill resources:', error);
    // Return skill-specific fallback resources
    const getSkillSpecificResources = (keyword: string) => {
      const skillMap: { [key: string]: any } = {
        // Frontend Skills
        'react': {
          importance: 'high',
          resources: [
            {
              type: 'documentation',
              title: 'React Official Documentation',
              url: 'https://react.dev',
              provider: 'React'
            },
            {
              type: 'course',
              title: 'React - The Complete Guide',
              url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux',
              provider: 'Udemy'
            },
            {
              type: 'project',
              title: 'Build a Full Stack React App',
              url: 'https://fullstackopen.com/en/',
              provider: 'Full Stack Open'
            }
          ]
        },
        'frontend': {
          importance: 'high',
          resources: [
            {
              type: 'course',
              title: 'Frontend Developer Roadmap',
              url: 'https://roadmap.sh/frontend',
              provider: 'roadmap.sh'
            },
            {
              type: 'course',
              title: 'Frontend Masters Learning Path',
              url: 'https://frontendmasters.com/learn/',
              provider: 'Frontend Masters'
            },
            {
              type: 'documentation',
              title: 'MDN Web Docs',
              url: 'https://developer.mozilla.org/en-US/docs/Web',
              provider: 'MDN'
            }
          ]
        },
        'javascript': {
          importance: 'high',
          resources: [
            {
              type: 'documentation',
              title: 'JavaScript MDN Guide',
              url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
              provider: 'MDN'
            },
            {
              type: 'course',
              title: 'JavaScript.info - Modern Tutorial',
              url: 'https://javascript.info',
              provider: 'JavaScript.info'
            },
            {
              type: 'project',
              title: 'JavaScript30 - 30 Day Challenge',
              url: 'https://javascript30.com/',
              provider: 'JavaScript30'
            }
          ]
        },
        'typescript': {
          importance: 'high',
          resources: [
            {
              type: 'documentation',
              title: 'TypeScript Handbook',
              url: 'https://www.typescriptlang.org/docs/',
              provider: 'TypeScript'
            },
            {
              type: 'course',
              title: 'TypeScript Deep Dive',
              url: 'https://basarat.gitbook.io/typescript/',
              provider: 'GitBook'
            },
            {
              type: 'video',
              title: 'TypeScript Tutorial for Beginners',
              url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
              provider: 'Academind'
            }
          ]
        },
        'css': {
          importance: 'high',
          resources: [
            {
              type: 'documentation',
              title: 'CSS Tricks Guides',
              url: 'https://css-tricks.com/guides/',
              provider: 'CSS-Tricks'
            },
            {
              type: 'course',
              title: 'CSS Grid & Flexbox',
              url: 'https://cssgrid.io/',
              provider: 'Wes Bos'
            },
            {
              type: 'documentation',
              title: 'MDN CSS Guide',
              url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
              provider: 'MDN'
            }
          ]
        },
        'responsive': {
          importance: 'high',
          resources: [
            {
              type: 'documentation',
              title: 'Responsive Web Design Fundamentals',
              url: 'https://web.dev/responsive-web-design-basics/',
              provider: 'web.dev'
            },
            {
              type: 'course',
              title: 'Conquering Responsive Layouts',
              url: 'https://courses.kevinpowell.co/conquering-responsive-layouts',
              provider: 'Kevin Powell'
            },
            {
              type: 'video',
              title: 'Responsive Design Made Easy',
              url: 'https://www.youtube.com/watch?v=VQraviuwbzU',
              provider: 'Kevin Powell'
            }
          ]
        }
      };

      // If we have specific resources for this skill, use them
      if (skillMap[keyword.toLowerCase()]) {
        return {
          skill: keyword,
          ...skillMap[keyword.toLowerCase()]
        };
      }

      // For unknown skills, generate smart defaults based on the skill name
      const platforms = {
        docs: {
          url: 'https://www.google.com/search?q=' + encodeURIComponent(keyword + ' documentation'),
          title: `${keyword} Documentation`,
          provider: 'Documentation'
        },
        youtube: {
          url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(keyword + ' tutorial'),
          title: `${keyword} Video Tutorials`,
          provider: 'YouTube'
        },
        github: {
          url: 'https://github.com/search?q=' + encodeURIComponent(keyword + ' awesome list'),
          title: `${keyword} Learning Resources`,
          provider: 'GitHub'
        }
      };

      return {
        skill: keyword,
        importance: 'medium',
        resources: [
          {
            type: 'documentation',
            ...platforms.docs
          },
          {
            type: 'video',
            ...platforms.youtube
          },
          {
            type: 'project',
            ...platforms.github
          }
        ]
      };
    };

    return missingKeywords.slice(0, 6).map(kw => getSkillSpecificResources(kw));
  }
}

export default function ResumeAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData>(defaultAnalysisData);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setShowResults(false);

      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append('resume', uploadedFile);
      } else if (resumeText) {
        formData.append('text', resumeText);
      }

      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';
      const endpoint = jobDescription
        ? `${API_BASE}/api/resume/analyze-with-jd`
        : `${API_BASE}/api/resume/analyze`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      
      // Update the UI with real analysis data
      if (data.success) {
        setShowResults(true);
        // Map the API response to our UI structure
        const analysisResults = jobDescription ? mapJDAnalysis(data.analysis) : mapBasicAnalysis(data.suggestions);

        // Enrich results when backend returns sparse/dummy fields
        if ((!analysisResults.suggestedBullets || analysisResults.suggestedBullets.length === 0)) {
          analysisResults.suggestedBullets = generateSuggestedBullets(
            analysisResults.missingKeywords || [],
            analysisResults.improvements || [],
            // pass a role hint from the jobDescription when available
            (jobDescription && jobDescription.split('\n')[0]) || ''
          );
        }

        // If no skill gaps provided, request them from the backend
        if ((!analysisResults.skillGaps || analysisResults.skillGaps.length === 0) && 
            (analysisResults.missingKeywords || []).length > 0) {
          // Set initial data while skill gaps load
          setAnalysisData(analysisResults);
          
          // Fetch skill gaps asynchronously
          generateSkillGaps(analysisResults.missingKeywords || [], jobDescription || '')
            .then(skillGaps => {
              setAnalysisData(prev => ({
                ...prev,
                skillGaps
              }));
            })
            .catch(error => {
              console.error('Failed to get skill gaps:', error);
              // Keep existing analysis data on error
            });
        } else {
          setAnalysisData(analysisResults);
        }
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Show error in UI
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      // Send file to backend to parse text and return parsed resume
      (async () => {
        try {
          const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';
          const parseUrl = `${API_BASE}/api/resume/parse`;
          const fd = new FormData();
          fd.append('resume', file);

          console.log('Uploading to:', parseUrl);
          console.log('File being uploaded:', file.name, file.type, file.size);

          const resp = await fetch(parseUrl, { 
            method: 'POST',
            body: fd,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!resp.ok) {
            let errBody = null;
            try { 
              errBody = await resp.json(); 
            } catch (e) { 
              errBody = await resp.text(); 
            }
            console.error('Server responded with error:', {
              status: resp.status,
              statusText: resp.statusText,
              headers: Object.fromEntries(resp.headers.entries()),
              body: errBody
            });
            throw new Error(`Server error: ${resp.status} ${resp.statusText}`);
          }

          const json = await resp.json();
          if (json?.success && json.resumeText) {
            setResumeText(json.resumeText);
          }
        } catch (err) {
          console.error('Error parsing uploaded file:', err);
        }
      })();
    }
  };

  const handleJobUrlExtract = () => {
    if (jobUrl) {
      // If URL or hint contains frontend-related words, produce a frontend-focused JD mock
      const urlLower = jobUrl.toLowerCase();
      const frontendHints = ['frontend', 'front-end', 'react', 'angular', 'vue', 'javascript', 'typescript'];
      const isFrontend = frontendHints.some((h) => urlLower.includes(h));

      if (isFrontend) {
        const mockJD = `We are looking for a Frontend Developer to join our product engineering team.\n\nResponsibilities:\n• Build responsive, accessible user interfaces using React/TypeScript\n• Optimize performance and bundle size for faster load times\n• Implement component-driven design with testing (Jest/RTL)\n• Collaborate with design and backend teams to ship features\n\nRequirements:\n• Strong knowledge of JavaScript/TypeScript, HTML5, CSS3\n• Experience with React, state management and component libraries\n• Familiarity with build tools (Vite, Webpack) and performance profiling\n• Understanding of responsive design and cross-browser compatibility\n\nNice to have:\n• Experience with accessibility (a11y) best practices\n• Knowledge of CI/CD and automated testing\n• Experience with GraphQL and modern REST APIs`;
        setJobDescription(mockJD);
      } else {
        // Generic Software Engineer JD without ML bias
        const mockJD = `We are looking for a Senior Software Engineer to join our team.\n\nRequirements:\n• 5+ years of software development experience\n• Strong knowledge of JavaScript and modern frameworks\n• Experience with cloud platforms and containerization\n• System design and architecture experience\n• Experience with microservices and REST APIs\n\nNice to have:\n• Experience with GraphQL\n• Caching strategies\n• Agile/Scrum methodology`;
        setJobDescription(mockJD);
      }
    }
  };

// Generate a printable HTML report and open print dialog (user can save as PDF)
const downloadReport = (data: any) => {
  try {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111 }
            h1,h2,h3 { color: #0f172a }
            .badge { display:inline-block; padding:6px 8px; margin:4px; border-radius:6px; background:#f3f4f6 }
            .section { margin-bottom:18px }
            .muted { color:#6b7280 }
          </style>
        </head>
        <body>
          <h1>Resume Analysis Report</h1>
          <p class="muted">Match Score: ${data.score}% — ATS Score: ${data.atsScore}%</p>
          <div class="section">
            <h2>Strengths</h2>
            <ul>${(data.strengths || []).map((s:any)=>`<li>${typeof s==='string'?s:(s.keyword?`<strong>${s.keyword}</strong> — ${s.snippet||''}`:JSON.stringify(s))}</li>`).join('')}</ul>
          </div>
          <div class="section">
            <h2>Areas for Improvement</h2>
            <ul>${(data.improvements || []).map((i:any)=>`<li>${i}</li>`).join('')}</ul>
          </div>
          <div class="section">
            <h2>Missing Keywords</h2>
            ${(data.missingKeywords||[]).map((k:any)=>`<span class="badge">${k}</span>`).join('')}
          </div>
          <div class="section">
            <h2>Suggested Bullet Points</h2>
            <ul>${(data.suggestedBullets || []).map((b:string)=>`<li>${b}</li>`).join('')}</ul>
          </div>
          <div class="section">
            <h2>Skill Gaps & Resources</h2>
            ${(data.skillGaps||[]).map((sg:any)=>`<h4>${sg.skill} — ${sg.importance}</h4><ul>${(sg.resources||[]).map((r:any)=>`<li>${r.title} (${r.provider}) - ${r.url}</li>`).join('')}</ul>`).join('')}
          </div>
        </body>
      </html>`;
    win.document.write(html);
    win.document.close();
    // Give browser a moment to render then open print
    setTimeout(() => { win.print(); }, 500);
  } catch (err) {
    console.error('Download report failed', err);
  }
};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen gradient-hero p-4 mx-auto max-w-7xl"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl font-bold mb-2"
        >
          AI Resume Analysis
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-muted-foreground"
        >
          Upload your resume and job description to get AI-powered optimization recommendations
        </motion.p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="p-6 gradient-card border-0 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Upload Documents</h2>
            
            {/* Resume Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Resume Content</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {uploadedFile ? `Uploaded: ${uploadedFile.name}` : "Upload PDF/DOC or paste text below"}
                </p>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={triggerFileSelect}>
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Or paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="mt-3 min-h-32"
              />
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Job Description</Label>
              
              {/* Job URL Input */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Job URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://company.com/jobs/software-engineer"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleJobUrlExtract}
                    disabled={!jobUrl}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Extract
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Or paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!uploadedFile && !resumeText)}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {showResults ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Match Score</h3>
                  <div className="text-2xl font-bold text-primary">{analysisData.score}%</div>
                </div>
                <Progress value={analysisData.score} className="mb-3" />
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">ATS Score</span>
                  <span className="text-sm font-bold text-secondary">{analysisData.atsScore}%</span>
                </div>
                <Progress value={analysisData.atsScore} className="mb-3" />
                
                <p className="text-sm text-muted-foreground">
                  Good match! Your resume aligns well with the job requirements.
                </p>
              </Card>

              {/* Strengths */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {analysisData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                      {typeof strength === 'string' 
                        ? strength 
                        : (strength.keyword 
                            ? <div>
                                <strong>{strength.keyword}</strong>
                                {strength.snippet && (
                                  <div className="text-muted-foreground mt-1 text-xs">
                                    "{strength.snippet}"
                                  </div>
                                )}
                              </div>
                            : JSON.stringify(strength)
                        )}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Improvements */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {analysisData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Missing Keywords */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-info" />
                  <h3 className="text-lg font-semibold">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisData.missingKeywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Suggested Bullets */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Suggested Bullet Points</h3>
                <div className="space-y-3">
                  {analysisData.suggestedBullets.map((bullet, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm flex-1">{bullet}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bullet)}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Skill Gaps & Resources */}
              <Card className="p-6 gradient-card border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Skill Gaps & Learning Resources</h3>
                <div className="space-y-6">
                  {analysisData.skillGaps.map((skillGap, index) => (
                    <div key={index} className="p-6 border rounded-lg">
                      {/* Skill Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{skillGap.skill}</h4>
                          {skillGap.context && (
                            <p className="text-sm text-muted-foreground mt-1">{skillGap.context}</p>
                          )}
                        </div>
                        <Badge 
                          variant={skillGap.importance === 'high' ? 'destructive' : 
                                  skillGap.importance === 'medium' ? 'default' : 'secondary'}
                        >
                          {skillGap.importance} priority
                        </Badge>
                      </div>

                      {/* Proficiency Levels */}
                      {(skillGap.currentLevel || skillGap.requiredLevel) && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            {skillGap.currentLevel && (
                              <div>
                                <p className="text-sm font-medium">Current Level</p>
                                <p className="text-sm text-muted-foreground">{skillGap.currentLevel}</p>
                              </div>
                            )}
                            {skillGap.requiredLevel && (
                              <div>
                                <p className="text-sm font-medium">Required Level</p>
                                <p className="text-sm text-muted-foreground">{skillGap.requiredLevel}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Learning Resources */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold mb-2">Recommended Resources</h5>
                        {skillGap.resources.map((resource, resourceIndex) => (
                          <div key={resourceIndex} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {resource.type === 'documentation' && <BookOpen className="w-4 h-4 text-blue-500" />}
                                {resource.type === 'course' && <BookOpen className="w-4 h-4 text-green-500" />}
                                {resource.type === 'video' && <Play className="w-4 h-4 text-red-500" />}
                                {resource.type === 'project' && <FileText className="w-4 h-4 text-purple-500" />}
                                {resource.type === 'practice' && <FileText className="w-4 h-4 text-orange-500" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{resource.title}</p>
                                  <Button variant="ghost" size="sm" asChild className="ml-2">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </div>
                                {resource.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {resource.difficulty || 'all levels'}
                                  </Badge>
                                  {resource.duration && (
                                    <Badge variant="outline" className="text-xs">
                                      {resource.duration}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">{resource.provider}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Practical Steps */}
                      {skillGap.practicalSteps && skillGap.practicalSteps.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold mb-2">Learning Path</h5>
                          <div className="space-y-2">
                            {skillGap.practicalSteps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">{stepIndex + 1}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{step.step}</p>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                  {step.estimatedTime && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Estimated time: {step.estimatedTime}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="gap-2" onClick={() => downloadReport(analysisData)}>
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  Analyze Another
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center gradient-card border-0 shadow-md">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground">
                Upload your resume and job description to get started with AI-powered analysis
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}