import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, ArrowLeft, Eye, Server, Sparkles } from 'lucide-react';
import { trackPageView } from '../../services/analyticsService';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Movielist';
    trackPageView('/privacy');
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C41E3A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C41E3A]/15 border border-[#C41E3A]/30 flex items-center justify-center text-[#C41E3A]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-amber-400 font-medium">
              Last updated: September 27, 2026 • Effective Immediately
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mt-4">
          At <strong className="text-white">Movielist</strong>, your privacy is fundamental to our design. Movielist is architected as an <strong className="text-[#F5B301]">offline-first, client-side application</strong> where your watchlists, custom ratings, and preferences remain privately stored on your own device.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-slate-300 text-sm sm:text-base">
        {/* Section 1 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#F5B301]" />
            1. Client-Side Data Storage (IndexedDB)
          </h2>
          <p className="leading-relaxed text-slate-300">
            All your movie items, watch statuses, custom categories, personal reviews, and notification settings are stored directly in your browser using IndexedDB via Dexie.js. 
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>We do not store your watchlist on remote cloud databases.</li>
            <li>Your data never leaves your browser unless you explicitly perform a manual JSON export.</li>
            <li>Clearing your browser cache or site data will reset your local database (we recommend creating periodic backups in Settings).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            2. AI Smart Fetch & Third-Party APIs
          </h2>
          <p className="leading-relaxed text-slate-300">
            Movielist offers intelligent auto-fill capabilities powered by external movie metadata databases (Wikipedia, Wikidata, TVMaze, iTunes, and optional Google Gemini API):
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Search queries entered in the Add Movie modal are transmitted to public metadata APIs strictly to retrieve title, cast, synopsis, and poster artwork.</li>
            <li>If you supply your own Gemini API Key in Settings, your key is saved locally in encrypted local storage and sent directly to Google Gemini endpoints via secure HTTPS.</li>
            <li>No personal identification data is ever attached to metadata search requests.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            3. Cookies & Local Storage
          </h2>
          <p className="leading-relaxed text-slate-300">
            We use zero advertising or cross-site tracking cookies. We only utilize local storage to store:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Your visual theme preference (Theatre Dark, Cinema Light, Midnight Blue, Warm Red).</li>
            <li>Your cookie consent response (Essential vs. All).</li>
            <li>Anonymous event metrics (if consented) to measure performance and app usage.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-400" />
            4. User Rights & Data Deletion
          </h2>
          <p className="leading-relaxed text-slate-300">
            You retain 100% control over your data. At any point in <Link to="/settings" className="text-[#F5B301] underline hover:text-white">Settings</Link>, you can:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Export your entire library as a structured JSON file.</li>
            <li>Import an existing backup to restore your library.</li>
            <li>Completely wipe all local databases and reset app settings with a single click.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-[#12121C] p-6 rounded-2xl border border-white/5 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            5. Contact & Support
          </h2>
          <p className="leading-relaxed text-slate-300">
            If you have questions about privacy, security, or data handling in Movielist, please reach out via our GitHub repository or contact our team at privacy@movielist.app.
          </p>
        </section>
      </div>

      {/* Bottom CTA Button */}
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          © 2026 Movielist. Built for movie lovers.
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
