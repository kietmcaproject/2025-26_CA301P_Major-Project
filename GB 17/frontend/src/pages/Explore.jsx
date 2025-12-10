import React, { useState } from 'react';
import {
  Search, Filter, TrendingUp, Star, Clock, Users, Trophy,
  Code, Zap, BookOpen, Target, Play, ArrowRight, Flame,
  Calendar, Award, ChevronRight, Eye, Heart, MessageSquare,
  Brain, Lightbulb, Globe, Rocket
} from 'lucide-react';

const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with real API calls
  // const featuredProblems = [
  //   {
  //     id: 1,
  //     title: "Two Sum",
  //     difficulty: "Easy",
  //     category: "Arrays",
  //     company: "Meta",
  //     solvers: 1240,
  //     likes: 892,
  //     description: "Find two numbers that add up to target",
  //     languages: ["Python", "Java", "C++"],
  //     estimatedTime: "15 min"
  //   },
  //   {
  //     id: 2,
  //     title: "Binary Tree Traversal",
  //     difficulty: "Medium", 
  //     category: "Trees",
  //     company: "Google",
  //     solvers: 756,
  //     likes: 643,
  //     description: "Implement inorder, preorder, and postorder traversal",
  //     languages: ["Java", "Python", "JavaScript"],
  //     estimatedTime: "30 min"
  //   },
  //   {
  //     id: 3,
  //     title: "Dynamic Programming - Knapsack",
  //     difficulty: "Hard",
  //     category: "Dynamic Programming",
  //     company: "Amazon",
  //     solvers: 342,
  //     likes: 298,
  //     description: "Solve the classic 0/1 knapsack problem",
  //     languages: ["C++", "Java", "Python"],
  //     estimatedTime: "45 min"
  //   }
  // ];

  const categories = [
    { name: "Arrays", icon: "🔢", count: 234, color: "from-blue-400 to-blue-600" },
    { name: "Trees", icon: "🌳", count: 156, color: "from-green-400 to-green-600" },
    { name: "Dynamic Programming", icon: "⚡", count: 89, color: "from-purple-400 to-purple-600" },
    { name: "Graphs", icon: "🕸️", count: 112, color: "from-red-400 to-red-600" },
    { name: "Strings", icon: "📝", count: 198, color: "from-yellow-400 to-yellow-600" },
    { name: "Sorting", icon: "🔀", count: 67, color: "from-pink-400 to-pink-600" }
  ];

  const contests = [
    {
      id: 1,
      title: "Weekly Contest 125",
      startTime: "2024-12-15T10:00:00Z",
      duration: "90 minutes",
      participants: 1247,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Biweekly Contest 45",
      startTime: "2024-12-18T15:00:00Z",
      duration: "90 minutes",
      participants: 856,
      status: "upcoming"
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: "Data Structures Fundamentals",
      description: "Master arrays, linked lists, stacks, and queues",
      progress: 0,
      problems: 45,
      duration: "6 weeks",
      level: "Beginner",
      icon: BookOpen
    },
    {
      id: 2,
      title: "Algorithm Design Patterns",
      description: "Learn common algorithmic patterns and techniques",
      progress: 0,
      problems: 67,
      duration: "8 weeks",
      level: "Intermediate",
      icon: Brain
    },
    {
      id: 3,
      title: "Interview Preparation Track",
      description: "Get ready for FAANG interviews",
      progress: 0,
      problems: 150,
      duration: "12 weeks",
      level: "Advanced",
      icon: Target
    }
  ];

  const trendingTopics = [
    { name: "Binary Search", trend: "+15%", problems: 42 },
    { name: "Sliding Window", trend: "+23%", problems: 28 },
    { name: "Two Pointers", trend: "+8%", problems: 35 },
    { name: "Backtracking", trend: "+19%", problems: 31 }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const tabs = [
    { id: 'discover', label: 'Discover', icon: Rocket },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'compete', label: 'Compete', icon: Trophy },
    { id: 'community', label: 'Community', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Explore <span className="text-cyan-400">CodeClash</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover new challenges, learn cutting-edge algorithms, and connect with the coding community
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, topics, or concepts..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-all duration-200 ${activeTab === id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'discover' && (
          <div className="space-y-12">
            {/* Problem Categories */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-1">
                      <div className="text-3xl mb-3">{category.icon}</div>
                      <h3 className="text-white font-medium mb-2">{category.name}</h3>
                      <p className="text-slate-400 text-sm">{category.count} problems</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Topics */}
            <section>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Trending This Week</span>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{topic.name}</h3>
                        <span className="text-green-400 text-sm font-medium">{topic.trend}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{topic.problems} problems</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-12">
            {/* Learning Paths */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Learning Paths</h2>
              <div className="grid lg:grid-cols-3 gap-6">
                {learningPaths.map((path) => {
                  const Icon = path.icon;
                  return (
                    <div key={path.id} className="bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{path.level}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2">{path.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">{path.description}</p>

                      <div className="flex items-center space-x-4 text-xs text-slate-500 mb-4">
                        <span>{path.problems} problems</span>
                        <span>{path.duration}</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">Progress</span>
                          <span className="text-xs text-slate-400">{path.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${path.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Tutorials */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Quick Tutorials</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Big O Notation", duration: "5 min", type: "Concept" },
                  { title: "Binary Search", duration: "8 min", type: "Algorithm" },
                  { title: "Hash Tables", duration: "6 min", type: "Data Structure" },
                  { title: "Recursion Basics", duration: "10 min", type: "Technique" }
                ].map((tutorial, index) => (
                  <div key={index} className="bg-slate-900 rounded-xl border border-slate-700 hover:border-slate-600 p-4 cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Play className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs text-slate-400">{tutorial.type}</span>
                    </div>
                    <h3 className="text-white font-medium mb-2">{tutorial.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{tutorial.duration}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Compete Tab */}
        {activeTab === 'compete' && (
          <div className="space-y-12">
            {/* Upcoming Contests */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Upcoming Contests</h2>
              <div className="space-y-4">
                {contests.map((contest) => (
                  <div key={contest.id} className="bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{contest.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Dec 15, 10:00 AM UTC</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{contest.duration}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{contest.participants} registered</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Leaderboards */}
            <section>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span>Global Rankings</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "CodeMaster2024", score: 2847, change: "+15" },
                      { rank: 2, name: "AlgorithmNinja", score: 2789, change: "+8" },
                      { rank: 3, name: "DataStructureGuru", score: 2734, change: "-2" }
                    ].map((user) => (
                      <div key={user.rank} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.rank === 1 ? 'bg-yellow-500 text-black' :
                              user.rank === 2 ? 'bg-gray-400 text-black' :
                                user.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-600 text-white'
                            }`}>
                            {user.rank}
                          </span>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{user.score}</div>
                          <div className={`text-xs ${user.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {user.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>Weekly Champions</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "Problem Solver", problems: 47, streak: 12 },
                      { name: "Code Warrior", problems: 39, streak: 8 },
                      { name: "Debug Master", problems: 35, streak: 6 }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{user.problems} problems</div>
                          <div className="text-xs text-orange-400">{user.streak} day streak</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-12">
            {/* Discussion Highlights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Popular Discussions</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Best approach for solving dynamic programming problems?",
                    author: "AlgorithmLover",
                    replies: 23,
                    likes: 45,
                    timeAgo: "2 hours ago",
                    tags: ["Dynamic Programming", "Tips"]
                  },
                  {
                    title: "How to optimize recursive solutions?",
                    author: "CodeOptimizer",
                    replies: 18,
                    likes: 32,
                    timeAgo: "4 hours ago",
                    tags: ["Recursion", "Optimization"]
                  },
                  {
                    title: "Interview experience at Google - preparation tips",
                    author: "TechInterviewer",
                    replies: 67,
                    likes: 124,
                    timeAgo: "1 day ago",
                    tags: ["Interview", "Google", "Experience"]
                  }
                ].map((discussion, index) => (
                  <div key={index} className="bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 cursor-pointer transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{discussion.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                          <span>by {discussion.author}</span>
                          <span>{discussion.timeAgo}</span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{discussion.replies} replies</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{discussion.likes}</span>
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {discussion.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Study Groups */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Active Study Groups</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "FAANG Interview Prep",
                    members: 234,
                    activity: "Very Active",
                    focus: "Interview Preparation",
                    nextSession: "Tomorrow 7PM UTC"
                  },
                  {
                    name: "Competitive Programming Beginners",
                    members: 156,
                    activity: "Active",
                    focus: "Contest Problems",
                    nextSession: "Sunday 2PM UTC"
                  },
                  {
                    name: "Data Structures Deep Dive",
                    members: 89,
                    activity: "Moderate",
                    focus: "Advanced DS",
                    nextSession: "Friday 6PM UTC"
                  }
                ].map((group, index) => (
                  <div key={index} className="bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${group.activity === 'Very Active' ? 'bg-green-400/10 text-green-400' :
                          group.activity === 'Active' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-slate-400/10 text-slate-400'
                        }`}>
                        {group.activity}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-400 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Members:</span>
                        <span className="text-white">{group.members}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Focus:</span>
                        <span className="text-white">{group.focus}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next Session:</span>
                        <span className="text-cyan-400">{group.nextSession}</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200">
                      Join Group
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
