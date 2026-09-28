import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../services/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-[#1C1C28] to-[#14141C] border border-[#F5B301]/40 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg my-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#0A0A0F] border border-[#F5B301]/50 flex items-center justify-center text-[#F5B301] shrink-0">
            <Smartphone size={18} />
          </div>
          <div className="min-w-0">
            <div className="font-poster text-sm text-[#F5F5DC] tracking-wide truncate">
              INSTALL MOVIELIST APP
            </div>
            <div className="text-[11px] text-[#A3A392] truncate">
              Install to home screen for instant offline access & fullscreen cinema mode
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="py-1.5 px-3 rounded-lg bg-[#F5B301] hover:bg-[#ffc629] text-[#0A0A0F] font-poster text-xs tracking-wider uppercase font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#737380] hover:text-[#F5F5DC] p-1 cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-[#14141C] border border-[#28283C] rounded-xl p-3 flex items-center justify-between gap-3 my-2">
          <div className="flex items-center gap-2.5 min-w-0 text-xs text-[#A3A392]">
            <Smartphone size={16} className="text-[#F5B301] shrink-0" />
            <span className="truncate">Install Movielist on your iPhone / iPad</span>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="py-1 px-2.5 rounded-lg bg-[#1C1C28] hover:bg-[#252536] border border-[#333348] text-xs font-mono text-[#F5B301] shrink-0 cursor-pointer"
          >
            How to Install
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#14141C] border border-[#28283C] p-6 shadow-2xl text-[#F5F5DC] space-y-4">
              <h3 className="font-poster text-xl tracking-wider text-[#F5B301]">
                INSTALL ON IPHONE / IPAD
              </h3>
              <div className="text-xs text-[#A3A392] space-y-2.5 leading-relaxed">
                <p>1. Tap the <strong>Share button</strong> (square with arrow up) in Safari’s toolbar.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> in the top right corner.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#1C1C28] text-xs font-semibold text-[#F5F5DC] hover:text-[#F5B301] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
