import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, ChevronRight, Loader2, ClipboardPaste } from 'lucide-react';
import { analyzeResume } from '../api/client';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.doc,.docx,.txt';

export default function AnalyzeForm({ onResult }) {
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setResumeFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobDesc.trim()) return toast.error('Please paste the job description');
        if (mode === 'upload' && !resumeFile) return toast.error('Please upload a resume file');
        if (mode === 'paste' && !resumeText.trim()) return toast.error('Please paste your resume text');

        setLoading(true);
        try {
            const result = await analyzeResume({
                resumeFile: mode === 'upload' ? resumeFile : null,
                resumeText: mode === 'paste' ? resumeText : null,
                jobDescription: jobDesc,
            });
            onResult(result);
            toast.success('Analysis complete!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto px-4 py-12"
        >
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black mb-3">
                    <span className="text-gradient">Analyze</span> Your Resume
                </h2>
                <p className="text-gray-400">Upload your resume and paste the job description to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                {/* Resume Input */}
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {['upload', 'paste'].map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'glass text-gray-400 hover:text-white'
                                    }`}
                            >
                                {m === 'upload' ? '📎 Upload File' : '📝 Paste Text'}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'upload' ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${dragging ? 'border-brand-400 bg-brand-600/10' : 'border-gray-700 hover:border-brand-600/60'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept={ACCEPTED}
                                    className="hidden"
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />
                                {resumeFile ? (
                                    <div className="space-y-2">
                                        <FileText size={40} className="mx-auto text-brand-400" />
                                        <p className="font-semibold text-white">{resumeFile.name}</p>
                                        <p className="text-xs text-gray-500">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                                            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                                        >
                                            <X size={14} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload size={40} className="mx-auto text-gray-600" />
                                        <p className="text-gray-300 font-medium">Drop your resume here</p>
                                        <p className="text-gray-500 text-sm">PDF, DOCX, or TXT • Max 16MB</p>
                                        <span className="inline-block btn-secondary text-sm py-2 px-4">Browse files</span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="paste"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <div className="relative">
                                    <ClipboardPaste size={16} className="absolute top-3 right-3 text-gray-600" />
                                    <textarea
                                        value={resumeText}
                                        onChange={e => setResumeText(e.target.value)}
                                        rows={14}
                                        placeholder="Paste your resume text here..."
                                        className="input-field resize-none text-sm leading-relaxed"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Job Description */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <FileText size={14} className="text-accent-400" />
                        Job Description
                    </label>
                    <textarea
                        value={jobDesc}
                        onChange={e => setJobDesc(e.target.value)}
                        rows={mode === 'upload' ? 16 : 14}
                        placeholder="Paste the full job description here...&#10;&#10;Include title, requirements, responsibilities, and qualifications for the best analysis."
                        className="input-field resize-none text-sm leading-relaxed"
                    />
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex justify-center pt-2">
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={loading ? {} : { scale: 1.04 }}
                        whileTap={loading ? {} : { scale: 0.96 }}
                        className="btn-primary flex items-center gap-3 text-base px-10 py-4 min-w-[220px] justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing with AI...
                            </>
                        ) : (
                            <>
                                Analyze Resume
                                <ChevronRight size={20} />
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
