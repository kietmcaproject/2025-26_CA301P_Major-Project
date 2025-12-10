import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const topics = [
  {
    id: 1,
    name: 'Arrays',
    path: '/topics/arrays',
  },
  {
    id: 2,
    name: 'Strings',
    path: '/topics/strings',
  },
  {
    id: 3,
    name: 'Linked Lists',
    path: '/topics/linked-lists',
  },
  {
    id: 4,
    name: 'Trees',
    path: '/topics/trees',
  },
  {
    id: 5,
    name: 'Graphs',
    path: '/topics/graphs',
  },
];

const Topics = () => {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Data Structures & Algorithms Topics
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Explore various topics, learn the theory, and solve problems to master your skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={topic.path}
              className="group bg-slate-800/50 rounded-xl shadow-lg hover:shadow-cyan-400/20 transition-all duration-300 transform hover:-translate-y-1 border border-slate-800 hover:border-cyan-400"
            >
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300">
                  {topic.name}
                </h3>
                <p className="mt-2 text-slate-400">
                  Detailed explanation and problems for {topic.name}.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
