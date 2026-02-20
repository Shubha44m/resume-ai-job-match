import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'analyze', label: 'Analyze' },
    { id: 'history', label: 'History' },
];

export default function Navbar({ activePage, onNavigate }) {
    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-5xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <button
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-2 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-black text-white text-lg tracking-tight">
                        Resume<span className="text-gradient">AI</span>
                    </span>
                </button>

                {/* Nav links */}
                <div className="flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activePage === link.id
                                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/40'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>
        </motion.nav>
    );
}
