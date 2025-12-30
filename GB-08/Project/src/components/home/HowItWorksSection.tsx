import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  UserPlus, 
  Target, 
  BarChart3, 
  Trophy, 
  ArrowRight,
  CheckCircle 
} from "lucide-react";
import teamPreparingImage from "@/assets/team-preparing.jpg";
import resumeAnalysisImage from "@/assets/resume-analysis.jpg";
import successStoryImage from "@/assets/success-story.jpg";

const steps = [
  {
    number: "01",
    title: "Log Your Interviews",
    description: "Track every interview attempt, round details, and feedback in one organized place.",
    icon: Target,
    image: teamPreparingImage,
    features: ["Round-wise tracking", "Interviewer feedback", "Question logging"]
  },
  {
    number: "02", 
    title: "Analyze Your Performance",
    description: "AI analyzes your patterns and identifies areas for improvement with actionable insights.",
    icon: BarChart3,
    image: resumeAnalysisImage,
    features: ["AI-powered insights", "Gap analysis", "Personalized recommendations"]
  },
  {
    number: "03",
    title: "Prepare Strategically", 
    description: "Get customized preparation plans, practice questions, and targeted skill development.",
    icon: UserPlus,
    image: teamPreparingImage,
    features: ["Custom study plans", "Mock interviews", "Skill-based practice"]
  },
  {
    number: "04",
    title: "Land Your Dream Job",
    description: "Apply with confidence using optimized resumes, cold emails, and proven strategies.",
    icon: Trophy,
    image: successStoryImage,
    features: ["Resume optimization", "Cold email templates", "Interview confidence"]
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="text-gradient">IntervuIQ</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your interview success rate and land your dream job
          </p>
        </motion.div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary/30">
                    {step.number}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + featureIndex * 0.1, duration: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {index < steps.length - 1 && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-8">
                    <span className="text-sm">Next step</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className={index % 2 === 1 ? "lg:col-start-1" : ""}
              >
                <Card className="overflow-hidden border-0 shadow-2xl">
                  <div className="relative">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Floating indicator */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}