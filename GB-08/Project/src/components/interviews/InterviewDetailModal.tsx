import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Brain,
  Sparkles,
  Briefcase,
  Building2,
  FileText,
  MessageSquare,
  Loader2,
  HelpCircle
} from "lucide-react";
import { getInterviewById, getAISuggestions } from "@/api/interviews";
import { toast } from "sonner";

// Backend data structure interfaces
interface Question {
  _id?: string;
  questionText?: string;
  topics?: string[] | string;
  difficulty?: string;
  userAnswer?: string;
  feedback?: string;
  isPublic?: boolean;
  round?: string;
}

interface Round {
  _id?: string;
  roundName?: string;
  roundNumber?: number;
  type?: string;
  date?: string;
  duration?: string;
  status?: string;
  interviewerName?: string;
  confidence?: number;
  feedback?: string;
  questions?: Question[];
}

interface Interview {
  _id?: string;
  company?: string;
  role?: string;
  date?: string;
  location?: string;
  status?: string;
  salary?: string;
  hr?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  feedback?: string;
  nextSteps?: string;
  rounds?: Round[];
}

interface InterviewDetailModalProps {
  interviewId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  offer: { label: "Offer", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-error text-error-foreground", icon: XCircle },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock },
  interviewing: { label: "Interviewing", color: "bg-info text-info-foreground", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock }
};

const roundTypeColors: Record<string, string> = {
  coding: "bg-blue-500",
  'system-design': "bg-purple-500",
  behavioral: "bg-green-500",
  cultural: "bg-orange-500",
  technical: "bg-red-500",
  'phone-screen': "bg-cyan-500",
  hr: "bg-pink-500"
};

const difficultyColors: Record<string, string> = {
  easy: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground",
  hard: "bg-error text-error-foreground"
};

interface AISuggestion {
  summary: string;
  patternsObserved: string[];
  roundInsights: Array<{
    roundName: string;
    analysisType: "feedback-aware" | "answer-only" | "experience-based";
    strengths: string[];
    gaps: string[];
    whatCouldBeSaidInstead: string[];
    improvementTips: string[];
  }>;
  improvementPlan: {
    shortTerm: string[];
    mediumTerm: string[];
  };
}

export function InterviewDetailModal({ interviewId, isOpen, onClose }: InterviewDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion | null>(null);

  useEffect(() => {
    if (isOpen && interviewId) {
      fetchInterview();
    } else {
      setInterview(null);
      setActiveTab("overview");
    }
  }, [isOpen, interviewId]);

  const fetchInterview = async () => {
    if (!interviewId) return;
    
    try {
      setIsLoading(true);
      const response = await getInterviewById(interviewId);
      setInterview(response.data || null);
    } catch (error: any) {
      console.error("Failed to fetch interview:", error);
      toast.error("Failed to load interview details");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to normalize topics
  const normalizeTopics = (topics: string[] | string | undefined): string[] => {
    if (!topics) return [];
    if (typeof topics === 'string') {
      return topics.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (Array.isArray(topics)) {
      return topics.filter(t => t && typeof t === 'string' && t.trim().length > 0);
    }
    return [];
  };

  // Helper function to format date
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Not provided";
    }
  };

  // ✅ CRITICAL FIX: Derive questions dynamically from rounds
  // Questions are stored under round.questions (populated by backend)
  const allQuestions = React.useMemo(() => {
    if (!interview?.rounds) return [];
    
    const questions = interview.rounds.flatMap(round => {
      const roundQuestions = round.questions || [];
      return roundQuestions.map((q: Question) => ({
        ...q,
        roundName: round.roundName || "Unassigned round",
        roundId: round._id
      }));
    });
    
    return questions;
  }, [interview?.rounds]);
  
  // ✅ Debug logging
  useEffect(() => {
    if (interview) {
      console.log('FETCHED INTERVIEW (Modal):', {
        id: interview._id,
        company: interview.company,
        roundsCount: interview.rounds?.length || 0,
        totalQuestions: allQuestions.length
      });
      
      interview.rounds?.forEach((round, idx) => {
        console.log(`Round ${idx + 1} (${round.roundName}):`, {
          roundId: round._id,
          status: round.status,
          questionsCount: round.questions?.length || 0,
          questions: round.questions
        });
      });
      
      console.log('Derived allQuestions:', allQuestions);
    }
  }, [interview, allQuestions]);

  // Handle AI Suggestions
  const handleAISuggestions = async () => {
    if (!interview || !interviewId) return;
    
    setIsLoadingAI(true);
    setAISuggestions(null); // Clear previous suggestions
    try {
      const response = await getAISuggestions(interviewId);
      if (response.data?.suggestions) {
        setAISuggestions(response.data.suggestions);
        toast.success("AI suggestions generated successfully!");
        // Switch to feedback tab to show suggestions
        setActiveTab("feedback");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Failed to generate AI suggestions:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to generate AI suggestions";
      toast.error(errorMsg);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // ✅ CRITICAL FIX: Check if ANY feedback exists (overall, nextSteps, or ANY round feedback)
  const hasFeedback = Boolean(
    interview?.feedback || 
    interview?.nextSteps || 
    interview?.rounds?.some(r => r.feedback && r.feedback.trim().length > 0)
  );

  if (!isOpen) return null;

  const statusInfo = interview?.status 
    ? (statusConfig[interview.status as keyof typeof statusConfig] || statusConfig.pending)
    : statusConfig.pending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold">{interview?.company || "Interview"}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {interview?.role || "Role not specified"}
              </div>
            </div>
            {interview && (
              <Badge className={statusInfo.color}>
                <statusInfo.icon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !interview ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <EmptyState
              icon={<HelpCircle className="w-12 h-12" />}
              title="Interview not found"
              description="The interview you're looking for doesn't exist or has been removed."
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rounds">
                Rounds {interview.rounds && interview.rounds.length > 0 && `(${interview.rounds.length})`}
              </TabsTrigger>
              <TabsTrigger value="questions">
                Questions {allQuestions.length > 0 && `(${allQuestions.length})`}
              </TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-6">
              {/* TAB 1: Overview */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <Card className="p-6 gradient-card border-0">
                  <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Company: </span>
                        <span className="text-sm">{interview.company || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Role / Position: </span>
                        <span className="text-sm">{interview.role || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Date: </span>
                        <span className="text-sm">{formatDate(interview.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Location: </span>
                        <span className="text-sm">{interview.location || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Status: </span>
                        <span className="text-sm">{statusInfo.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">Salary: </span>
                        <span className="text-sm">{interview.salary || "Not discussed"}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* HR Contact Card */}
                <Card className="p-6 gradient-card border-0">
                  <h3 className="text-lg font-semibold mb-4">HR Contact</h3>
                  {interview.hr?.name || interview.hr?.email || interview.hr?.phone ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">HR Name: </span>
                          {interview.hr.name || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">HR Email: </span>
                          {interview.hr.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          <span className="font-medium">HR Phone: </span>
                          {interview.hr.phone || "Not provided"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<User className="w-8 h-8" />}
                      title="HR contact details not added yet"
                      description="Add HR contact information to keep track of your recruiter."
                      className="py-8"
                    />
                  )}
                </Card>
              </TabsContent>

              {/* TAB 2: Rounds */}
              <TabsContent value="rounds" className="space-y-4 mt-0">
                {!interview.rounds || interview.rounds.length === 0 ? (
                  <EmptyState
                    icon={<Target className="w-12 h-12" />}
                    title="No interview rounds added yet"
                    description="Rounds will appear here once they are added to this interview."
                  />
                ) : (
                  interview.rounds.map((round, index) => {
                    const roundType = round.type || round.roundName?.toLowerCase() || 'technical';
                    const typeColor = roundTypeColors[roundType] || roundTypeColors.technical;
                    const questionsCount = round.questions?.length || 0;

                    return (
                      <Card key={round._id || index} className="p-6 gradient-card border-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${typeColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{round.roundName || "Unnamed Round"}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {round.type || round.roundName || "Technical"}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={round.status === 'completed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {round.status || "pending"}
                          </Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Date: </span>
                            <span>{formatDate(round.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Interviewer: </span>
                            <span>{round.interviewerName || "Interviewer not assigned"}</span>
                          </div>
                          {round.confidence !== undefined && round.confidence !== null ? (
                            <div className="flex items-center gap-3 text-sm md:col-span-2">
                              <Brain className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Confidence Level: </span>
                              <div className="flex-1 max-w-xs">
                                <Slider
                                  value={[round.confidence]}
                                  max={100}
                                  min={0}
                                  step={1}
                                  disabled
                                  className="pointer-events-none"
                                />
                              </div>
                              <span className="text-sm font-medium">{round.confidence}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                              <Brain className="w-4 h-4" />
                              <span>Confidence not rated</span>
                            </div>
                          )}
                        </div>

                        {round.feedback ? (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm">Feedback / Notes:</h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {round.feedback}
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-sm">Feedback / Notes:</h4>
                            <p className="text-sm text-muted-foreground italic">No feedback recorded</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Questions Count: {questionsCount}</span>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* TAB 3: Questions */}
              <TabsContent value="questions" className="space-y-4 mt-0">
                {allQuestions.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    title="No questions captured for this interview"
                    description="Questions will appear here once they are added to interview rounds."
                  />
                ) : (
                  allQuestions.map((question, index) => {
                    const topics = normalizeTopics(question.topics);
                    const difficulty = question.difficulty?.toLowerCase() || 'medium';
                    const difficultyColor = difficultyColors[difficulty] || difficultyColors.medium;

                    return (
                      <Card key={question._id || index} className="p-6 gradient-card border-0">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium flex-1">{question.questionText || "Question not available"}</h4>
                          <Badge className={difficultyColor}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium">Topics: </span>
                            {topics.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {topics.map((topic, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">General</span>
                            )}
                          </div>

                          <div>
                            <span className="text-sm font-medium">Your Answer: </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {question.userAnswer || "Answer not recorded"}
                            </p>
                          </div>

                          {question.feedback && (
                            <div>
                              <span className="text-sm font-medium">Feedback: </span>
                              <p className="text-sm text-muted-foreground mt-1">{question.feedback}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                <span className="font-medium">Is Public: </span>
                                {question.isPublic ? "Yes" : "No"}
                              </span>
                              <span>
                                <span className="font-medium">Round: </span>
                                {question.roundName || "Unassigned round"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* TAB 4: Feedback */}
              <TabsContent value="feedback" className="space-y-6 mt-0">
                <Card className="p-6 gradient-card border-0">
                  <h3 className="text-lg font-semibold mb-4">Overall Feedback</h3>
                  {interview.feedback ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.feedback}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Overall feedback not added yet</p>
                  )}
                </Card>

                <Card className="p-6 gradient-card border-0">
                  <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                  {interview.nextSteps ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.nextSteps}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No next steps defined</p>
                  )}
                </Card>

                <Card className="p-6 gradient-card border-0">
                  <h3 className="text-lg font-semibold mb-4">Round-wise Feedback</h3>
                  {interview.rounds && interview.rounds.length > 0 ? (
                    <div className="space-y-4">
                      {interview.rounds.map((round, index) => {
                        const hasRoundFeedback = round.feedback && round.feedback.trim().length > 0;
                        return (
                          <div key={round._id || index} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                            <div className={`w-6 h-6 ${roundTypeColors[round.type || 'technical'] || roundTypeColors.technical} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-2">{round.roundName || "Round"}</h4>
                              {hasRoundFeedback ? (
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Feedback:</span>
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{round.feedback}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No feedback recorded for this round</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No rounds added yet</p>
                  )}
                </Card>

                {/* AI Suggestions Section */}
                {isLoadingAI ? (
                  <Card className="p-6 gradient-card border-0">
                    <div className="flex items-center gap-3 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <h3 className="text-lg font-semibold">Generating AI Suggestions...</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Analyzing your interview performance...</p>
                  </Card>
                ) : aiSuggestions ? (
                  <Card className="p-6 gradient-card border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">AI-Powered Suggestions</h3>
                      </div>
                      <Button
                        onClick={handleAISuggestions}
                        variant="outline"
                        size="sm"
                        disabled={isLoadingAI}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-4 italic">
                      Suggestions are based on your inputs and common interview expectations
                    </p>

                    {/* Overall Summary */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{aiSuggestions.summary}</p>
                    </div>

                    {/* Patterns Observed */}
                    {aiSuggestions.patternsObserved && aiSuggestions.patternsObserved.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Patterns Observed</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {aiSuggestions.patternsObserved.map((pattern, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">{pattern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Round-wise Insights */}
                    {aiSuggestions.roundInsights && aiSuggestions.roundInsights.length > 0 && (
                      <div className="mb-6 space-y-4">
                        <h4 className="font-semibold mb-3">Round-wise Insights</h4>
                        {aiSuggestions.roundInsights.map((insight, idx) => (
                          <Card key={idx} className="p-4 bg-muted/50 border-0">
                            <div className="flex items-center gap-2 mb-3">
                              <h5 className="font-medium">{insight.roundName}</h5>
                              <Badge variant="outline" className="text-xs">
                                {insight.analysisType.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            {insight.strengths && insight.strengths.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-success">Strengths:</span>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {insight.strengths.map((strength, sIdx) => (
                                    <li key={sIdx} className="text-sm text-muted-foreground">{strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {insight.gaps && insight.gaps.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium">Areas to Strengthen:</span>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {insight.gaps.map((gap, gIdx) => (
                                    <li key={gIdx} className="text-sm text-muted-foreground">{gap}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {insight.whatCouldBeSaidInstead && insight.whatCouldBeSaidInstead.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium">What to Say Differently:</span>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {insight.whatCouldBeSaidInstead.map((alt, aIdx) => (
                                    <li key={aIdx} className="text-sm text-muted-foreground">{alt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {insight.improvementTips && insight.improvementTips.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">Improvement Tips:</span>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {insight.improvementTips.map((tip, tIdx) => (
                                    <li key={tIdx} className="text-sm text-muted-foreground">{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Improvement Plan */}
                    {aiSuggestions.improvementPlan && (
                      <div>
                        <h4 className="font-semibold mb-3">Personalized Improvement Plan</h4>
                        
                        {aiSuggestions.improvementPlan.shortTerm && aiSuggestions.improvementPlan.shortTerm.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Short-term Actions:</h5>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {aiSuggestions.improvementPlan.shortTerm.map((action, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiSuggestions.improvementPlan.mediumTerm && aiSuggestions.improvementPlan.mediumTerm.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Medium-term Goals:</h5>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {aiSuggestions.improvementPlan.mediumTerm.map((goal, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">{goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleAISuggestions}
                      disabled={!hasFeedback || isLoadingAI}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Get AI Suggestions
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
