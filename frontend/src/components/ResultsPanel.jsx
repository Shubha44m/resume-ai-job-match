import { motion } from 'framer-motion';

const SCORE_COLORS = {
    high: { stroke: '#6366f1', glow: 'rgba(99,102,241,0.6)', label: 'Excellent' },
    medium: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.6)', label: 'Good' },
    low: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.6)', label: 'Needs Work' },
};

function getLevel(score) {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

function ScoreCircle({ score, size = 140, strokeWidth = 10 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const level = getLevel(score);
    const colors = SCORE_COLORS[level];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
                />
            </svg>
            <div className="absolute text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-black text-white"
                >
                    {Math.round(score)}
                </motion.p>
                <p className="text-xs text-gray-400 font-medium">{colors.label}</p>
            </div>
        </div>
    );
}

function MiniScore({ label, score }) {
    const level = getLevel(score);
    const colors = SCORE_COLORS[level];
    return (
        <div className="text-center">
            <ScoreCircle score={score} size={80} strokeWidth={7} />
            <p className="text-xs text-gray-400 mt-2 font-medium">{label}</p>
        </div>
    );
}

function SkillBadge({ skill, type }) {
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${type === 'matched'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
            {type === 'matched' ? '✓' : '✗'} {skill}
        </span>
    );
}

function ListCard({ title, items, icon, colorClass }) {
    return (
        <div className="card">
            <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
                <span className="text-lg">{icon}</span> {title}
            </h3>
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 text-sm text-gray-300"
                    >
                        <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorClass} bg-current/10`}
                            style={{ backgroundColor: 'transparent', border: '1.5px solid currentColor' }}>
                            {i + 1}
                        </span>
                        {item}
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}

export default function ResultsPanel({ result, onAnalyzeAnother }) {
    if (!result) return null;
    const score = result.overall_score;
    const level = getLevel(score);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-4 py-12 space-y-8"
        >
            {/* Header */}
            <div className="text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <p className="text-gray-400 text-sm mb-1">Analysis for</p>
                    <h2 className="text-3xl font-black text-white">{result.job_title || 'Unknown Role'}</h2>
                    {result.company_name && result.company_name !== 'Not specified' && (
                        <p className="text-brand-400 font-medium mt-1">@ {result.company_name}</p>
                    )}
                </motion.div>
            </div>

            {/* Score Row */}
            <div className="card glow text-center">
                <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Overall Match Score</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <ScoreCircle score={score} size={160} />
                    <div className="flex gap-8">
                        <MiniScore label="Skills" score={result.skills_score || 0} />
                        <MiniScore label="Experience" score={result.experience_score || 0} />
                        <MiniScore label="Education" score={result.education_score || 0} />
                    </div>
                </div>
                {result.summary && (
                    <p className="text-gray-300 text-sm max-w-2xl mx-auto mt-6 leading-relaxed border-t border-white/5 pt-5">
                        {result.summary}
                    </p>
                )}
            </div>

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-emerald-400">
                        ✅ Matched Skills <span className="ml-auto text-xs text-gray-500 font-normal">{result.matched_skills?.length || 0} found</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.matched_skills?.map(s => <SkillBadge key={s} skill={s} type="matched" />)}
                    </div>
                </div>
                <div className="card">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-red-400">
                        ❌ Missing Skills <span className="ml-auto text-xs text-gray-500 font-normal">{result.missing_skills?.length || 0} gaps</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.missing_skills?.map(s => <SkillBadge key={s} skill={s} type="missing" />)}
                    </div>
                </div>
            </div>

            {/* Suggestions & ATS */}
            <div className="grid md:grid-cols-2 gap-6">
                <ListCard title="Improvement Suggestions" items={result.suggestions || []} icon="💡" colorClass="text-amber-400" />
                <ListCard title="ATS Optimization Tips" items={result.ats_tips || []} icon="🎯" colorClass="text-brand-400" />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button onClick={onAnalyzeAnother} className="btn-primary px-8 py-3">
                    ↩ Analyze Another Resume
                </button>
            </div>
        </motion.div>
    );
}
