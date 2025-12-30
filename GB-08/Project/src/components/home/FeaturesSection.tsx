import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  FileText, 
  Mail, 
  BookOpen, 
  BarChart3, 
  Brain,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import resumeAnalysisImage from "@/assets/resume-analysis.jpg";
import teamPreparingImage from "@/assets/team-preparing.jpg";
import successStoryImage from "@/assets/success-story.jpg";

const features = [
  {
    title: "Smart Interview Tracking",
    description: "Log every interview attempt, track rounds cleared, and analyze your progress with AI-powered insights.",
    icon: Target,
    href: "/interviews",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    title: "AI Resume Analysis", 
    description: "Compare your resume against job descriptions and get actionable recommendations to improve your match rate.",
    icon: FileText,
    href: "/resume",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    title: "Cold Email Generator",
    description: "Craft personalized, professional emails to recruiters with AI assistance and proven templates.",
    icon: Mail,
    href: "/email",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    title: "Question Bank",
    description: "Access thousands of interview questions with AI-generated answers and difficulty ratings.",
    icon: BookOpen,
    href: "/questions",
    color: "text-support",
    bgColor: "bg-support/10"
  },
  {
    title: "Progress Analytics",
    description: "Visualize your improvement over time with detailed charts and performance metrics.",
    icon: BarChart3,
    href: "/analytics",
    color: "text-info",
    bgColor: "bg-info/10"
  },
  {
    title: "AI Preparation Guide",
    description: "Get personalized study plans and preparation strategies based on your interview history.",
    icon: Brain,
    href: "/preparation",
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Quick setup and instant insights to accelerate your job search"
  },
  {
    icon: Shield,
    title: "Privacy First", 
    description: "Your data is encrypted and never shared with third parties"
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Streamline your preparation and focus on what matters most"
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 mx-auto max-w-7xl">
      {/* Features Grid */}
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          Everything You Need to <span className="text-gradient">Succeed</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Comprehensive tools designed to turn your interview process into a strategic advantage
        </motion.p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full p-6 group hover:shadow-lg transition-all duration-300 border-0 gradient-card">
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 flex-1">
                  {feature.description}
                </p>
                
                <Button variant="ghost" size="sm" className="group/btn self-start p-0 h-auto" asChild>
                  <Link to={feature.href}>
                    Learn More 
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h3 className="text-2xl font-bold mb-4">Why Choose IntervuIQ?</h3>
        <p className="text-muted-foreground">Built by job seekers, for job seekers</p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <benefit.icon className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold mb-2">{benefit.title}</h4>
            <p className="text-muted-foreground">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}