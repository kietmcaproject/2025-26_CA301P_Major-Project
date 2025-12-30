// Comprehensive dummy data for all features

export interface InterviewRound {
  id: string;
  name: string;
  type: 'coding' | 'system-design' | 'behavioral' | 'cultural' | 'technical';
  status: 'completed' | 'scheduled' | 'pending';
  date?: string;
  duration?: string;
  interviewer?: string;
  feedback?: string;
  personalExperience?: string;
  questions: InterviewQuestion[];
  confidence: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  yourAnswer?: string;
  feedback?: string;
  isPublic: boolean;
}

export interface DetailedInterview {
  id: string;
  company: string;
  role: string;
  date: string;
  status: 'offer' | 'rejected' | 'pending' | 'interviewing';
  overallStatus: string;
  location: string;
  salary?: string;
  rounds: InterviewRound[];
  overallFeedback: string;
  nextSteps?: string;
  hrContact?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  suggestedBullets: string[];
  atsScore: number;
  skillGaps: {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    resources: {
      type: 'course' | 'project' | 'article' | 'video';
      title: string;
      url: string;
      provider: string;
    }[];
  }[];
}

export interface ColdEmailData {
  subject: string;
  body: string;
  improvements: string[];
  qualityScore: number;
  hrEmail?: string;
  personalizedElements: string[];
}

