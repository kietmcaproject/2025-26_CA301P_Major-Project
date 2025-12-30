import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, FileText, Mail, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: "Interviews Tracked", value: "12", icon: Target, color: "text-primary" },
    { label: "Resumes Analyzed", value: "5", icon: FileText, color: "text-secondary" },
    { label: "Emails Sent", value: "8", icon: Mail, color: "text-primary" },
    { label: "Questions Practiced", value: "156", icon: BookOpen, color: "text-secondary" },
  ];

  const quickActions = [
    { label: "Track New Interview", icon: Target, href: "/track-interviews", gradient: "gradient-primary" },
    { label: "Analyze Resume", icon: FileText, href: "/resume-analysis", gradient: "gradient-secondary" },
    { label: "Generate Cold Email", icon: Mail, href: "/cold-email", gradient: "gradient-primary" },
    { label: "Browse Questions", icon: BookOpen, href: "/questions", gradient: "gradient-secondary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's your interview preparation progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-12 h-12 ${stat.color}`} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={action.label} to={action.href}>
                  <Card className={`p-6 ${action.gradient} hover:scale-105 transition-all cursor-pointer group`}>
                    <div className="flex flex-col items-center text-center">
                      <action.icon className="w-12 h-12 mb-4 text-white group-hover:scale-110 transition-transform" />
                      <p className="font-semibold text-white">{action.label}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Completed Google Interview Round 2</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Analyzed resume for Amazon position</p>
                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Sent cold email to Microsoft recruiter</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
