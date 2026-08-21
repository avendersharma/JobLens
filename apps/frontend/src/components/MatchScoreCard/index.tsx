interface Props {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export default function MatchScoreCard({ score, strengths, gaps, recommendation }: Props) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const barColor = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
      {/* Score */}
      <div className="flex items-end gap-3">
        <span className={`text-5xl font-bold ${color}`}>{score}%</span>
        <span className="text-gray-400 mb-1 text-sm">match score</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-700">
        <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
      </div>

      {/* Strengths */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Strengths</p>
        <div className="flex flex-wrap gap-2">
          {strengths.map((s) => (
            <span key={s} className="rounded-full bg-green-900/50 px-3 py-1 text-xs text-green-300">
              ✔ {s}
            </span>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Missing Skills</p>
        <div className="flex flex-wrap gap-2">
          {gaps.map((g) => (
            <span key={g} className="rounded-full bg-red-900/50 px-3 py-1 text-xs text-red-300">
              ✖ {g}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-gray-300">
        {recommendation}
      </div>
    </div>
  );
}
