import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, ArrowLeft, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { trackPageView } from '../../services/analyticsService';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions | Movielist';
    trackPageView('/terms');
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-[#F5B301] transition-colors font-medium bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#F5B301]/30 focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Watchlist
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#161626] to-[#0A0A0F] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F5B301]/15 border border-[#F5B301]/30 flex items-center justify-center text-[#F5B301]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-amber-400 font-medium">
              Last updated: September 27, 2026 • Version 1.0
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-4">
          Welcome to <strong className="text-white">Movielist</strong>. By accessing or using our application, you agree to be bound by these Terms & Conditions. Please read them carefully before using our software.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 text-slate-300 text-sm sm:text-base">
        {/* Section 1 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            1. Acceptable Use & License
          </h2>
          <p className="leading-relaxed text-slate-300">
            Movielist grants you a personal, non-exclusive, non-transferable, revocable license to use the application for tracking personal movie watchlists, managing ratings, and sharing movie cards.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>You agree not to use Movielist for unlawful or malicious purposes.</li>
            <li>You agree not to attempt to reverse engineer, disrupt, or overload public metadata endpoints.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F5B301]" />
            2. Intellectual Property & Third-Party Content
          </h2>
          <p className="leading-relaxed text-slate-300">
            Movie titles, posters, synopses, character names, and trade marks displayed in Movielist belong to their respective copyright owners, movie studios, and distribution platforms (e.g. Disney, Warner Bros., Netflix, Universal, Apple).
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Posters and metadata fetched via Wikipedia, TVMaze, and iTunes are used under fair-use commentary and metadata indexing standards.</li>
            <li>Movielist is an independent application and is not affiliated with or endorsed by any film studio or streaming platform.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C41E3A]" />
            3. Limitation of Liability
          </h2>
          <p className="leading-relaxed text-slate-300">
            Movielist is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Because data is stored locally in your browser's IndexedDB:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Movielist is not responsible for data loss caused by clearing browser cache, hard drive corruption, or device loss.</li>
            <li>Users are strongly advised to use the export backup tool in Settings to retain periodic offline copies of their collections.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-400" />
            4. Service & Terms Updates
          </h2>
          <p className="leading-relaxed text-slate-300">
            We reserve the right to modify these terms at any time. Updated terms will be published directly within the application with an updated revision date. Continued usage of Movielist signifies acceptance of modified terms.
          </p>
        </section>
      </div>

      {/* Bottom CTA Button */}
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          © 2026 Movielist. All rights reserved.
        </p>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#C41E3A] to-amber-600 hover:brightness-110 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#C41E3A]/25 text-center focus:outline-none focus:ring-2 focus:ring-[#F5B301]"
        >
          Return to Watchlist
        </Link>
      </div>
    </div>
  );
};
