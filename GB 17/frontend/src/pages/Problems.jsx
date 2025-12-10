import React, { useState } from "react";
import problems from "../assets/problems.json";
import { Link } from "react-router-dom";

const Problems = () => {
  const [selectCategory, setSelectCategory] = useState("All");
  const categories = ["All", ...new Set(problems.map((p) => p.category))];
  const filteredProblems =
    selectCategory === "All"
      ? problems
      : problems.filter((p) => p.category === selectCategory);

  // Get 3 unique random problems
  const randomProblems = [];
  if (problems.length > 0) {
    const uniqueIndices = new Set();
    const limit = Math.min(3, problems.length);
    while (uniqueIndices.size < limit) {
      uniqueIndices.add(Math.floor(Math.random() * problems.length));
    }
    uniqueIndices.forEach(index => randomProblems.push(problems[index]));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trending Problems Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Today's Trending
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{problem.id}
                    </span>
                    <span className="text-sm text-gray-500">Trending</span>
                  </div>
                  <h5 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {problem.title}
                  </h5>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {problem.description}
                  </p>
                  <Link
                    to={`/problemsolve/${problem.id}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Solve Problem
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem List Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
              All Problems
            </h2>
            
            {/* Category Filter (if you want to add it) */}
            <div className="flex items-center space-x-2">
              <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
                Filter by category:
              </label>
              <select
                id="category-select"
                value={selectCategory}
                onChange={(e) => setSelectCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {
                  categories.map((c,i)=>{
                    return <option key={i} value={c}>{c}</option>
                  })
                }
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredProblems.map((p, index) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${index === filteredProblems.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  <div className="flex items-center space-x-4 ">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                      {p.id}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {p.title}
                      </h3>
                      {p.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/problemsolve/${p.id}`}
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Solve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problems;
