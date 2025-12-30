import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Upload,
  FileText,
  ExternalLink,
  Send,
  Copy,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function ColdEmailGeneratorPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [extractedJD, setExtractedJD] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hrName, setHrName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isExtractingJD, setIsExtractingJD] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload and parse resume
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsParsingResume(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE}/api/cold-email/parse-resume`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse resume' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data?.success && data?.resumeText) {
        setResumeText(data.resumeText);
        toast.success("Resume parsed successfully!");
      } else {
        throw new Error("Failed to parse resume");
      }
    } catch (error: any) {
      console.error("Resume parse error:", error);
      toast.error(error?.message || "Failed to parse resume");
      setResumeFile(null);
      setResumeText("");
    } finally {
      setIsParsingResume(false);
    }
  };

  // Extract JD from URL
  const handleExtractJD = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter a job URL");
      return;
    }

    setIsExtractingJD(true);
    try {
      const response = await api.post('/api/cold-email/extract-jd', { url: jobUrl });
      
      if (response.data?.success && response.data?.jobDescription) {
        const jd = response.data.jobDescription;
        setExtractedJD(jd);
        setJobDescription(jd);
        
        // Try to extract company name and HR info if available
        if (response.data?.companyName) setCompanyName(response.data.companyName);
        if (response.data?.hrName) setHrName(response.data.hrName);
        if (response.data?.hrEmail) setHrEmail(response.data.hrEmail);
        
        toast.success("Job description extracted successfully!");
      } else {
        throw new Error("Failed to extract job description");
      }
    } catch (error: any) {
      console.error("JD extraction error:", error);
      toast.error(error?.response?.data?.error || "Failed to extract job description from URL");
      setExtractedJD("");
    } finally {
      setIsExtractingJD(false);
    }
  };

  // Generate cold email
  const handleGenerateEmail = async () => {
    if (!resumeText.trim()) {
      toast.error("Please upload and parse your resume first");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please provide a job description");
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null);

    try {
      const payload: any = {
        resumeText,
        jobDescription,
      };
      
      if (companyName) payload.companyName = companyName;
      if (hrName) payload.hrName = hrName;
      if (hrEmail) payload.hrEmail = hrEmail;

      const response = await api.post('/api/cold-email/generate-email', payload);

      if (response.data?.success && response.data?.email) {
        setGeneratedEmail({
          subject: response.data.email.subject || "Application for Position",
          body: response.data.email.body || response.data.email,
        });
        toast.success("Email generated successfully!");
      } else {
        throw new Error("Failed to generate email");
      }
    } catch (error: any) {
      console.error("Email generation error:", error);
      toast.error(error?.response?.data?.error || "Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  // Send email via backend API with resume attachment
  const handleSendEmail = async () => {
    if (!generatedEmail) {
      toast.error("No email to send");
      return;
    }
    if (!hrEmail.trim()) {
      toast.error("Please provide recruiter email address");
      return;
    }
    if (!resumeFile) {
      toast.error("Please upload your resume first");
      return;
    }

    // Confirm before sending
    const confirmed = window.confirm(
      `Are you sure you want to send this email?\n\n` +
      `Recipient: ${hrEmail}\n` +
      `Subject: ${generatedEmail.subject}\n` +
      `Resume: ${resumeFile.name}\n\n` +
      `Click OK to send.`
    );

    if (!confirmed) {
      return;
    }

    setIsSending(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('to', hrEmail.trim());
      formData.append('subject', generatedEmail.subject);
      formData.append('body', generatedEmail.body);
      formData.append('resume', resumeFile);

      const response = await fetch(`${API_BASE}/api/cold-email/send-email`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data?.success) {
        toast.success("Email sent successfully!");
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Send email error:", error);
      toast.error(error?.message || "Failed to send email. Please check SMTP configuration.");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedEmail) return;
    const fullText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Copied to clipboard!");
  };

  const canGenerate = resumeText.trim().length > 0 && jobDescription.trim().length > 0;
  // Send button is enabled only after email is generated (previewed) and HR email is provided
  const canSend = generatedEmail && hrEmail.trim().length > 0;

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
          Cold Email Generator
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-muted-foreground"
        >
          Upload your resume and job description to generate personalized cold emails
        </motion.p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="p-6 gradient-card border-0 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Upload Documents</h2>

            {/* Resume Upload */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Resume</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {resumeFile ? `Uploaded: ${resumeFile.name}` : "Upload PDF/DOC or paste text below"}
                </p>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingResume}
                  >
                    {isParsingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Resume Text Preview */}
              {resumeText && (
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">Resume Preview</Label>
                  <Textarea
                    value={resumeText}
                    readOnly
                    className="min-h-32 text-sm"
                    placeholder="Parsed resume text will appear here..."
                  />
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Job Description</Label>
              
              {/* JD URL Input */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Job URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://company.com/jobs/software-engineer"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="flex-1"
                    disabled={isExtractingJD}
                  />
                  <Button
                    variant="outline"
                    onClick={handleExtractJD}
                    disabled={!jobUrl.trim() || isExtractingJD}
                    className="gap-2"
                  >
                    {isExtractingJD ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    Extract
                  </Button>
                </div>
              </div>

              {/* Extracted JD Preview */}
              {extractedJD && (
                <div className="mb-4 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">JD Extracted</span>
                  </div>
                  <Textarea
                    value={extractedJD}
                    readOnly
                    className="min-h-24 text-sm"
                  />
                </div>
              )}

              {/* JD Textarea */}
              <Textarea
                placeholder="Or paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-32"
              />
            </div>

            {/* Optional Fields */}
            <div className="mb-6 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Company Name (Optional)</Label>
                <Input
                  placeholder="e.g., Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Recruiter Name (Optional)</Label>
                  <Input
                    placeholder="e.g., Sarah Johnson"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Recruiter Email (Required for sending)</Label>
                  <Input
                    type="email"
                    placeholder="e.g., sarah@company.com"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateEmail}
              disabled={!canGenerate || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Generate Cold Email
                </>
              )}
            </Button>
          </Card>
        </motion.div>

        {/* Right: Result Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {generatedEmail ? (
            <Card className="p-6 gradient-card border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Generated Email</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Subject</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{generatedEmail.subject}</p>
                  </div>
                </div>

                {/* Body */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Email Body</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {generatedEmail.body}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Send Email Button - Only enabled after preview */}
              <div className="mt-6">
                <Button
                  onClick={handleSendEmail}
                  disabled={!canSend || isSending}
                  className="w-full gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email to Recruiter
                    </>
                  )}
                </Button>
                {!hrEmail.trim() && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Please enter recruiter email above to send
                  </p>
                )}
                {generatedEmail && hrEmail.trim() && !isSending && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Make sure SMTP is configured in backend .env file
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center gradient-card border-0 shadow-md">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground">
                Upload your resume and job description to generate a personalized cold email
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