export const detailedInterviews: DetailedInterview[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Software Engineer L4',
    date: '2024-01-15',
    status: 'offer',
    overallStatus: 'Accepted - Starting March 2024',
    location: 'Mountain View, CA',
    salary: '$180,000 + equity',
    overallFeedback: 'Strong technical skills with excellent system design knowledge. Great cultural fit with collaborative approach.',
    nextSteps: 'Offer accepted, waiting for start date confirmation',
    hrContact: {
      name: 'Sarah Chen',
      email: 'sarah.chen@google.com',
      phone: '+1-650-253-4567'
    },
    rounds: [
      {
        id: '1-1',
        name: 'Phone Screen',
        type: 'coding',
        status: 'completed',
        date: '2024-01-08',
        duration: '45 mins',
        interviewer: 'John Smith - Senior SWE',
        confidence: 85,
        feedback: 'Excellent problem-solving approach. Clean code with good optimization. Strong communication.',
        personalExperience: 'Felt confident throughout. The interviewer was very friendly and provided helpful hints when I got stuck.',
        questions: [
          {
            id: '1-1-1',
            question: 'Implement a function to find the longest substring without repeating characters',
            topics: ['Sliding Window', 'Hash Maps', 'String Processing'],
            difficulty: 'medium',
            yourAnswer: 'Used sliding window approach with HashMap to track character positions',
            feedback: 'Perfect solution with optimal time complexity O(n)',
            isPublic: true
          },
          {
            id: '1-1-2', 
            question: 'Follow-up: How would you handle Unicode characters?',
            topics: ['Unicode', 'Edge Cases'],
            difficulty: 'medium',
            yourAnswer: 'Discussed using character codes and handling multi-byte characters',
            feedback: 'Good understanding of edge cases',
            isPublic: true
          }
        ]
      },
      {
        id: '1-2',
        name: 'Technical Interview 1',
        type: 'coding',
        status: 'completed', 
        date: '2024-01-10',
        duration: '60 mins',
        interviewer: 'Maria Garcia - Staff SWE',
        confidence: 80,
        feedback: 'Strong algorithmic thinking. Could improve on explaining time complexity upfront.',
        personalExperience: 'More challenging than phone screen. Had to think through multiple approaches.',
        questions: [
          {
            id: '1-2-1',
            question: 'Design and implement a LRU Cache',
            topics: ['Data Structures', 'Hash Maps', 'Doubly Linked List'],
            difficulty: 'medium',
            yourAnswer: 'Implemented using HashMap + Doubly Linked List for O(1) operations',
            feedback: 'Excellent implementation, clean code structure',
            isPublic: true
          }
        ]
      },
      {
        id: '1-3',
        name: 'System Design',
        type: 'system-design',
        status: 'completed',
        date: '2024-01-12',
        duration: '45 mins', 
        interviewer: 'David Kim - Principal Engineer',
        confidence: 90,
        feedback: 'Outstanding system design skills. Great understanding of scalability and trade-offs.',
        personalExperience: 'This was my strongest round. Drew detailed diagrams and discussed multiple approaches.',
        questions: [
          {
            id: '1-3-1',
            question: 'Design a URL shortener like bit.ly that can handle 100M URLs per day',
            topics: ['System Design', 'Distributed Systems', 'Databases', 'Caching'],
            difficulty: 'hard',
            yourAnswer: 'Discussed load balancers, database sharding, caching strategies, and monitoring',
            feedback: 'Comprehensive design with excellent scalability considerations',
            isPublic: true
          }
        ]
      },
      {
        id: '1-4',
        name: 'Behavioral',
        type: 'behavioral',
        status: 'completed',
        date: '2024-01-15',
        duration: '30 mins',
        interviewer: 'Lisa Park - Engineering Manager',
        confidence: 85,
        feedback: 'Great examples of leadership and collaboration. Strong cultural fit.',
        personalExperience: 'Used STAR method for all answers. Felt like a natural conversation.',
        questions: [
          {
            id: '1-4-1',
            question: 'Tell me about a time you had to work with a difficult team member',
            topics: ['Leadership', 'Conflict Resolution', 'Communication'],
            difficulty: 'medium',
            yourAnswer: 'Shared example about resolving technical disagreements through data-driven discussions',
            feedback: 'Excellent approach to conflict resolution',
            isPublic: true
          },
          {
            id: '1-4-2',
            question: 'Describe a project where you had to learn a new technology quickly',
            topics: ['Learning Agility', 'Adaptability'],
            difficulty: 'medium',
            yourAnswer: 'Discussed learning React Native for mobile project within 2 weeks',
            feedback: 'Shows strong learning ability and ownership',
            isPublic: true
          }
        ]
      }
    ]
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Senior Software Engineer',
    date: '2024-01-10',
    status: 'rejected',
    overallStatus: 'Rejected after 3rd round - Strong technical skills but looking for more system design experience',
    location: 'Seattle, WA',
    overallFeedback: 'Technical coding was excellent, but need more experience with large-scale distributed systems.',
    nextSteps: 'Apply again in 6 months after gaining more system design experience',
    hrContact: {
      name: 'Mike Johnson',
      email: 'mike.johnson@microsoft.com'
    },
    rounds: [
      {
        id: '2-1',
        name: 'Phone Screen',
        type: 'coding',
        status: 'completed',
        date: '2024-01-05',
        duration: '45 mins',
        interviewer: 'Rachel Green - Senior SWE',
        confidence: 88,
        feedback: 'Excellent coding skills and problem-solving approach.',
        personalExperience: 'Went very smoothly, solved both problems efficiently.',
        questions: [
          {
            id: '2-1-1',
            question: 'Find all anagrams in a string array',
            topics: ['Hash Maps', 'String Ping', 'Grouping'],
            difficulty: 'medium',
            yourAnswer: 'Used HashMap with sorted strings as keys to group anagrams',
            feedback: 'Perfect solution with clean implementation',
            isPublic: true
          }
        ]
      },
      {
        id: '2-2',
        name: 'Technical Interview',
        type: 'coding',
        status: 'completed',
        date: '2024-01-08',
        duration: '60 mins',
        interviewer: 'Alex Turner - Principal SWE',
        confidence: 75,
        feedback: 'Good coding but struggled with optimization discussion.',
        personalExperience: 'Got the solution but took longer than expected to optimize.',
        questions: [
          {
            id: '2-2-1',
            question: 'Design a data structure for storing and querying intervals',
            topics: ['Data Structures', 'Interval Trees', 'Binary Search'],
            difficulty: 'hard',
            yourAnswer: 'Initially suggested simple array, then moved to interval tree approach',
            feedback: 'Eventually got to correct solution but needed guidance',
            isPublic: false
          }
        ]
      },
      {
        id: '2-3',
        name: 'System Design',
        type: 'system-design',
        status: 'completed',
        date: '2024-01-10',
        duration: '45 mins',
        interviewer: 'Chris Martinez - Staff Engineer',
        confidence: 60,
        feedback: 'Basic understanding but lacks depth in distributed systems concepts.',
        personalExperience: 'This was challenging. I struggled with scalability questions and load balancing.',
        questions: [
          {
            id: '2-3-1',
            question: 'Design a real-time chat system like WhatsApp',
            topics: ['System Design', 'WebSockets', 'Message Queues'],
            difficulty: 'hard',
            yourAnswer: 'Discussed basic architecture but missed key scalability considerations',
            feedback: 'Need more depth in distributed systems and real-time communication',
            isPublic: false
          }
        ]
      }
    ]
  },
  {
    id: '3',
    company: 'Amazon',
    role: 'Principal Engineer',
    date: '2024-01-08',
    status: 'pending',
    overallStatus: 'Waiting for final round - Leadership Principles interview scheduled',
    location: 'Seattle, WA',
    overallFeedback: 'Strong technical background. Excellent system design skills. Need to demonstrate more leadership examples.',
    nextSteps: 'Final leadership principles interview scheduled for next week',
    hrContact: {
      name: 'Jennifer Liu',
      email: 'jennifer.liu@amazon.com',
      phone: '+1-206-266-1000'
    },
    rounds: [
      {
        id: '3-1',
        name: 'Phone Screen',
        type: 'coding',
        status: 'completed',
        date: '2024-01-02',
        duration: '45 mins',
        interviewer: 'Tom Wilson - Senior SWE',
        confidence: 92,
        feedback: 'Exceptional problem-solving skills and code quality.',
        personalExperience: 'One of my best phone screens. Solved problems quickly and discussed optimizations.',
        questions: [
          {
            id: '3-1-1',
            question: 'Implement a thread-safe singleton pattern',
            topics: ['Design Patterns', 'Concurrency', 'Thread Safety'],
            difficulty: 'medium',
            yourAnswer: 'Implemented double-checked locking pattern with volatile keyword',
            feedback: 'Perfect implementation with excellent explanation of thread safety',
            isPublic: true
          }
        ]
      },
      {
        id: '3-2',
        name: 'System Design',
        type: 'system-design',
        status: 'completed',
        date: '2024-01-05',
        duration: '60 mins',
        interviewer: 'Susan Clark - Principal Engineer',
        confidence: 95,
        feedback: 'Outstanding system design capabilities. Deep understanding of AWS services and trade-offs.',
        personalExperience: 'Felt very confident. Drew comprehensive diagrams and discussed multiple architectural approaches.',
        questions: [
          {
            id: '3-2-1',
            question: 'Design Amazon\'s product recommendation system',
            topics: ['Machine Learning', 'Distributed Systems', 'Real-time Processing'],
            difficulty: 'hard',
            yourAnswer: 'Designed ML pipeline with real-time and batch processing, using collaborative filtering',
            feedback: 'Excellent understanding of ML systems and scalability',
            isPublic: true
          }
        ]
      },
      {
        id: '3-3',
        name: 'Leadership Principles',
        type: 'behavioral',
        status: 'scheduled',
        date: '2024-01-22',
        duration: '60 mins',
        interviewer: 'Robert Davis - Director of Engineering',
        confidence: 80,
        personalExperience: 'Upcoming interview focused on Amazon\'s 16 leadership principles.',
        questions: []
      }
    ]
  }
];

