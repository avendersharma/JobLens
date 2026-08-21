import { useLocation, useNavigate } from 'react-router-dom';

interface InterviewQuestion {
  question: string;
  talkingPoint: string;
  category: string;
}

interface InterviewData {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  gapAddressing: InterviewQuestion[];
}

export default function InterviewPrep() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.questions) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-400">No interview questions available.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const questions: InterviewData = state.questions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interview Preparation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Likely questions based on your resume and the job description
          </p>
        </div>
        <button
          onClick={() => {
            console.log('Going back...');
            navigate(-1);
          }}
          className="text-sm text-indigo-400 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Technical Questions */}
      {questions.technical.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-900/50 p-2">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Technical Questions</h2>
              <p className="text-xs text-gray-400">About technologies, tools, and problem-solving</p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.technical.map((q, index) => (
              <div key={index} className="rounded-lg bg-gray-950 border border-gray-800 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                    Q{index + 1}
                  </span>
                  <p className="flex-1 text-sm text-gray-200 leading-relaxed">{q.question}</p>
                </div>
                <div className="ml-9 rounded bg-gray-900 px-3 py-2 border-l-2 border-blue-600">
                  <p className="text-xs text-gray-400 mb-1">💡 Talking Point:</p>
                  <p className="text-xs text-gray-300">{q.talkingPoint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Questions */}
      {questions.behavioral.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-900/50 p-2">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Behavioral Questions</h2>
              <p className="text-xs text-gray-400">STAR format: Situation, Task, Action, Result</p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.behavioral.map((q, index) => (
              <div key={index} className="rounded-lg bg-gray-950 border border-gray-800 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-green-900/50 px-2.5 py-0.5 text-xs font-medium text-green-300">
                    Q{index + 1}
                  </span>
                  <p className="flex-1 text-sm text-gray-200 leading-relaxed">{q.question}</p>
                </div>
                <div className="ml-9 rounded bg-gray-900 px-3 py-2 border-l-2 border-green-600">
                  <p className="text-xs text-gray-400 mb-1">💡 Talking Point:</p>
                  <p className="text-xs text-gray-300">{q.talkingPoint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gap-Addressing Questions */}
      {questions.gapAddressing.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-900/50 p-2">
              <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Gap-Addressing Questions</h2>
              <p className="text-xs text-gray-400">About missing skills or requirements</p>
            </div>
          </div>

          <div className="space-y-3">
            {questions.gapAddressing.map((q, index) => (
              <div key={index} className="rounded-lg bg-gray-950 border border-gray-800 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
                    Q{index + 1}
                  </span>
                  <p className="flex-1 text-sm text-gray-200 leading-relaxed">{q.question}</p>
                </div>
                <div className="ml-9 rounded bg-gray-900 px-3 py-2 border-l-2 border-yellow-600">
                  <p className="text-xs text-gray-400 mb-1">💡 How to Address:</p>
                  <p className="text-xs text-gray-300">{q.talkingPoint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="rounded-xl border border-indigo-800 bg-indigo-900/20 p-6">
        <h3 className="text-sm font-semibold text-indigo-300 mb-3">📝 Interview Tips</h3>
        <ul className="space-y-2 text-xs text-gray-300">
          <li>• Use the STAR method for behavioral questions (Situation → Task → Action → Result)</li>
          <li>• Quantify your achievements with metrics whenever possible</li>
          <li>• For gap questions, emphasize transferable skills and willingness to learn</li>
          <li>• Practice your talking points out loud before the interview</li>
          <li>• Prepare 2-3 questions to ask the interviewer about the role/team</li>
        </ul>
      </div>
    </div>
  );
}
