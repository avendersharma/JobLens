import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

interface JobHistoryItem {
  jobId: string;
  resumeId: string;
  resumeFilename: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  analyzedAt: string;
  hasSuggestions: boolean;
  hasCoverLetter: boolean;
  hasInterviewPrep: boolean;
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch ALL jobs across all resumes
        const res = await apiRequest('/history/all');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-400">{error}</div>
        <button
          onClick={() => navigate('/upload')}
          className="text-indigo-400 hover:underline text-sm"
        >
          Go back to upload
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-gray-400">No job analyses yet.</p>
        <button
          onClick={() => navigate('/upload')}
          className="text-indigo-400 hover:underline text-sm"
        >
          Analyze your first job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Job Analysis History</h1>
          <p className="text-sm text-gray-400 mt-1">
            {history.length} {history.length === 1 ? 'job' : 'jobs'} analyzed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Analyze New Job
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.jobId}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/history/${item.jobId}`, { state: { resumeId: item.resumeId } })}
          >
            {/* Job Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.jobTitle}
                </h3>
                {item.company && (
                  <p className="text-sm text-gray-400">{item.company}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    📄 {item.resumeFilename}
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">
                    Analyzed {new Date(item.analyzedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(item.matchScore)}`}>
                  {item.matchScore}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Match</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs">
              {item.hasSuggestions && (
                <span className="flex items-center gap-1 text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI Suggestions
                </span>
              )}
              {item.hasCoverLetter && (
                <span className="flex items-center gap-1 text-blue-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cover Letter
                </span>
              )}
              {item.hasInterviewPrep && (
                <span className="flex items-center gap-1 text-purple-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Interview Prep
                </span>
              )}
            </div>

            {/* Skill Gaps Preview */}
            {item.gaps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Missing Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {item.gaps.slice(0, 5).map((gap, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-red-900/30 px-3 py-1 text-xs text-red-300"
                    >
                      {gap}
                    </span>
                  ))}
                  {item.gaps.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{item.gaps.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* View Details Arrow */}
            <div className="mt-4 flex items-center justify-end text-sm text-indigo-400">
              View Details
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
