import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, RefreshCw, Calendar, Star } from 'lucide-react';
import { getHistory, deleteAnalysis } from '../api/client';
import toast from 'react-hot-toast';

function ScoreBadge({ score }) {
    const color =
        score >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            score >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30';
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
            <Star size={12} /> {Math.round(score)}%
        </span>
    );
}

export default function HistoryDashboard({ onViewResult }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchHistory = async (p = 1) => {
        setLoading(true);
        try {
            const data = await getHistory(p, 9);
            setRecords(data.history);
            setPagination(data);
        } catch {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(page); }, [page]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this analysis?')) return;
        try {
            await deleteAnalysis(id);
            toast.success('Deleted');
            fetchHistory(page);
        } catch {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-black">
                        <span className="text-gradient">History</span> Dashboard
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {pagination.total || 0} analyses completed
                    </p>
                </div>
                <button
                    onClick={() => fetchHistory(page)}
                    className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card h-40 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card text-center py-20 text-gray-500"
                >
                    <p className="text-4xl mb-4">📭</p>
                    <p className="font-semibold text-lg">No analyses yet</p>
                    <p className="text-sm mt-1">Go analyze your first resume!</p>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        layout
                    >
                        <AnimatePresence>
                            {records.map((r, i) => (
                                <motion.div
                                    key={r.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onViewResult(r)}
                                    className="card cursor-pointer hover:glow-sm hover:border-brand-500/40 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                                                {r.job_title || 'Untitled Role'}
                                            </h3>
                                            <p className="text-gray-500 text-sm truncate">{r.company_name || 'Unknown Company'}</p>
                                        </div>
                                        <ScoreBadge score={r.overall_score} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 my-4 text-center">
                                        {[
                                            { label: 'Skills', val: r.skills_score },
                                            { label: 'Exp', val: r.experience_score },
                                            { label: 'Edu', val: r.education_score }
                                        ].map(s => (
                                            <div key={s.label} className="bg-white/5 rounded-lg py-2">
                                                <p className="text-xs text-gray-500">{s.label}</p>
                                                <p className="text-sm font-bold text-white">{Math.round(s.val || 0)}%</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar size={11} />
                                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleDelete(r.id, e)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                            <span className="flex items-center gap-1 text-xs text-brand-400 group-hover:gap-2 transition-all">
                                                View <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => { setPage(p => p - 1); }}
                                disabled={!pagination.has_prev}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
                            >
                                ← Prev
                            </button>
                            <span className="glass rounded-xl px-4 py-2 text-sm text-gray-300">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => { setPage(p => p + 1); }}
                                disabled={!pagination.has_next}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
