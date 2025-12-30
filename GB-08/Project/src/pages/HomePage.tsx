import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { AnimatedStats } from "@/components/home/AnimatedStats";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <HeroSection />
      <AnimatedStats />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSlider />
      <Footer />
    </motion.div>
  );
}