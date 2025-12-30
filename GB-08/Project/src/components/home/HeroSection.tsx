import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Target, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-interview.jpg";

export function HeroSection() {
  const stats = [
    { label: "Interviews Tracked", value: "25,000+", icon: Target },
    { label: "Success Rate", value: "85%", icon: TrendingUp },
    { label: "Active Users", value: "5,000+", icon: Users },
  ];

  return (
    <section className="relative px-4 py-24 mx-auto max-w-7xl lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 gradient-hero rounded-3xl" />
      
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground mb-6"
          >
            🚀 AI-Powered Interview Preparation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Master Interviews with{" "}
            <span className="text-gradient">Confidence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl"
          >
            Turn every interview into measurable progress with AI-powered tools 
            for resume analysis, cold emails, and personalized preparation guides. 
            Track your journey and land your dream job faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button size="lg" className="group gap-2 animate-glow-pulse" asChild>
              <Link to="/interviews">
                Start Tracking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border"
          >
            <img 
              src={heroImage} 
              alt="Professional interview scene"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            
            {/* Overlay Analytics Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">Interview Progress</h3>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div 
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 1.5, duration: 1.5 }}
                  />
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div 
                    className="bg-secondary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 2, duration: 1.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -top-6 -right-6 w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center backdrop-blur"
          >
            <TrendingUp className="w-8 h-8 text-secondary" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur"
          >
            <Users className="w-10 h-10 text-accent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}