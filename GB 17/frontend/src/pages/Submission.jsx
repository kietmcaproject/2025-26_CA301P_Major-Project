import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Editor from "@monaco-editor/react";

const CodeViewModal = ({ code, language, onClose }) => {
  const [editorReady, setEditorReady] = useState(false);
  if (!code) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            💻 Code Submission ({language})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
        </div>

        <div className="flex-grow bg-gray-900 h-[70vh]">
          {!editorReady && <p className="text-gray-400 p-3">Loading editor...</p>}
          <Editor
            key={code?.slice(0, 20)}
            height="60vh"
            language={language ? language.toLowerCase() : "plaintext"}
            value={code}
            theme="vs-dark"
            onMount={() => setEditorReady(true)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end bg-gray-850">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const Submission = ({ problemId }) => {
  const userId = localStorage.getItem('email');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) {
        toast.warn("Please log in to see your submissions.");
        return;
      };
      setLoading(true);
      let url = `http://localhost:8000/api/submissions/${userId}`;
      if (problemId) url += `?problemId=${problemId}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setSubmissions(data.submissions);
        } else {
          toast.error(data.message || 'Failed to fetch submissions.');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('An error occurred while fetching submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, problemId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleViewClick = (submission) => {
    setSelectedSubmission(submission);
    // console.log(submission);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length > 0 ? submissions.map((sub, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{sub.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sub.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td onClick={() => handleViewClick(sub)} className='px-6 py-4 text-sm font-semibold text-blue-600 hover:underline cursor-pointer'>View Code</td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="text-center py-10 text-gray-500">No submissions for this problem.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <CodeViewModal
          code={selectedSubmission.code}
          language={selectedSubmission.language}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Submission;
