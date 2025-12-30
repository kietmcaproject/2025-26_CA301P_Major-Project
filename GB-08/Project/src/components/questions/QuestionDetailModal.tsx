import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  User,
  Building2,
  Star,
  Clock,
  Code,
  Lightbulb,
  BookOpen,
  Copy
} from "lucide-react";

interface QuestionDetail {
  id: string;
  question: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  company: string;
  role: string;
  date: string;
  round: string;
  interviewer?: string;
  yourAnswer?: string;
  feedback?: string;
  isPublic: boolean;
}

interface QuestionDetailModalProps {
  question: QuestionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const difficultyColors = {
  easy: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground", 
  hard: "bg-error text-error-foreground"
};

// Mock solutions and hints
const mockSolution = {
  approach: "This problem can be solved using a sliding window approach with a HashMap to track character positions.",
  timeComplexity: "O(n) where n is the length of the string",
  spaceComplexity: "O(min(m,n)) where m is the size of the charset",
  code: `def lengthOfLongestSubstring(s):
    char_map = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_map and char_map[s[right]] >= left:
            left = char_map[s[right]] + 1
        
        char_map[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length`,
  explanation: "We use two pointers (left and right) to maintain a sliding window. When we encounter a duplicate character, we move the left pointer to skip the duplicate.",
  hints: [
    "Think about using two pointers to maintain a window",
    "Use a HashMap to store character positions",
    "When you find a duplicate, how do you adjust the window?",
    "Remember to update the maximum length found so far"
  ]
};

export function QuestionDetailModal({ question, isOpen, onClose }: QuestionDetailModalProps) {
  if (!question) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold mb-2">{question.question}</div>
              <div className="flex flex-wrap gap-2">
                <Badge className={difficultyColors[question.difficulty]}>
                  {question.difficulty}
                </Badge>
                <Badge variant="outline">{question.company}</Badge>
                <Badge variant="outline">{question.round}</Badge>
                {question.isPublic && (
                  <Badge variant="secondary">Public</Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Question Context */}
            <Card className="p-6 gradient-card border-0">
              <h3 className="text-lg font-semibold mb-4">Interview Context</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Company: </span>
                    {question.company}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Role: </span>
                    {question.role}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Date: </span>
                    {new Date(question.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Round: </span>
                    {question.round}
                  </span>
                </div>
                {question.interviewer && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Interviewer: </span>
                      {question.interviewer}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Topics */}
            <Card className="p-6 gradient-card border-0">
              <h3 className="text-lg font-semibold mb-4">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {question.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Your Answer */}
            {question.yourAnswer && (
              <Card className="p-6 gradient-card border-0">
                <h3 className="text-lg font-semibold mb-4">Your Approach</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{question.yourAnswer}</p>
                </div>
              </Card>
            )}

            {/* Feedback */}
            {question.feedback && (
              <Card className="p-6 gradient-card border-0">
                <h3 className="text-lg font-semibold mb-4">Interviewer Feedback</h3>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <p className="text-sm text-success">{question.feedback}</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="solution" className="space-y-6 mt-6">
            <Card className="p-6 gradient-card border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Optimal Solution</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mockSolution.code)}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Approach:</h4>
                  <p className="text-sm text-muted-foreground">{mockSolution.approach}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Time Complexity:</h4>
                    <p className="text-sm text-muted-foreground">{mockSolution.timeComplexity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Space Complexity:</h4>
                    <p className="text-sm text-muted-foreground">{mockSolution.spaceComplexity}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Implementation:</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{mockSolution.code}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Explanation:</h4>
                  <p className="text-sm text-muted-foreground">{mockSolution.explanation}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="hints" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card border-0">
              <h3 className="text-lg font-semibold mb-4">Progressive Hints</h3>
              <div className="space-y-4">
                {mockSolution.hints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">Hint {index + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="discussion" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card border-0">
              <h3 className="text-lg font-semibold mb-4">Related Questions</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                  <h4 className="font-medium text-sm mb-1">Longest Palindromic Substring</h4>
                  <p className="text-xs text-muted-foreground">Similar sliding window approach</p>
                </div>
                <div className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                  <h4 className="font-medium text-sm mb-1">Minimum Window Substring</h4>
                  <p className="text-xs text-muted-foreground">Advanced sliding window technique</p>
                </div>
                <div className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                  <h4 className="font-medium text-sm mb-1">Contains Duplicate II</h4>
                  <p className="text-xs text-muted-foreground">HashMap with window constraints</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-0">
              <h3 className="text-lg font-semibold mb-4">Alternative Approaches</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Brute Force (O(n³))</h4>
                  <p className="text-xs text-muted-foreground">Check all substrings - not optimal but good for understanding</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Optimized Sliding Window (O(n))</h4>
                  <p className="text-xs text-muted-foreground">Current optimal approach using HashMap</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}