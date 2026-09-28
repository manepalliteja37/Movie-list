import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, Compass, Share2, Settings, ShieldCheck, Scale } from 'lucide-react';
import { useMovieStore } from '../../store/useMovieStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  countKey?: 'watchlist' | 'watched';
  isFuture?: boolean;
}

const navItems: NavItem[] = [
  {
    name: 'Watchlist',
    path: '/',
    icon: Bookmark,
    countKey: 'watchlist',
  },
  {
    name: 'Watched',
    path: '/watched',
    icon: CheckCircle2,
    countKey: 'watched',
  },
  {
    name: 'Discover',
    path: '/discover',
    icon: Compass,
  },
  {
    name: 'Share',
    path: '/share',
    icon: Share2,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export const DesktopSidebar: React.FC = () => {
  const { movies } = useMovieStore();
  
  const counts = {
    watchlist: movies.filter((m) => m.status === 'watchlist').length,
    watched: movies.filter((m) => m.status === 'watched').length,
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-[#0E0E14] border-r border-[#20202E] min-h-[calc(100vh-4rem)] p-3 xl:p-4 shrink-0 transition-all">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737380] px-3 mb-2">
        Cinema Room
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : undefined;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `cinema-nav-link flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-[#F5B301] ${
                  isActive
                    ? 'cinema-nav-active bg-[#F5B301] text-[#0A0A0F] font-bold shadow-[0_2px_12px_rgba(245,179,1,0.3)] border border-[#D89D01]'
                    : 'cinema-nav-inactive text-[#A3A392] hover:text-[#F5F5DC] hover:bg-[#14141C] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[#0A0A0F]' : 'text-[#737380] group-hover:text-[#F5B301]'
                      }`}
                    />
                    <span className="tracking-wide font-sans truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {count !== undefined && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-md tabular-nums transition-colors ${
                          isActive
                            ? 'bg-[#0A0A0F]/15 text-[#0A0A0F] font-bold'
                            : 'bg-transparent text-[#737380] border border-[#262638] group-hover:border-[#F5B301]/40 group-hover:text-[#F5B301]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Legal & Footer links */}
      <div className="mt-auto pt-4 border-t border-[#20202E] space-y-3">
        <div className="p-3 rounded-xl bg-[#14141C] border border-[#262638] text-xs text-[#A3A392]">
          <div className="font-poster text-[#F5B301] text-xs tracking-wider mb-1">
            CINEMA ADMIT ONE
          </div>
          <p className="italic text-[11px] leading-relaxed text-[#737380]">
            "Cinema is a matter of what's in the frame and what's out."
          </p>
          <div className="text-[10px] text-[#555566] mt-1">— Martin Scorsese</div>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-[#737380]">
          <Link
            to="/privacy"
            className="hover:text-[#F5B301] transition-colors flex items-center gap-1 focus:outline-none focus:underline"
          >
            <ShieldCheck className="w-3 h-3 text-[#F5B301]" />
            Privacy
          </Link>
          <span>•</span>
          <Link
            to="/terms"
            className="hover:text-[#F5B301] transition-colors flex items-center gap-1 focus:outline-none focus:underline"
          >
            <Scale className="w-3 h-3 text-[#F5B301]" />
            Terms
          </Link>
        </div>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { movies } = useMovieStore();
  
  const counts = {
    watchlist: movies.filter((m) => m.status === 'watchlist').length,
    watched: movies.filter((m) => m.status === 'watched').length,
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-[#20202E] px-2 pb-[env(safe-area-inset-bottom,0px)] h-[calc(4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : undefined;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `mobile-nav-link min-w-[54px] min-h-[44px] flex flex-col items-center justify-center relative py-1 px-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#F5B301] ${
                  isActive
                    ? 'mobile-nav-active bg-[#F5B301] text-[#0A0A0F] font-bold shadow-[0_2px_10px_rgba(245,179,1,0.3)] border border-[#D89D01]'
                    : 'mobile-nav-inactive text-[#737380] hover:text-[#F5F5DC] border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={19} className={`transition-colors ${isActive ? 'text-[#0A0A0F]' : 'currentColor'}`} />
                    {count !== undefined && count > 0 && (
                      <span
                        className={`absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono flex items-center justify-center font-bold shadow-sm ${
                          isActive ? 'bg-[#0A0A0F] text-[#F5B301]' : 'bg-[#C41E3A] text-white'
                        }`}
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'text-[#0A0A0F] font-bold' : ''}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