export const resumeAnalysisData: ResumeAnalysis = {
  score: 78,
  atsScore: 85,
  strengths: [
    'Strong technical background with 5+ years of experience',
    'Relevant programming languages (Python, JavaScript, Go)',
    'Leadership experience mentioned with team size',
    'Quantified achievements with metrics',
    'Industry-relevant certifications listed'
  ],
  improvements: [
    'Add cloud platform experience (AWS, Azure, GCP)',
    'Include system design keywords and experience',
    'Mention DevOps/CI-CD pipeline experience',
    'Add mobile development experience if relevant',
    'Include more specific project outcomes'
  ],
  missingKeywords: [
    'Kubernetes', 'Docker', 'Microservices', 'REST APIs',
    'GraphQL', 'Redis', 'Machine Learning', 'Agile/Scrum',
    'AWS', 'System Design', 'Load Balancing'
  ],
  suggestedBullets: [
    '• Architected and deployed scalable microservices using Docker and Kubernetes, handling 10M+ requests daily',
    '• Led cross-functional team of 8 engineers to deliver cloud-native solutions, reducing infrastructure costs by 35%',
    '• Implemented CI/CD pipelines using Jenkins and AWS, reducing deployment time from 2 hours to 15 minutes',
    '• Designed and built REST APIs serving 100K+ daily active users with 99.9% uptime',
    '• Optimized database performance using Redis caching, improving response times by 60%'
  ],
  skillGaps: [
    {
      skill: 'Kubernetes',
      importance: 'high',
      resources: [
        {
          type: 'course',
          title: 'Kubernetes for Developers',
          url: 'https://www.udemy.com/course/kubernetes-for-developers',
          provider: 'Udemy'
        },
        {
          type: 'project',
          title: 'Deploy a microservices app on Kubernetes',
          url: 'https://github.com/kubernetes/examples',
          provider: 'GitHub'
        }
      ]
    },
    {
      skill: 'System Design',
      importance: 'high',
      resources: [
        {
          type: 'course',
          title: 'Grokking the System Design Interview',
          url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
          provider: 'Educative'
        },
        {
          type: 'article',
          title: 'High Scalability Blog',
          url: 'http://highscalability.com/',
          provider: 'HighScalability'
        }
      ]
    },
    {
      skill: 'Machine Learning',
      importance: 'medium',
      resources: [
        {
          type: 'course',
          title: 'Machine Learning Course',
          url: 'https://www.coursera.org/learn/machine-learning',
          provider: 'Coursera'
        },
        {
          type: 'project',
          title: 'Build a recommendation system',
          url: 'https://www.kaggle.com/competitions',
          provider: 'Kaggle'
        }
      ]
    }
  ]
};

