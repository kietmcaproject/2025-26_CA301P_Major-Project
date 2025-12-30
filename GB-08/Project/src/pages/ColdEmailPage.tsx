import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Copy,
  Send,
  RefreshCw,
  Save,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users,
  ExternalLink,
  Upload,
  FileText
} from "lucide-react";
import { coldEmailTemplates, generateColdEmail } from "@/data/dummyData";

// Use imported templates

// Will use dynamic generation

export function ColdEmailPage() {
  const [formData, setFormData] = useState({
    recruiterName: "",
    recruiterEmail: "",
    company: "",
    role: "",
    tone: "professional",
    customMessage: "",
    jobUrl: "",
    resumeFile: null as File | null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const emailData = generateColdEmail(formData);
      setGeneratedEmail(emailData);
      setIsGenerating(false);
      setShowResult(true);
    }, 2000);
  };

  const handleJobUrlExtract = () => {
    if (formData.jobUrl) {
      // Simulate HR email extraction
      const domain = formData.jobUrl.split('/')[2]?.replace('www.', '');
      const hrEmail = `hr@${domain}`;
      setFormData(prev => ({ 
        ...prev, 
        recruiterEmail: hrEmail,
        company: domain?.split('.')[0] || ''
      }));
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resumeFile: file }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
          Craft personalized, professional emails to recruiters with AI assistance
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid gap-6 md:grid-cols-3 mb-8"
      >
        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">Emails Generated</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">23%</div>
              <div className="text-sm text-muted-foreground">Avg Response Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Connections Made</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-6 gradient-card border-0 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Email Details</h2>
            
              <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Upload Resume</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {formData.resumeFile ? `Uploaded: ${formData.resumeFile.name}` : "Upload your resume for better personalization"}
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Job URL */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Job URL (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://company.com/jobs/software-engineer"
                    value={formData.jobUrl}
                    onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleJobUrlExtract}
                    disabled={!formData.jobUrl}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Extract HR
                  </Button>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Choose Template</Label>
                <div className="grid gap-3">
                  {coldEmailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.name 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.subject}</div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={template.performance === 'High' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {template.responseRate}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="recruiterName">Recruiter Name</Label>
                  <Input
                    id="recruiterName"
                    placeholder="Sarah Johnson"
                    value={formData.recruiterName}
                    onChange={(e) => handleInputChange('recruiterName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="recruiterEmail">Recruiter Email</Label>
                  <Input
                    id="recruiterEmail"
                    type="email"
                    placeholder="sarah@company.com"
                    value={formData.recruiterEmail}
                    onChange={(e) => handleInputChange('recruiterEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Google"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Target Role</Label>
                  <Input
                    id="role"
                    placeholder="Software Engineer"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tone">Email Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customMessage">Additional Information (Optional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Any specific achievements or details you want to highlight..."
                  value={formData.customMessage}
                  onChange={(e) => handleInputChange('customMessage', e.target.value)}
                  className="min-h-20"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!formData.recruiterName || !formData.company || isGenerating}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Generated Email */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {showResult ? (
            <Card className="p-6 gradient-card border-0 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Generated Email</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${generatedEmail?.subject}\n\n${generatedEmail?.body}`)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{generatedEmail?.subject}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Email Body</Label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {generatedEmail?.body}
                    </pre>
                  </div>
                </div>

                {generatedEmail?.hrEmail && (
                  <div>
                    <Label className="text-sm font-medium">Extracted HR Email</Label>
                    <div className="mt-1 p-3 bg-success/5 border border-success/20 rounded-lg">
                      <p className="text-sm font-medium text-success">{generatedEmail.hrEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Email
                </Button>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Template
                </Button>
              </div>

              <div className="mt-6 p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Email Quality Score: {generatedEmail?.qualityScore}%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Excellent personalization and professional tone. High probability of response.
                </p>
                
                {generatedEmail?.personalizedElements && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Personalized Elements:</h4>
                    <ul className="space-y-1">
                      {generatedEmail.personalizedElements.map((element: string, index: number) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-success rounded-full" />
                          {element}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedEmail?.improvements && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Suggestions for Improvement:</h4>
                    <ul className="space-y-1">
                      {generatedEmail.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-amber-500 rounded-full" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center gradient-card border-0 shadow-md">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground">
                Fill in the details to generate a personalized cold email
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}