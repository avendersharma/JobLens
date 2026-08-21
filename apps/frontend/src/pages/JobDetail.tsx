import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import MatchScoreCard from '../components/MatchScoreCard';
import SkillGapChart from '../components/SkillGapChart';
import SuggestionsReport from '../components/SuggestionsReport';
import CoverLetterModal from '../components/CoverLetterModal';

interface Suggestion {
  missingKeywords: string[];
  sectionsToReorder: any[];
  bulletsToStrengthen: any[];
  skillsToEmphasize: string[];
  contentToExpand: any[];
  contentToCondense: any[];
  overallRecommendation: string;
}

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const resumeId = state?.resumeId || localStorage.getItem('currentResumeId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<any>(null);

  useEffect(() => {
    if (!resumeId || !jobId) {
      navigate('/history');
      return;
    }

    const fetchJobDetail = async () => {
      try {
        const res = await apiRequest(`/history/${resumeId}/${jobId}`);
        const data = await res.json();
        setJobData(data);
        setJobData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [resumeId, jobId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-red-400">{error || 'Job not found'}</div>
        <button
          onClick={() => navigate('/history')}
          className="text-indigo-400 hover:underline text-sm"
        >
          Back to history
        </button>
      </div>
    );
  }

  const { job, match, suggestions, coverLetters, interviewPrep } = jobData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Job Analysis Details</h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyzed on {new Date(job.analyzedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-indigo-400 hover:underline"
          >
            View All History
          </button>
        </div>
      </div>

      {/* Match Results */}
      {match && (
        <>
          <MatchScoreCard
            score={match.score}
            strengths={match.strengths}
            gaps={match.gaps}
            recommendation={match.recommendation}
          />
          <SkillGapChart strengths={match.strengths} gaps={match.gaps} />
        </>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Resume Suggestions</h2>
          <p className="text-sm text-gray-400">
            {suggestions.length} {suggestions.length === 1 ? 'version' : 'versions'} generated
          </p>
          {suggestions.map((suggestion: any, index: number) => (
            <div key={suggestion.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Version {suggestion.version}</h3>
                {suggestion.customPrompt && (
                  <span className="text-xs text-gray-500 italic">"{suggestion.customPrompt}"</span>
                )}
              </div>
              <SuggestionsReport suggestions={suggestion.data} version={suggestion.version} />
            </div>
          ))}
        </div>
      )}

      {/* Cover Letters */}
      {coverLetters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Cover Letters</h2>
          <p className="text-sm text-gray-400">
            {coverLetters.length} {coverLetters.length === 1 ? 'version' : 'versions'} generated
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coverLetters.map((letter: any) => (
              <div
                key={letter.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCoverLetter(letter)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Version {letter.version}</span>
                  {letter.companyName && (
                    <span className="text-xs text-gray-400">{letter.companyName}</span>
                  )}
                </div>
                {letter.customPrompt && (
                  <p className="text-xs text-gray-500 italic mb-2">"{letter.customPrompt}"</p>
                )}
                <p className="text-xs text-gray-400 line-clamp-3">{letter.content}</p>
                <div className="mt-3 text-xs text-indigo-400">Click to view full letter →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Prep */}
      {interviewPrep && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Interview Preparation</h2>
          <button
            onClick={() => navigate('/interview-prep', { state: { questions: interviewPrep.questions } })}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            View Interview Questions
          </button>
        </div>
      )}

      {/* Job Description */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Original Job Description</h2>
        <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{job.jdText}</pre>
      </div>

      {/* Cover Letter Modal */}
      {selectedCoverLetter && (
        <CoverLetterModal
          content={selectedCoverLetter.content}
          companyName={selectedCoverLetter.companyName}
          version={selectedCoverLetter.version}
          onClose={() => setSelectedCoverLetter(null)}
        />
      )}
    </div>
  );
}
