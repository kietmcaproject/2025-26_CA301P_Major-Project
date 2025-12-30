import { motion } from "framer-motion";
import { Heart, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                I
              </div>
              <span className="text-xl font-bold text-gradient">IntervuIQ</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Turn every interview into measurable progress with AI-powered tools 
              for resume analysis, cold emails, and personalized preparation guides.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/interviews" className="hover:text-foreground transition-colors">Interview Tracking</a></li>
              <li><a href="/resume" className="hover:text-foreground transition-colors">Resume Analysis</a></li>
              <li><a href="/email" className="hover:text-foreground transition-colors">Cold Email Generator</a></li>
              <li><a href="/questions" className="hover:text-foreground transition-colors">Question Bank</a></li>
              <li><a href="/analytics" className="hover:text-foreground transition-colors">Analytics</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 IntervuIQ. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-4 sm:mt-0">
            Made with <Heart className="h-4 w-4 text-red-500" /> for job seekers everywhere
          </p>
        </div>
      </div>
    </motion.footer>
  );
}