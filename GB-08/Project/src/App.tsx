import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InterviewsPage } from "./pages/InterviewsPage";
import { InterviewDetailPage } from "./pages/InterviewDetailPage";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";
import { ColdEmailPage } from "./pages/ColdEmailPage";
import { ColdEmailGeneratorPage } from "./pages/ColdEmailGeneratorPage";
import { QuestionBankPage } from "./pages/QuestionBankPage";
import { ContactPage } from "./pages/ContactPage";
import AddInterviewPage from "./pages/AddInterviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/track-interviews" element={<InterviewsPage />} />
        <Route path="/interviews/:id" element={<InterviewDetailPage />} />
        <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
        <Route path="/cold-email" element={<ColdEmailPage />} />
        <Route path="/cold-email-generator" element={<ColdEmailGeneratorPage />} />
        <Route path="/questions" element={<QuestionBankPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/add-interview" element={<AddInterviewPage />} />
        {/* Legacy routes for backward compatibility */}
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/resume" element={<ResumeAnalysisPage />} />
        <Route path="/email" element={<ColdEmailPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="intervu-iq-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <AnimatedRoutes />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
