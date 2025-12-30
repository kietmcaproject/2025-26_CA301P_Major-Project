import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Brain,
  Target
} from "lucide-react";
import { getInterviewById } from "@/api/interviews";
import { toast } from "sonner";
import api from "@/lib/api";

const statusConfig = {
  offer: { label: "Offer", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-error text-error-foreground", icon: XCircle },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock },
  interviewing: { label: "Interviewing", color: "bg-info text-info-foreground", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock }
};

interface Question {
  _id?: string;
  questionText?: string;
  topics?: string[] | string; // Can be array or comma-separated string
  difficulty?: string;
  userAnswer?: string; // Backend uses userAnswer
  feedback?: string;
}

interface Round {
  _id?: string;
  roundName?: string; // Backend uses roundName
  roundNumber?: number;
  type?: string; // May not exist in backend - can be derived from roundName
  date?: string;
  duration?: string; // Backend has duration field
  status?: string;
  interviewerName?: string;
  confidence?: number; // May not exist in backend
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

export function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInterview();
    }
  }, [id]);

  const fetchInterview = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await getInterviewById(id);
      setInterview(response.data || null);
    } catch (error: any) {
      console.error("Failed to fetch interview:", error);
      toast.error("Failed to load interview details");
      navigate("/track-interviews");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen gradient-hero p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Interview not found</h2>
          <Button onClick={() => navigate("/track-interviews")}>
            Back to Interviews
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[interview.status as keyof typeof statusConfig] || statusConfig.pending;
  const rounds = interview.rounds || [];
  
  // Helper function to normalize topics (handle both string and array)
  const normalizeTopics = (topics: string[] | string | undefined): string[] => {
    if (!topics) return [];
    if (typeof topics === 'string') {
      // If it's a comma-separated string, split it
      return topics.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (Array.isArray(topics)) {
      return topics.filter(t => t && typeof t === 'string' && t.trim().length > 0);
    }
    return [];
  };

  // Flatten all questions from all rounds and normalize topics
  const allQuestions: Question[] = [];
  rounds.forEach(round => {
    if (round.questions && Array.isArray(round.questions)) {
      round.questions.forEach(q => {
        allQuestions.push({
          ...q,
          topics: normalizeTopics(q.topics)
        });
      });
    }
  });

  // Helper function to derive round type from roundName
  const getRoundType = (roundName?: string): string | null => {
    if (!roundName) return null;
    const name = roundName.toLowerCase();
    if (name.includes('phone') || name.includes('screening')) return 'Phone Screen';
    if (name.includes('technical') || name.includes('coding')) return 'Technical';
    if (name.includes('system') || name.includes('design')) return 'System Design';
    if (name.includes('behavioral') || name.includes('culture')) return 'Behavioral';
    if (name.includes('hr') || name.includes('human resources')) return 'HR';
    return null;
  };

  // Handle AI Suggestions button click
  const handleAISuggestions = async () => {
    if (!interview) return;
    
    setIsLoadingAI(true);
    try {
      // Prepare data for AI analysis
      const payload = {
        company: interview.company || '',
        role: interview.role || '',
        roundTypes: rounds.map(r => getRoundType(r.roundName) || r.roundName || 'Unknown'),
        questions: allQuestions.map(q => ({
          questionText: q.questionText || '',
          topics: normalizeTopics(q.topics),
          difficulty: q.difficulty || 'medium',
          answer: q.userAnswer || '',
          feedback: q.feedback || ''
        })),
        feedback: interview.feedback || '',
        roundFeedback: rounds.map(r => r.feedback || '').filter(f => f)
      };

      // TODO: Call backend API endpoint for AI suggestions
      // const response = await api.post('/api/interviews/ai-suggestions', payload);
      toast.info('AI Suggestions feature coming soon!');
    } catch (error: any) {
      console.error('AI Suggestions error:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Handle Get Potential Questions button click
  const handleGetPotentialQuestions = async () => {
    if (!interview) return;
    
    setIsLoadingAI(true);
    try {
      const payload = {
        company: interview.company || '',
        role: interview.role || ''
      };

      // TODO: Call backend API endpoint for potential questions
      // const response = await api.post('/api/interviews/potential-questions', payload);
      toast.info('Potential Questions feature coming soon!');
    } catch (error: any) {
      console.error('Potential Questions error:', error);
      toast.error('Failed to get potential questions');
    } finally {
      setIsLoadingAI(false);
    }
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
        <Button
          variant="ghost"
          onClick={() => navigate("/track-interviews")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interviews
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {interview.company || 'N/A'}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {interview.role || 'N/A'}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {interview.date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(interview.date).toLocaleDateString()}
                </div>
              )}
              {interview.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {interview.location}
                </div>
              )}
            </div>
          </div>
          <Badge className={statusInfo.color}>
            <statusInfo.icon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rounds">Rounds ({rounds.length})</TabsTrigger>
          <TabsTrigger value="questions">Questions ({allQuestions.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card className="p-6 gradient-card border-0 shadow-md">
            <h2 className="text-xl font-semibold mb-6">Interview Details</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Company</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {interview.company || 'N/A'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {interview.role || 'N/A'}
                </p>
              </div>

              {interview.date && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {new Date(interview.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {interview.location && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {interview.location}
                  </p>
                </div>
              )}

              {interview.salary && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Salary</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {interview.salary}
                  </p>
                </div>
              )}

              {interview.hr && (interview.hr.name || interview.hr.email || interview.hr.phone) && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">HR Contact</span>
                  </div>
                  <div className="ml-6 space-y-2">
                    {interview.hr.name && (
                      <p className="text-sm text-muted-foreground">
                        <User className="w-3 h-3 inline mr-2" />
                        {interview.hr.name}
                      </p>
                    )}
                    {interview.hr.email && (
                      <p className="text-sm text-muted-foreground">
                        <Mail className="w-3 h-3 inline mr-2" />
                        {interview.hr.email}
                      </p>
                    )}
                    {interview.hr.phone && (
                      <p className="text-sm text-muted-foreground">
                        <Phone className="w-3 h-3 inline mr-2" />
                        {interview.hr.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {interview.feedback && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Overall Feedback</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {interview.feedback}
                </p>
              </div>
            )}

            {interview.nextSteps && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {interview.nextSteps}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Rounds Tab */}
        <TabsContent value="rounds" className="mt-6">
          <div className="space-y-6">
            {rounds.length === 0 ? (
              <Card className="p-8 text-center gradient-card border-0 shadow-md">
                <p className="text-muted-foreground">No rounds added yet</p>
              </Card>
            ) : (
              rounds.map((round, index) => {
                const roundType = getRoundType(round.roundName);
                return (
                  <Card key={round._id || index} className="p-6 gradient-card border-0 shadow-md">
                    {/* Round Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {round.roundNumber || index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {round.roundName || `Round ${index + 1}`}
                          </h3>
                          {roundType && (
                            <Badge variant="secondary" className="text-xs">
                              {roundType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {round.status && (
                        <Badge 
                          variant={round.status === 'completed' ? 'default' : 'outline'}
                          className="capitalize"
                        >
                          {round.status}
                        </Badge>
                      )}
                    </div>

                    {/* Round Details Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      {round.date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Date</div>
                            <div className="text-muted-foreground">
                              {new Date(round.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                      {round.interviewerName && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Interviewer</div>
                            <div className="text-muted-foreground">
                              {round.interviewerName}
                            </div>
                          </div>
                        </div>
                      )}
                      {round.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-muted-foreground">
                              {round.duration}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Confidence</div>
                          <div className="text-muted-foreground">
                            {round.confidence !== undefined && round.confidence > 0 
                              ? `${round.confidence}%` 
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Round Feedback */}
                    {round.feedback && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-2">Interviewer Feedback</h4>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {round.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Questions Section */}
                    {round.questions && round.questions.length > 0 ? (
                      <div className="border-t pt-6">
                        <h4 className="text-md font-semibold mb-4">
                          Questions Asked ({round.questions.length})
                        </h4>
                        <div className="space-y-4">
                          {round.questions.map((q, qIndex) => (
                            <Card key={q._id || qIndex} className="p-4 bg-background border">
                              <div className="flex items-start justify-between mb-3">
                                <h5 className="text-sm font-semibold flex-1">
                                  {q.questionText || `Question ${qIndex + 1}`}
                                </h5>
                                {q.difficulty && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      q.difficulty === 'hard' ? 'border-red-500 text-red-500' :
                                      q.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                      'border-green-500 text-green-500'
                                    }`}
                                  >
                                    {q.difficulty}
                                  </Badge>
                                )}
                              </div>
                              
                              {normalizeTopics(q.topics).length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {normalizeTopics(q.topics).map((topic, tIndex) => (
                                    <Badge key={tIndex} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {q.userAnswer && (
                                <div className="mb-3">
                                  <h6 className="text-xs font-medium mb-1 text-muted-foreground">
                                    Your Answer
                                  </h6>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                                    {q.userAnswer}
                                  </p>
                                </div>
                              )}

                              {q.feedback && (
                                <div>
                                  <h6 className="text-xs font-medium mb-1 text-muted-foreground">
                                    Feedback
                                  </h6>
                                  <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                                    {q.feedback}
                                  </p>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-6">
                        <p className="text-sm text-muted-foreground">No questions recorded for this round</p>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-6">
          <div className="space-y-4">
            {allQuestions.length === 0 ? (
              <Card className="p-8 text-center gradient-card border-0 shadow-md">
                <p className="text-muted-foreground">No questions added yet</p>
              </Card>
            ) : (
              allQuestions.map((question, index) => (
                <Card key={question._id || index} className="p-6 gradient-card border-0 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold flex-1">
                      {question.questionText || `Question ${index + 1}`}
                    </h3>
                    {question.difficulty && (
                      <Badge 
                        variant="outline" 
                        className={`${
                          question.difficulty === 'hard' ? 'border-red-500 text-red-500' :
                          question.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                          'border-green-500 text-green-500'
                        }`}
                      >
                        {question.difficulty}
                      </Badge>
                    )}
                  </div>

                  {normalizeTopics(question.topics).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {normalizeTopics(question.topics).map((topic, tIndex) => (
                        <Badge key={tIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {question.userAnswer ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Your Answer</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg">
                        {question.userAnswer}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Your Answer</h4>
                      <p className="text-sm text-muted-foreground italic">N/A</p>
                    </div>
                  )}

                  {question.feedback ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Feedback</h4>
                      <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        {question.feedback}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Feedback</h4>
                      <p className="text-sm text-muted-foreground italic">N/A</p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-6">
          <div className="space-y-6">
            {/* Overall Feedback Section */}
            <Card className="p-6 gradient-card border-0 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
              
              {interview.feedback ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg mb-4">
                  {interview.feedback}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic mb-4">No overall feedback available</p>
              )}

              {/* AI Suggestions Button */}
              {interview.status === 'pending' ? (
                <Button 
                  onClick={handleGetPotentialQuestions}
                  disabled={isLoadingAI}
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Get Potential Questions for this Company/Role
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleAISuggestions}
                  disabled={isLoadingAI}
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Suggestions for Improvement
                    </>
                  )}
                </Button>
              )}
            </Card>

            {/* Round-wise Performance */}
            {rounds.length > 0 && (
              <Card className="p-6 gradient-card border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Round-wise Performance</h3>
                <div className="space-y-4">
                  {rounds.map((round, index) => {
                    const hasFeedback = round.feedback && round.feedback.trim().length > 0;
                    const confidence = round.confidence !== undefined && round.confidence > 0 
                      ? round.confidence 
                      : null;

                    return (
                      <div key={round._id || index} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {round.roundNumber || index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-2">
                            {round.roundName || `Round ${index + 1}`}
                          </h4>
                          {hasFeedback ? (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                              {round.feedback}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mb-3">No feedback available</p>
                          )}
                          {confidence !== null ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-teal-500 h-2 rounded-full transition-all"
                                  style={{ width: `${confidence}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground min-w-[3rem]">
                                {confidence}%
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div className="bg-muted h-2 rounded-full" style={{ width: '0%' }} />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground min-w-[3rem]">
                                N/A
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Question-wise Feedback */}
            {allQuestions.length > 0 && (
              <Card className="p-6 gradient-card border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Question-wise Feedback</h3>
                <div className="space-y-3">
                  {allQuestions
                    .filter(q => q.feedback && q.feedback.trim().length > 0)
                    .map((question, index) => (
                      <div key={question._id || index} className="bg-muted p-4 rounded-lg">
                        <h4 className="text-sm font-semibold mb-2">
                          {question.questionText || `Question ${index + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {question.feedback}
                        </p>
                      </div>
                    ))}
                </div>
                {allQuestions.every(q => !q.feedback || !q.feedback.trim()) && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    No question-wise feedback available
                  </p>
                )}
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

