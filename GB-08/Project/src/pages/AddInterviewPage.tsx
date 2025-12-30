import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Briefcase, 
  Calendar as CalendarIcon, 
  MapPin, 
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { createInterview, submitInterview as apiSubmitInterview } from "@/api/interviews";
import { createRound as apiCreateRound } from "@/api/rounds";
import { createQuestion as apiCreateQuestion } from "@/api/questions";
import { cn } from "@/lib/utils";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

type Question = {
  id: string;
  question: string;
  topics: string;
  difficulty: string;
  answer: string;
  feedback: string;
  isPublic: boolean;
};

type Round = {
  id: string;
  name: string;
  type: string;
  status: string;
  date?: Date;
  interviewer: string;
  confidence: number;
  feedback: string;
  isSaved: boolean;
  questions: Question[];
};

type InterviewData = {
  id?: string;
  company: string;
  role: string;
  date?: Date;
  location: string;
  status: string;
  salary: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  feedback: string;
  nextSteps: string;
  isSaved: boolean;
};

export default function AddInterviewPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  // validation errors (flat map) for interview/rounds/questions
  const { errors: fieldErrors, setFieldError, getError, clearError, applyServerErrors, clearAll } = useFieldErrors();
  
  // Interview Details State
  const [interview, setInterview] = useState<InterviewData>({
    company: "",
    role: "",
    location: "",
    status: "",
    salary: "",
    hrName: "",
    hrEmail: "",
    hrPhone: "",
    feedback: "",
    nextSteps: "",
    isSaved: false,
  });

  const [rounds, setRounds] = useState<Round[]>([]);
  const [expandedRound, setExpandedRound] = useState<string>("");
  
  // ✅ Safety guard: Ensure rounds is never undefined or null
  const safeRounds = Array.isArray(rounds) ? rounds : [];

  // Calculate progress
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Update interview field
  const updateInterview = (field: keyof InterviewData, value: any) => {
    setInterview(prev => ({ ...prev, [field]: value }));
  };

  // Save Interview (Step 1)
  const saveInterviewDetails = async () => {
  const newErrors: Record<string, string> = {};
    if (!interview.company) newErrors.company = "Company is required";
    if (!interview.role) newErrors.role = "Role is required";
    // validate phone if provided: expect 10 digits
    if (interview.hrPhone) {
      const digits = interview.hrPhone.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.hrPhone = "Phone number must be 10 digits";
      }
    }
    // validate email if provided
    if (interview.hrEmail) {
      const emailRe = /^\S+@\S+\.\S+$/;
      if (!emailRe.test(interview.hrEmail)) {
        newErrors.hrEmail = "Enter a valid email address";
      }
    }
    if (Object.keys(newErrors).length) {
      // set each discovered field error
      Object.keys(newErrors).forEach((k) => setFieldError(k, (newErrors as any)[k]));
      // scroll to top of card or focus first invalid field could be added
      return;
    }
    // clear interview-level errors
    ['company', 'role', 'hrPhone', 'hrEmail'].forEach((k) => clearError(k));

    setIsSaving(true);
    try {
      const payload = {
        company: interview.company,
        role: interview.role,
        date: interview.date ? interview.date.toISOString() : undefined,
        location: interview.location,
        status: interview.status || 'draft',
        salary: interview.salary,
        hr: { name: interview.hrName, email: interview.hrEmail, phone: interview.hrPhone },
        feedback: interview.feedback,
        nextSteps: interview.nextSteps,
      };

      const res = await createInterview(payload);
      const created = res.data.interview;
      setInterview(prev => ({ ...prev, id: created._id, isSaved: true }));
      setCurrentStep(2);
      toast({ title: "✅ Interview Saved!", description: "Now add rounds to this interview." });
    } catch (error) {
      const resp = (error as any)?.response;
      if (resp?.data?.errors && typeof resp.data.errors === 'object') {
        // Map server validation errors into our flat fieldErrors map
        const serverErrors: any = resp.data.errors;
        // applyServerErrors will flatten nested objects and normalize hr.email -> hrEmail
        applyServerErrors(serverErrors);
      } else {
        const msg = resp?.data?.message || (error as any)?.message || 'Failed to save interview';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Add Round (Step 2)
  const addRound = () => {
    console.log('addRound called, current rounds:', rounds);
    
    // ✅ Ensure rounds is always an array
    const currentRounds = Array.isArray(rounds) ? rounds : [];
    
    const newRound: Round = {
      id: `round_${Date.now()}`,
      name: "",
      type: "",
      status: "draft", // ✅ Set default status
      interviewer: "",
      confidence: 50,
      feedback: "",
      isSaved: false,
      questions: [],
    };
    
    console.log('Creating new round:', newRound);
    const updatedRounds = [...currentRounds, newRound];
    console.log('Updated rounds array:', updatedRounds);
    
    setRounds(updatedRounds);
    setExpandedRound(newRound.id);
    
    console.log('Round added successfully, new count:', updatedRounds.length);
  };

  // Update Round
  const updateRound = (roundId: string, field: keyof Round, value: any) => {
    setRounds(rounds.map(r => 
      r.id === roundId ? { ...r, [field]: value } : r
    ));
  };

  // Save Round
  const saveRound = async (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    // validate round client-side
    if (!round?.name) setFieldError(`rounds.${roundId}.name`, "Round name is required");
    if (!round?.type) setFieldError(`rounds.${roundId}.type`, "Round type is required");
    if (!round?.name || !round?.type) return;
    // clear previous round errors
    clearError(`rounds.${roundId}.name`);
    clearError(`rounds.${roundId}.type`);

    setIsSaving(true);
    try {
      if (!interview.id) throw new Error('Interview ID missing. Save interview first.');
      const round = rounds.find(r => r.id === roundId)!;
      const payload = {
        roundName: round.name,
        roundNumber: rounds.indexOf(round) + 1,
        interviewerName: round.interviewer,
        date: round.date ? round.date.toISOString() : undefined,
        duration: undefined,
        feedback: round.feedback || "", // ✅ CRITICAL FIX: Include feedback in payload
      };

      console.log('SUBMIT ROUNDS PAYLOAD:', payload);
      console.log('Round feedback being saved:', round.feedback);

      const res = await apiCreateRound(interview.id!, payload);
      const created = res.data.round;
      setRounds(rounds.map(r => r.id === roundId ? { ...r, id: created._id, isSaved: true } : r));
      toast({ title: 'Round Saved!', description: 'You can now add questions to this round.' });
    } catch (error) {
      const resp = (error as any)?.response;
      if (resp?.data?.errors && typeof resp.data.errors === 'object') {
        // server returns errors like { name: '...' } or { type: '...' }
        const srv = resp.data.errors;
        Object.keys(srv).forEach((k) => {
          // normalize server error entry to string (may be object like { message })
          const val = srv[k];
          const msg = val && typeof val === 'object' ? (val.message || String(val)) : String(val);
          setFieldError(`rounds.${roundId}.${k}`, msg);
        });
      } else {
        const msg = resp?.data?.message || (error as any)?.message || 'Failed to save round';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Round
  const deleteRound = (roundId: string) => {
    setRounds(rounds.filter(r => r.id !== roundId));
    toast({
      title: "Round Deleted",
      description: "The round has been removed.",
    });
  };

  // Add Question (Step 3)
  const addQuestion = (roundId: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      question: "",
      topics: "",
      difficulty: "",
      answer: "",
      feedback: "",
      isPublic: false,
    };
    
    setRounds(rounds.map(r => {
      if (r.id === roundId) {
        return { ...r, questions: [...r.questions, newQuestion] };
      }
      return r;
    }));
  };

  // Update Question
  const updateQuestion = (roundId: string, questionId: string, field: keyof Question, value: any) => {
    setRounds(rounds.map(r => {
      if (r.id === roundId) {
        return {
          ...r,
          questions: r.questions.map(q => 
            q.id === questionId ? { ...q, [field]: value } : q
          )
        };
      }
      return r;
    }));
  };

  // Delete Question
  const deleteQuestion = (roundId: string, questionId: string) => {
    setRounds(rounds.map(r => {
      if (r.id === roundId) {
        return {
          ...r,
          questions: r.questions.filter(q => q.id !== questionId)
        };
      }
      return r;
    }));
  };

  // Save Question
  const saveQuestion = async (roundId: string, questionId: string) => {
    const round = rounds.find(r => r.id === roundId);
    const question = round?.questions.find(q => q.id === questionId);
    const qKey = `questions.${roundId}.${questionId}`;
    
    // Validate round is saved first (must have MongoDB _id, not temporary ID)
    if (!round?.isSaved || roundId.startsWith('round_')) {
      toast({ 
        title: 'Error', 
        description: 'Please save the round first before adding questions.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!question?.question) {
      setFieldError(qKey, 'Question text is required');
      return;
    }
    clearError(qKey);

    setIsSaving(true);
    try {
      const round = rounds.find(r => r.id === roundId)!;
      const question = round.questions.find(q => q.id === questionId)!;
      
      // Ensure roundId is the MongoDB _id (not temporary ID)
      if (!roundId || roundId.startsWith('round_')) {
        throw new Error('Round must be saved before adding questions');
      }
      
      const payload = {
        roundId: roundId, // This should be the MongoDB _id after round is saved
        questionText: question.question,
        topics: question.topics, // Will be normalized to array in backend
        difficulty: question.difficulty,
        userAnswer: question.answer,
        feedback: question.feedback,
        isPublic: question.isPublic,
      };
      
      console.log('Saving question with payload:', payload);

      const res = await apiCreateQuestion(payload);
      const created = res.data.question;
      // update question id and keep saved state if desired
      setRounds(rounds.map(r => {
        if (r.id === roundId) {
          return {
            ...r,
            questions: r.questions.map(q => q.id === questionId ? { ...q, id: created._id } : q)
          };
        }
        return r;
      }));

      // clear any question error on success
      clearError(qKey);
      toast({ title: 'Question Saved!', description: 'Your question has been added successfully.' });
    } catch (error) {
      const resp = (error as any)?.response;
      if (resp?.data?.errors && typeof resp.data.errors === 'object') {
        // server typically returns { question: '...' } for question text
        const key = `questions.${roundId}.${questionId}`;
  let message: any = resp.data.errors.question || resp.data.errors.questionText || resp.data.errors.message || Object.values(resp.data.errors)[0];
  // ensure we set a string message (server may return validation objects)
  if (message && typeof message === 'object') message = message.message || JSON.stringify(message);
  setFieldError(key, String(message));
      } else {
        const msg = resp?.data?.message || (error as any)?.message || 'Failed to save question';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Final Interview
  const submitInterview = async () => {
    if (!interview.id) {
      toast({ title: 'Error', description: 'Interview ID missing', variant: 'destructive' });
      return;
    }

    // ✅ Log final submit payload
    const submitPayload = {
      interviewId: interview.id,
      rounds: rounds.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status || (r.date || r.interviewer ? 'completed' : 'pending'),
        questionsCount: r.questions.length,
        questions: r.questions.map(q => ({
          questionText: q.question,
          topics: q.topics,
          difficulty: q.difficulty,
          answer: q.answer,
          feedback: q.feedback,
          isPublic: q.isPublic
        }))
      }))
    };
    
    console.log('FINAL SUBMIT PAYLOAD:', submitPayload);
    console.log('Total rounds:', rounds.length);
    console.log('Total questions:', rounds.reduce((sum, r) => sum + r.questions.length, 0));

    setIsSaving(true);
    try {
      const response = await apiSubmitInterview(interview.id);
      console.log('Submit response:', response.data);
      
      toast({ title: 'Interview Submitted!', description: 'Your interview has been marked as completed.' });
      // Redirect to interviews page after successful submit
      setTimeout(() => {
        navigate('/track-interviews');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      const msg = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to submit interview';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Add Interview Experience
          </h1>
          <p className="text-muted-foreground">
            Record your interview details, rounds, and questions step by step.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {interview.isSaved ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span className="text-sm font-medium">Interview Details</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {rounds.some(r => r.isSaved) ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                  <span className="text-sm font-medium">Add Rounds</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    3
                  </div>
                  <span className="text-sm font-medium">Review & Submit</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

  <AnimatePresence>
          {/* Step 1: Interview Details */}
          {currentStep >= 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className={cn(
                "transition-all",
                interview.isSaved && "border-success bg-success/5"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Step 1: Interview Details
                      </CardTitle>
                      <CardDescription>
                        Enter basic information about the interview
                      </CardDescription>
                    </div>
                    {interview.isSaved && (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Company Name *
                      </label>
                      <Input
                        placeholder="e.g., Google"
                        value={interview.company}
                        onChange={(e) => {
                          updateInterview("company", e.target.value);
                          if (getError('company')) clearError('company');
                        }}
                        disabled={interview.isSaved}
                        hasError={!!getError('company')}
                        className=""
                      />
                      {getError('company') && <p className="text-sm text-red-600 mt-1">{getError('company')}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Role / Position *
                      </label>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        value={interview.role}
                        onChange={(e) => {
                          updateInterview("role", e.target.value);
                          if (getError('role')) clearError('role');
                        }}
                        disabled={interview.isSaved}
                        hasError={!!getError('role')}
                        className=""
                      />
                      {getError('role') && <p className="text-sm text-red-600 mt-1">{getError('role')}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !interview.date && "text-muted-foreground"
                            )}
                            disabled={interview.isSaved}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {interview.date ? format(interview.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={interview.date}
                            onSelect={(date) => updateInterview("date", date)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Location
                      </label>
                      <Input
                        placeholder="e.g., San Francisco, CA"
                        value={interview.location}
                        onChange={(e) => updateInterview("location", e.target.value)}
                        disabled={interview.isSaved}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={interview.status} 
                        onValueChange={(v) => updateInterview("status", v)}
                        disabled={interview.isSaved}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interviewing">Interviewing</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Salary (Optional)
                      </label>
                      <Input
                        placeholder="e.g., $120,000"
                        value={interview.salary}
                        onChange={(e) => updateInterview("salary", e.target.value)}
                        disabled={interview.isSaved}
                      />
                    </div>
                  </div>

                  {/* HR Contact */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground">HR Contact (Optional)</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Name
                        </label>
                        <Input
                          placeholder="HR Name"
                          value={interview.hrName}
                          onChange={(e) => updateInterview("hrName", e.target.value)}
                          disabled={interview.isSaved}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="hr@company.com"
                          value={interview.hrEmail}
                          onChange={(e) => {
                            updateInterview("hrEmail", e.target.value);
                            if (getError('hrEmail')) clearError('hrEmail');
                          }}
                          disabled={interview.isSaved}
                          hasError={!!getError('hrEmail')}
                        />
                        {getError('hrEmail') && <p className="text-sm text-red-600 mt-1">{getError('hrEmail')}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          Phone
                        </label>
                        <Input
                          placeholder="+1 234 567 8900"
                          value={interview.hrPhone}
                          onChange={(e) => {
                            updateInterview("hrPhone", e.target.value);
                            if (getError('hrPhone')) clearError('hrPhone');
                          }}
                          disabled={interview.isSaved}
                          hasError={!!getError('hrPhone')}
                          className=""
                        />
                        {getError('hrPhone') && <p className="text-sm text-red-600 mt-1">{getError('hrPhone')}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Feedback or Notes</label>
                      <Textarea
                        placeholder="Share your overall experience..."
                        className="min-h-[80px]"
                        value={interview.feedback}
                        onChange={(e) => updateInterview("feedback", e.target.value)}
                        disabled={interview.isSaved}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Next Steps</label>
                      <Textarea
                        placeholder="What are the next steps or follow-ups?"
                        className="min-h-[60px]"
                        value={interview.nextSteps}
                        onChange={(e) => updateInterview("nextSteps", e.target.value)}
                        disabled={interview.isSaved}
                      />
                    </div>
                  </div>

                  {!interview.isSaved && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={saveInterviewDetails}
                        disabled={isSaving}
                        className="flex-1"
                        size="lg"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Interview
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {interview.isSaved && (
                    <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg border border-success/20">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success-foreground">
                        Interview details saved! Proceed to add rounds below.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Add Rounds */}
          {interview.isSaved && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Step 2: Interview Rounds
                      </CardTitle>
                      <CardDescription>
                        Add rounds for this interview. Each round can have multiple questions.
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Add Round button clicked');
                        addRound();
                      }} 
                      size="sm"
                      disabled={isSaving}
                      type="button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Round
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {safeRounds.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No rounds added yet</p>
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add Your First Round button clicked');
                          addRound();
                        }} 
                        variant="outline"
                        disabled={isSaving}
                        type="button"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Round
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible value={expandedRound} onValueChange={setExpandedRound}>
                      {safeRounds.map((round, index) => (
                        <AccordionItem key={round.id} value={round.id} className="border rounded-lg mb-4 px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 flex-1">
                              {round.isSaved && (
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                              )}
                              <div className="text-left">
                                <div className="font-semibold">
                                  {round.name || `Round ${index + 1}`}
                                </div>
                                {round.type && (
                                  <div className="text-xs text-muted-foreground">
                                    {round.type} {round.status && `• ${round.status}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              {/* Round Details */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Round Name *</label>
                                  <Input
                                    placeholder="e.g., Technical Round 1"
                                    value={round.name}
                                    onChange={(e) => {
                                      updateRound(round.id, "name", e.target.value);
                                      const key = `rounds.${round.id}.name`;
                                      if (getError(key)) clearError(key);
                                    }}
                                    disabled={round.isSaved}
                                    hasError={!!getError(`rounds.${round.id}.name`)}
                                    className=""
                                  />
                                  {getError(`rounds.${round.id}.name`) && <p className="text-sm text-red-600 mt-1">{getError(`rounds.${round.id}.name`)}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Type *</label>
                                  <Select
                                    value={round.type}
                                    onValueChange={(v) => {
                                      updateRound(round.id, "type", v);
                                      const key = `rounds.${round.id}.type`;
                                      if (getError(key)) clearError(key);
                                    }}
                                    disabled={round.isSaved}
                                  >
                                    <SelectTrigger hasError={!!getError(`rounds.${round.id}.type`)}>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="technical">Technical</SelectItem>
                                      <SelectItem value="coding">Coding</SelectItem>
                                      <SelectItem value="system-design">System Design</SelectItem>
                                      <SelectItem value="behavioral">Behavioral</SelectItem>
                                      <SelectItem value="hr">HR</SelectItem>
                                      <SelectItem value="managerial">Managerial</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Date</label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !round.date && "text-muted-foreground"
                                        )}
                                        disabled={round.isSaved}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {round.date ? format(round.date, "PPP") : <span>Pick a date</span>}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={round.date}
                                        onSelect={(date) => updateRound(round.id, "date", date)}
                                        initialFocus
                                        className="pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Status</label>
                                  <Select
                                    value={round.status}
                                    onValueChange={(v) => updateRound(round.id, "status", v)}
                                    disabled={round.isSaved}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="scheduled">Scheduled</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Interviewer Name</label>
                                <Input
                                  placeholder="Interviewer's name"
                                  value={round.interviewer}
                                  onChange={(e) => updateRound(round.id, "interviewer", e.target.value)}
                                  disabled={round.isSaved}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Confidence Level: {round.confidence}%
                                </label>
                                <Slider
                                  value={[round.confidence]}
                                  onValueChange={(v) => updateRound(round.id, "confidence", v[0])}
                                  max={100}
                                  step={10}
                                  disabled={round.isSaved}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">Feedback or Notes</label>
                                <Textarea
                                  placeholder="Share your experience in this round..."
                                  className="min-h-[80px]"
                                  value={round.feedback}
                                  onChange={(e) => updateRound(round.id, "feedback", e.target.value)}
                                  disabled={round.isSaved}
                                />
                              </div>

                              {!round.isSaved && (
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    onClick={() => saveRound(round.id)}
                                    disabled={isSaving}
                                    className="flex-1"
                                  >
                                    {isSaving ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Round
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => deleteRound(round.id)}
                                    variant="destructive"
                                    size="icon"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              {/* Step 3: Questions (only show when round is saved) */}
                              {round.isSaved && (
                                <div className="mt-6 pt-6 border-t space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">Round Questions</h4>
                                    <Button
                                      onClick={() => addQuestion(round.id)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Question
                                    </Button>
                                  </div>

                                  {round.questions.length === 0 ? (
                                    <div className="text-center py-8 border border-dashed rounded-lg">
                                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground mb-3">
                                        No questions added yet
                                      </p>
                                      <Button
                                        onClick={() => addQuestion(round.id)}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Question
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {round.questions.map((question, qIndex) => (
                                        <Card key={question.id} className="border-2">
                                          <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-sm">
                                                Question {qIndex + 1}
                                              </CardTitle>
                                              <Button
                                                onClick={() => deleteQuestion(round.id, question.id)}
                                                variant="ghost"
                                                size="sm"
                                              >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                              </Button>
                                            </div>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Question Text *</label>
                                              <Textarea
                                                placeholder="Enter the interview question..."
                                                hasError={!!getError(`questions.${round.id}.${question.id}`)}
                                                className="min-h-[80px]"
                                                value={question.question}
                                                onChange={(e) => {
                                                  updateQuestion(round.id, question.id, "question", e.target.value);
                                                  const key = `questions.${round.id}.${question.id}`;
                                                  if (getError(key)) clearError(key);
                                                }}
                                              />
                                              {getError(`questions.${round.id}.${question.id}`) && (
                                                <p className="text-sm text-red-600 mt-1">{getError(`questions.${round.id}.${question.id}`)}</p>
                                              )}
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">Topics</label>
                                                <Input
                                                  placeholder="e.g., Arrays, Dynamic Programming"
                                                  value={question.topics}
                                                  onChange={(e) => updateQuestion(round.id, question.id, "topics", e.target.value)}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <label className="text-sm font-medium">Difficulty</label>
                                                <Select
                                                  value={question.difficulty}
                                                  onValueChange={(v) => updateQuestion(round.id, question.id, "difficulty", v)}
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select difficulty" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="easy">Easy</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="hard">Hard</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Your Answer</label>
                                              <Textarea
                                                placeholder="How did you answer this question?"
                                                className="min-h-[80px]"
                                                value={question.answer}
                                                onChange={(e) => updateQuestion(round.id, question.id, "answer", e.target.value)}
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Feedback</label>
                                              <Textarea
                                                placeholder="Interviewer's feedback or your notes..."
                                                className="min-h-[60px]"
                                                value={question.feedback}
                                                onChange={(e) => updateQuestion(round.id, question.id, "feedback", e.target.value)}
                                              />
                                            </div>

                                            <div className="flex items-center space-x-2 pt-2">
                                              <Checkbox
                                                id={`public-${question.id}`}
                                                checked={question.isPublic}
                                                onCheckedChange={(checked) => 
                                                  updateQuestion(round.id, question.id, "isPublic", checked)
                                                }
                                              />
                                              <label
                                                htmlFor={`public-${question.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                              >
                                                Make this question public
                                              </label>
                                            </div>

                                            <Button
                                              onClick={() => saveQuestion(round.id, question.id)}
                                              disabled={isSaving}
                                              className="w-full"
                                              size="sm"
                                            >
                                              {isSaving ? (
                                                <>
                                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                  Saving...
                                                </>
                                              ) : (
                                                <>
                                                  <Save className="w-4 h-4 mr-2" />
                                                  Save Question
                                                </>
                                              )}
                                            </Button>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Final Step: Review & Submit */}
          {interview.isSaved && rounds.some(r => r.isSaved) && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Review your interview details and submit when ready
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-card rounded-lg">
                      <Building2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold">{interview.company}</div>
                        <div className="text-sm text-muted-foreground">{interview.role}</div>
                        {interview.location && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {interview.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-card rounded-lg">
                        <div className="text-2xl font-bold text-primary">{rounds.length}</div>
                        <div className="text-xs text-muted-foreground">Total Rounds</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-lg">
                        <div className="text-2xl font-bold text-secondary">
                          {rounds.reduce((acc, r) => acc + r.questions.length, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Questions</div>
                      </div>
                      <div className="text-center p-4 bg-card rounded-lg">
                        <div className="text-2xl font-bold text-accent">
                          {interview.status || "Draft"}
                        </div>
                        <div className="text-xs text-muted-foreground">Status</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button
                      onClick={submitInterview}
                      disabled={isSaving}
                      className="flex-1"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Interview
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    💡 Your progress is auto-saved. You can come back later to complete.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
