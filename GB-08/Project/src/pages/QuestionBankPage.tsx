import { useState } from "react";
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
  BookOpen,
  Search,
  Filter,
  Star,
  ChevronRight,
  Code,
  Users,
  Layers,
  Brain
} from "lucide-react";
import { publicQuestions } from "@/data/dummyData";
import { QuestionDetailModal } from "@/components/questions/QuestionDetailModal";

// Convert public questions to the expected format
const mockQuestions = publicQuestions.map((q, index) => ({
  id: index + 1,
  question: q.question,
  category: q.topics[0] || 'Technical', // Use first topic as category
  difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) as 'Easy' | 'Medium' | 'Hard',
  company: q.company,
  frequency: Math.floor(Math.random() * 40) + 60, // Random frequency 60-99
  topics: q.topics
}));

const categories = [
  { name: "System Design", icon: Layers, count: 124, color: "text-primary" },
  { name: "Algorithms", icon: Code, count: 89, color: "text-secondary" },
  { name: "Behavioral", icon: Users, count: 67, color: "text-accent" },
  { name: "Machine Learning", icon: Brain, count: 45, color: "text-support" },
];

const difficultyColors = {
  Easy: "bg-success text-success-foreground",
  Medium: "bg-warning text-warning-foreground",
  Hard: "bg-error text-error-foreground"
};

export function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuestionClick = (questionId: number) => {
    const question = publicQuestions[questionId - 1];
    if (question) {
      setSelectedQuestion(question);
      setIsModalOpen(true);
    }
  };

  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || question.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
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
          Question Bank
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-muted-foreground"
        >
          Practice with curated questions from top companies with AI-generated solutions
        </motion.p>
      </div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid gap-4 md:grid-cols-4 mb-8"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
          >
            <Card className="p-4 cursor-pointer gradient-card border-0 shadow-md hover:shadow-glow transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} questions</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="System Design">System Design</SelectItem>
            <SelectItem value="Algorithms">Algorithms</SelectItem>
            <SelectItem value="Behavioral">Behavioral</SelectItem>
            <SelectItem value="Machine Learning">Machine Learning</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.05, duration: 0.6 }}
          >
            <Card 
              className="p-6 gradient-card border-0 shadow-md hover:shadow-glow transition-all duration-300 cursor-pointer group"
              onClick={() => handleQuestionClick(question.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors]}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {question.category}
                    </Badge>
                    <Badge variant="outline">
                      {question.company}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm text-muted-foreground">{question.frequency}%</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {question.question}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {question.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="ml-4">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center py-12"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No questions found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more questions
          </p>
        </motion.div>
      )}

      <QuestionDetailModal
        question={selectedQuestion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}