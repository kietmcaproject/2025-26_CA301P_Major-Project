import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

const mockStats = {
  totalInterviews: 24,
  successRate: 75,
  averageRounds: 3.2,
  timeToOffer: 18,
  offerCount: 6,
  rejectionCount: 8,
  pendingCount: 10
};

const mockTrends = [
  { month: "Jan", interviews: 3, offers: 1 },
  { month: "Feb", interviews: 4, offers: 1 },
  { month: "Mar", interviews: 6, offers: 2 },
  { month: "Apr", interviews: 5, offers: 1 },
  { month: "May", interviews: 6, offers: 1 },
];

const mockSkillsProgress = [
  { skill: "System Design", current: 78, target: 85, change: "+12%" },
  { skill: "Algorithms", current: 85, target: 90, change: "+8%" },
  { skill: "Behavioral", current: 72, target: 80, change: "+15%" },
  { skill: "Communication", current: 80, target: 85, change: "+5%" },
];

export function AnalyticsPage() {
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
          Analytics Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-muted-foreground"
        >
          Track your interview performance and identify areas for improvement
        </motion.p>
      </div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.totalInterviews}</div>
              <div className="text-sm text-muted-foreground">Total Interviews</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.offerCount}</div>
              <div className="text-sm text-muted-foreground">Offers Received</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.timeToOffer}</div>
              <div className="text-sm text-muted-foreground">Avg Days to Offer</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Interview Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-6 gradient-card border-0 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Interview Trends</h3>
            </div>
            
            <div className="space-y-4">
              {mockTrends.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-1">
                      <div className="flex gap-1">
                        {Array.from({ length: month.interviews }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-primary/20 rounded-sm" />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: month.offers }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-success rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground w-16 text-right">
                    {month.interviews} / {month.offers}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                <span className="text-xs text-muted-foreground">Interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-sm" />
                <span className="text-xs text-muted-foreground">Offers</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Skills Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="p-6 gradient-card border-0 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-semibold">Skills Progress</h3>
            </div>
            
            <div className="space-y-6">
              {mockSkillsProgress.map((skill, index) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-success">{skill.change}</span>
                      <span className="text-sm text-muted-foreground">
                        {skill.current}% / {skill.target}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="relative">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${skill.current}%` }}
                      />
                      <div 
                        className="absolute top-0 w-0.5 h-2 bg-accent rounded-full"
                        style={{ left: `${skill.target}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8"
      >
        <Card className="p-6 gradient-card border-0 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">Interview Status Breakdown</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{mockStats.offerCount}</div>
                <div className="text-sm text-muted-foreground">Offers</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-error/5 rounded-lg border border-error/20">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-error" />
              </div>
              <div>
                <div className="text-2xl font-bold text-error">{mockStats.rejectionCount}</div>
                <div className="text-sm text-muted-foreground">Rejections</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-lg border border-warning/20">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{mockStats.pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}