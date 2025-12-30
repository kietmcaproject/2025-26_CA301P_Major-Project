import { useState } from 'react';
import axios from 'axios';
import {
  Card,
  Button,
  Textarea,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui';
import { Loader2 } from 'lucide-react';

const ResumeAnalysis = () => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResumeText('');
      setError('');
      // Send file to backend to parse and get resume text
      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        const response = await axios.post('/api/resume/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        });
        console.log('Parsed resume response:', response.data);
        if (response.data.success) {
          // Format the parsed text for better readability in the textarea
          const raw = response.data.resumeText || '';
          console.log('Parsed (raw) length:', raw.length);
          // Simple formatting helper
          const formatParsedText = (s) => {
            if (!s) return '';
            // normalize NBSP
            let t = s.replace(/\u00A0/g, ' ');
            // collapse multiple spaces/tabs into single space
            t = t.replace(/[ \t]{2,}/g, ' ');
            // normalize CRLF and surrounding whitespace
            t = t.replace(/\r\n|\r/g, '\n');
            t = t.replace(/\s*\n\s*/g, '\n');
            // trim lines and remove excessive empty lines
            t = t.split('\n').map(l => l.trim()).filter((l, i, arr) => !(l === '' && arr[i-1] === '')).join('\n');
            return t;
          };

          const formatted = formatParsedText(raw);
          console.log('Parsed (formatted) length:', formatted.length);
          console.log('Parsed (formatted) sample:', formatted.substring(0, 300));
          setResumeText(formatted);
          // Also log basic info (email/phone) if provided
          console.log('Parsed basicInfo:', response.data.basicInfo || {});
        } else {
          setError(response.data.error || 'Failed to parse resume file');
        }
      } catch (err) {
        console.error('Resume parse error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to parse resume file');
      }
    } else {
      setError('Please upload a PDF file');
    }
  };

  const analyzeResume = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }
      if (resumeText) {
        formData.append('text', resumeText);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      const endpoint = jobDescription 
        ? '/api/resume/analyze-with-jd'
        : '/api/resume/analyze';

      // Add text content to formData if no file is provided
      if (!file && resumeText) {
        formData.append('text', resumeText);
      }
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      });

      const result = response.data.success ? 
        response.data.analysis || response.data.suggestions : 
        null;

      if (!result) {
        throw new Error('Failed to get analysis results');
      }

      try {
        // Try to parse as JSON first
        const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
        console.log('Raw backend analysis:', parsedResult);
        setAnalysis({
          ats_score: parsedResult.atsScore ?? parsedResult.ats_score ?? parsedResult.ats ?? parsedResult.atsScorePercent ?? 0,
          match_score: parsedResult.matchScore ?? parsedResult.match_score ?? parsedResult.overall_score ?? 0,
          strengths: parsedResult.strengths ?? parsedResult.matchedKeywords ?? parsedResult.keywordsMatched ?? parsedResult.keywords ?? [],
          areas_for_improvement: parsedResult.areas_for_improvement ?? parsedResult.improvementBullets ?? parsedResult.improvement_bullets ?? parsedResult.suggestions ?? [],
          missing_keywords: parsedResult.missingKeywords ?? parsedResult.missing_keywords ?? parsedResult.keywordsMissing ?? [],
          suggested_bullets: parsedResult.suggestedBullets ?? parsedResult.suggested_bullets ?? parsedResult.bulletSuggestions ?? [],
          skill_gaps: parsedResult.skillGaps ?? parsedResult.skill_gaps ?? [],
          learning_resources: parsedResult.learningResources ?? parsedResult.learning_resources ?? [],
          rewrite_suggestions: parsedResult.rewriteSuggestions ?? parsedResult.rewrite_suggestions ?? [],
          final_verdict: parsedResult.finalVerdict ?? parsedResult.final_verdict ?? '',
          score_explanation: parsedResult.scoreExplanation ?? parsedResult.score_explanation ?? '',
          _raw: parsedResult // for debugging
        });
      } catch (e) {
        // If parsing fails, use as-is (it might be a plain string)
        setAnalysis({
          ats_score: 65,
          match_score: 70,
          strengths: result.split('\n').filter(line => line.includes('Strength')),
          areas_for_improvement: result.split('\n').filter(line => line.includes('Improve')),
          missing_keywords: result.split('\n').filter(line => line.includes('Missing')),
          suggested_bullets: result.split('\n').filter(line => line.startsWith('•')),
          skill_gaps: [],
          _raw: result
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Resume Analysis Tool</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload Resume</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">Or paste resume text below:</p>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="mt-2"
              rows={6}
              // Always enabled so user can see and edit parsed text
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Job Description (Optional)</h2>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for ATS analysis..."
              className="mt-2"
              rows={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={analyzeResume}
            disabled={loading || (!file && !resumeText)}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>

          {analysis && (
            <div className="space-y-6">
              {/* Debug: Show raw backend analysis JSON */}
              <details className="bg-gray-50 p-2 rounded border border-gray-200 text-xs">
                <summary className="cursor-pointer">Show Raw Backend Analysis JSON</summary>
                <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(analysis._raw, null, 2)}</pre>
              </details>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Match Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {analysis.match_score || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">ATS Score</span>
                    <span className="text-2xl font-bold text-secondary">
                      {analysis.ats_score || 0}%
                    </span>
                  </div>
                </div>
                {analysis.score_explanation && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Score Explanation:</strong> {analysis.score_explanation}
                  </div>
                )}
                {analysis.final_verdict && (
                  <div className="mt-4 text-base text-gray-700 font-medium">
                    {analysis.final_verdict}
                  </div>
                )}
                {/* UI note if score is low but resume is strong */}
                {(analysis.ats_score < 70 || analysis.match_score < 70) && (
                  <div className="mt-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
                    <strong>Note:</strong> If your resume contains strong achievements (patents, research, projects) but the score is low, review the missing keywords and suggestions below. Some advanced content may not be fully recognized by automated scoring.
                  </div>
                )}
              </Card>

              {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Strengths / Matched Keywords</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-500">✓</span>
                        {typeof strength === 'string' ? strength : JSON.stringify(strength)}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {Array.isArray(analysis.areas_for_improvement) && analysis.areas_for_improvement.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {analysis.areas_for_improvement.map((improvement, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-yellow-500">!</span>
                        {typeof improvement === 'string' ? improvement : JSON.stringify(improvement)}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {Array.isArray(analysis.missing_keywords) && analysis.missing_keywords.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords.map((keyword, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {typeof keyword === 'string' ? keyword : JSON.stringify(keyword)}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {Array.isArray(analysis.suggested_bullets) && analysis.suggested_bullets.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Suggested Bullet Points</h4>
                  <ul className="space-y-2">
                    {analysis.suggested_bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        {typeof bullet === 'string' ? bullet : JSON.stringify(bullet)}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {Array.isArray(analysis.skill_gaps) && analysis.skill_gaps.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Skill Gaps & Resources</h4>
                  <div className="space-y-4">
                    {analysis.skill_gaps.map((gap, i) => (
                      <div key={i} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{gap.skill}</h5>
                          <span className={`text-sm px-2 py-1 rounded ${
                            gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                            gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {gap.priority || gap.importance} priority
                          </span>
                        </div>
                        {Array.isArray(gap.resources) && gap.resources.length > 0 && (
                          <ul className="space-y-2">
                            {gap.resources.map((resource, j) => (
                              <li key={j} className="text-sm">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {resource.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {Array.isArray(analysis.rewrite_suggestions) && analysis.rewrite_suggestions.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Rewrite Suggestions</h4>
                  <ul className="space-y-2">
                    {analysis.rewrite_suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-purple-500">→</span>
                        {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {Array.isArray(analysis.learning_resources) && analysis.learning_resources.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold mb-3">Learning Resources</h4>
                  <ul className="space-y-2">
                    {analysis.learning_resources.map((lr, i) => (
                      <li key={i} className="flex flex-col gap-1">
                        <span className="font-medium">{lr.skill} ({lr.priority})</span>
                        {Array.isArray(lr.resources) && lr.resources.map((res, j) => (
                          <a key={j} href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            {res.title}
                          </a>
                        ))}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResumeAnalysis;