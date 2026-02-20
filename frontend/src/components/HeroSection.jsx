import { motion } from 'framer-motion';
import { FileText, Zap, History, ChevronRight, Sparkles } from 'lucide-react';

const features = [
    { icon: Zap, title: 'AI-Powered Scoring', desc: 'Get an instant match score powered by Google Gemini Pro' },
    { icon: FileText, title: 'Resume Analysis', desc: 'Detailed breakdown of skills, experience, and education fit' },
    { icon: Sparkles, title: 'ATS Optimization', desc: 'Tips to pass Applicant Tracking Systems automatically' },
    { icon: History, title: 'History Dashboard', desc: 'Track all your analyses and progress over time' },
];

export default function HeroSection({ onGetStarted }) {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center max-w-4xl mx-auto relative z-10"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium text-brand-300 mb-8"
                >
                    <Sparkles size={14} className="text-accent-400" />
                    Powered by Google Gemini AI
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                    Land Your <span className="text-gradient">Dream Job</span>
                    <br />with AI Precision
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Upload your resume, paste the job description, and get an instant AI-powered match score,
                    missing skills analysis, and ATS optimization tips.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onGetStarted('analyze')}
                        className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
                    >
                        Analyze My Resume <ChevronRight size={18} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onGetStarted('history')}
                        className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-4"
                    >
                        <History size={18} /> View History
                    </motion.button>
                </div>

                {/* Feature grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            className="card text-center group hover:glow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-600/40 transition-colors">
                                <f.icon size={20} className="text-brand-400" />
                            </div>
                            <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
