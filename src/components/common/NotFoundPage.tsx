import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Compass, ArrowLeft } from 'lucide-react';
import { trackPageView } from '../../services/analyticsService';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 - Scene Not Found | Movielist';
    trackPageView('/404');
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-[#12121C]/90 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-black relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C41E3A]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Cinematic icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#C41E3A]/20 to-amber-500/20 border border-[#C41E3A]/30 flex items-center justify-center text-[#F5B301] shadow-inner mb-6">
          <Film className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 bg-[#C41E3A]/20 text-[#C41E3A] border border-[#C41E3A]/30 font-bold text-xs rounded-full uppercase tracking-wider mb-3">
          Error 404 • Missing Frame
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Scene Not Found
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          The cinematic sequence or page you are looking for has been cut from the final reel or moved to a different theater.
        </p>

        {/* Single Clear CTAs */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#C41E3A] to-amber-600 hover:brightness-110 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#C41E3A]/25 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
          >
            <Home className="w-4 h-4" />
            Return to Watchlist
          </Link>

          <Link
            to="/discover"
            className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-sm rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
          >
            <Compass className="w-4 h-4 text-[#F5B301]" />
            Discover Trending Movies
          </Link>
        </div>
      </div>
    </div>
  );
};