export const coldEmailTemplates = [
  {
    id: 1,
    name: 'Software Engineer',
    subject: 'Passionate Software Engineer - {Company} Opportunities',
    performance: 'High',
    responseRate: '24%'
  },
  {
    id: 2,
    name: 'Product Manager',
    subject: 'Product Strategy Discussion - {Company}',
    performance: 'Medium',
    responseRate: '18%'
  },
  {
    id: 3,
    name: 'Data Scientist',
    subject: 'ML/Data Science Expertise for {Company}',
    performance: 'High',
    responseRate: '22%'
  },
  {
    id: 4,
    name: 'Senior Engineer',
    subject: 'Senior Engineering Leadership - {Company}',
    performance: 'High',
    responseRate: '26%'
  }
];

export const generateColdEmail = (formData: any): ColdEmailData => {
  return {
    subject: `Passionate ${formData.role} - ${formData.company} Opportunities`,
    body: `Hi ${formData.recruiterName},

I hope this email finds you well! I'm John Smith, a ${formData.role.toLowerCase()} with 5 years of experience in full-stack development and a passion for building scalable systems.

I've been following ${formData.company}'s innovative work in technology, particularly your recent advances in cloud computing and AI. Your team's commitment to solving complex technical challenges at scale really resonates with my career goals.

In my current role at TechCorp, I've:
• Led the development of microservices handling 10M+ daily requests
• Reduced infrastructure costs by 35% through cloud optimization  
• Mentored a team of 6 junior developers
• Built scalable APIs serving 100K+ daily active users

I'd love to learn more about ${formData.role.toLowerCase()} opportunities at ${formData.company}, particularly in your engineering team. Would you be open to a brief 15-minute conversation about potential openings?

${formData.customMessage ? `\n${formData.customMessage}\n` : ''}
I've attached my resume for your review. Thank you for your time, and I look forward to hearing from you!

Best regards,
John Smith
john.smith@email.com
(555) 123-4567
LinkedIn: linkedin.com/in/johnsmith`,
    improvements: [
      'Consider adding specific company achievements or recent news',
      'Mention mutual connections if any',
      'Include a specific call-to-action with time frame',
      'Add metrics relevant to the target role'
    ],
    qualityScore: 92,
    hrEmail: formData.recruiterEmail || `hr@${formData.company.toLowerCase().replace(/\s+/g, '')}.com`,
    personalizedElements: [
      `Mentioned ${formData.company}'s work in technology`,
      `Tailored experience to ${formData.role} role`,
      `Used ${formData.tone} tone throughout`,
      'Included relevant metrics and achievements'
    ]
  };
};

export const publicQuestions = detailedInterviews
  .flatMap(interview => 
    interview.rounds.flatMap(round => 
      round.questions
        .filter(q => q.isPublic)
        .map(q => ({
          ...q,
          company: interview.company,
          role: interview.role,
          date: round.date || interview.date,
          round: round.name,
          interviewer: round.interviewer
        }))
    )
  );