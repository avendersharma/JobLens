import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  strengths: string[];
  gaps: string[];
}

export default function SkillGapChart({ strengths, gaps }: Props) {
  const data = [
    { name: 'Matched Skills', value: strengths.length, fill: '#22c55e' },
    { name: 'Missing Skills', value: gaps.length, fill: '#ef4444' },
  ];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Skill Gap Overview</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={48}>
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
