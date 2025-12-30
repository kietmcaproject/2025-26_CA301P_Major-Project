import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getUserInterviews } from "@/api/interviews";
import { toast } from "sonner";
import { InterviewDetailModal } from "@/components/interviews/InterviewDetailModal";

const statusConfig = {
  offer: { label: "Offer", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-error text-error-foreground", icon: XCircle },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock },
  interviewing: { label: "Interviewing", color: "bg-info text-info-foreground", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock }
};

interface Interview {
  _id: string;
  company: string;
  role: string;
  date?: string;
  status: string;
  rounds?: Array<{
    confidence?: number;
    questions?: Array<{ topics?: string[] }>;
  }>;
}

export function InterviewsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await getUserInterviews();
      setInterviews(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewClick = (interviewId: string) => {
    setSelectedInterviewId(interviewId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInterviewId(null);
  };

  // Calculate stats from interviews
  const stats = {
    total: interviews.length,
    offers: interviews.filter(i => i.status === 'offer').length,
    pending: interviews.filter(i => i.status === 'pending' || i.status === 'interviewing').length,
    successRate: interviews.length > 0 
      ? Math.round((interviews.filter(i => i.status === 'offer').length / interviews.length) * 100)
      : 0
  };

  // Process interviews for display
  const processedInterviews = interviews.map(interview => {
    const rounds = interview.rounds || [];
    const roundsCompleted = rounds.length;
    
    // Calculate average confidence
    let avgConfidence = 0;
    if (rounds.length > 0) {
      const confidences = rounds
        .map(r => r.confidence || 0)
        .filter(c => c > 0);
      if (confidences.length > 0) {
        avgConfidence = Math.round(
          confidences.reduce((sum, c) => sum + c, 0) / confidences.length
        );
      }
    }

    // Extract top 3 most frequent topics
    const allTopics: string[] = [];
    rounds.forEach(round => {
      if (round.questions) {
        round.questions.forEach(q => {
          if (q.topics && Array.isArray(q.topics)) {
            allTopics.push(...q.topics);
          }
        });
      }
    });
    
    // Count topic frequency
    const topicCount: Record<string, number> = {};
    allTopics.forEach(topic => {
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    });
    
    // Get top 3 most frequent
    const topTags = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      ...interview,
      roundsCompleted,
      avgConfidence: avgConfidence || null,
      tags: topTags
    };
  });

  const filteredInterviews = processedInterviews.filter(interview => {
    const matchesSearch = (interview.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (interview.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          Interview Tracker
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-muted-foreground"
        >
          Track your interview progress and identify improvement opportunities
        </motion.p>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid gap-6 md:grid-cols-4 mb-8"
      >
        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Interviews</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.offers}</div>
              <div className="text-sm text-muted-foreground">Offers</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button className="gap-2" onClick={() => navigate('/add-interview')}>
          <Plus className="w-4 h-4" />
          Add Interview
        </Button>
      </motion.div>

      {/* Interview Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredInterviews.map((interview, index) => {
            const statusInfo = statusConfig[interview.status as keyof typeof statusConfig] || statusConfig.pending;
            
            return (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
              >
                <Card 
                  className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all duration-300 group cursor-pointer"
                  onClick={() => handleInterviewClick(interview._id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {interview.company || 'N/A'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{interview.role || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <Badge className={statusInfo.color}>
                      <statusInfo.icon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {interview.date && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(interview.date).toLocaleDateString()}
                    </div>
                  )}

                  {/* Progress */}
                  {interview.roundsCompleted > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Rounds Completed</span>
                        <span className="text-sm text-muted-foreground">
                          {interview.roundsCompleted}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Confidence Score */}
                  {interview.avgConfidence !== null && interview.avgConfidence > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-sm text-muted-foreground">{interview.avgConfidence}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${interview.avgConfidence}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {interview.tags && interview.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {interview.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredInterviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center py-12"
        >
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your filters" 
              : "Start tracking your interview journey"}
          </p>
          <Button className="gap-2" onClick={() => navigate('/add-interview')}>
            <Plus className="w-4 h-4" />
            Add Your First Interview
          </Button>
        </motion.div>
      )}

      {/* Interview Detail Modal */}
      <InterviewDetailModal
        interviewId={selectedInterviewId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
}