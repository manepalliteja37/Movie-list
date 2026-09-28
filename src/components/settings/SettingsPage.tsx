import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Moon,
  Clock,
  Send,
  AlertCircle,
  ShieldCheck,
  Calendar,
  User,
  Type,
  Zap,
  Info,
  Heart,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Youtube,
  Instagram,
  Twitter,
  Github,
  Wrench,
} from 'lucide-react';
import { FilmStripDivider } from '../common/FilmStripDivider';
import { useMovieStore } from '../../store/useMovieStore';
import { TicketButton } from '../common/TicketButton';
import {
  requestNotificationPermission,
  triggerTestNotification,
} from '../../services/notificationService';
import { ThemeOption, FontSizeOption } from '../../types/movie';
import { FilmReelIcon } from '../common/CinematicIcons';

interface SettingsPageProps {
  onShowToast?: (message: string) => void;
  onOpenShortcuts?: () => void;
  onOpenOnboarding?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onShowToast,
  onOpenShortcuts,
  onOpenOnboarding,
}) => {
  const {
    settings,
    updateSettings,
    movies,
    clearAll,
    loadSampleData,
    importMovies,
  } = useMovieStore();

  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [doubleConfirmClear, setDoubleConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Theme changing
  const themes: { id: ThemeOption; name: string; description: string; previewBg: string; border: string }[] = [
    {
      id: 'theatre-dark',
      name: 'Theatre Dark',
      description: 'Classic cinema ambiance with deep charcoal and gold accents',
      previewBg: '#F5F5F0',
      border: '#F5B301',
    },
    {
      id: 'cinema-light',
      name: 'Cinema Light',
      description: 'Parchment and clean daytime studio viewing',
      previewBg: '#F5F5F0',
      border: '#C41E3A',
    },
    {
      id: 'midnight-blue',
      name: 'Midnight Blue',
      description: 'Deep starlight sapphire night cinema',
      previewBg: '#F5F5F0',
      border: '#38BDF8',
    },
    {
      id: 'warm-red',
      name: 'Warm Red',
      description: 'Dramatic velvet cinema auditorium curtains',
      previewBg: '#F5F5F0',
      border: '#FF5A6E',
    },
  ];

  // Font sizes
  const fontSizes: { id: FontSizeOption; label: string }[] = [
    { id: 'small', label: 'Small (14px)' },
    { id: 'medium', label: 'Medium (Default 16px)' },
    { id: 'large', label: 'Large (18px)' },
  ];

  // Export JSON
  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(movies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `movielist_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast?.('Backup JSON downloaded 💾');
  };

  // Import JSON
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const importedCount = await importMovies(parsed);
          onShowToast?.(`Imported ${importedCount} new movie titles! 🎬`);
        } else {
          onShowToast?.('Invalid backup file format. Expected a JSON array of movies.');
        }
      } catch (err) {
        console.error('Import error:', err);
        onShowToast?.('Failed to parse backup JSON file');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Double confirmation clear
  const handleClearTrigger = async () => {
    if (!doubleConfirmClear) {
      setDoubleConfirmClear(true);
      return;
    }

    await clearAll();
    setDoubleConfirmClear(false);
    onShowToast?.('All movie records and history have been cleared 🧹');
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermissionState(perm);
    if (perm === 'granted') {
      onShowToast?.('Notification permissions granted! 🔔');
    } else {
      onShowToast?.('Notifications permission denied by browser');
    }
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const res = await triggerTestNotification(settings.notifications);
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }
      onShowToast?.(res.message);
    } catch {
      onShowToast?.('Could not send test notification');
    } finally {
      setIsSendingTest(false);
    }
  };

  const notifications = settings.notifications;

  const updateNotifPref = (updates: Partial<typeof notifications>) => {
    updateSettings({
      notifications: {
        ...notifications,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5B301]">
            <Settings size={14} />
            <span>Preferences & Settings</span>
          </div>
          <h1 className="font-poster text-3xl sm:text-4xl text-[#F5F5DC] tracking-wider mt-1 drop-shadow-sm">
            CINEMA PREFERENCES
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A392] max-w-xl mt-1">
            Customize theme appearance, release day reminders, typography, and local data backups.
          </p>
        </div>

        {/* Quick action: Onboarding tour & shortcuts */}
        <div className="flex items-center gap-2">
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="px-3 py-1.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-xs font-mono text-[#F5F5DC] hover:text-[#F5B301] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} className="text-[#F5B301]" />
              <span>Hotkeys (?)</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="px-3 py-1.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-xs font-mono text-[#F5F5DC] hover:text-[#F5B301] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-[#F5B301]" />
              <span>Tour</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* ========================================================= */}
        {/* 1. APPEARANCE SECTION */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <FilmStripDivider label="1. APPEARANCE & THEME" animated={false} />

          {/* Theme Selector: 4 Themes */}
          <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301]">
                <Palette size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F5F5DC]">
                  Theatre Lighting Theme
                </div>
                <div className="text-xs text-[#737380]">
                  Select your preferred cinematic ambiance and backdrop
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {themes.map((t) => {
                const isSelected = (settings.theme || 'theatre-dark') === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateSettings({ theme: t.id })}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${isSelected
                      ? 'bg-[#1C1C28] border-[#F5B301] shadow-[0_0_15px_rgba(245,179,1,0.15)] ring-1 ring-[#F5B301]'
                      : 'bg-[#101018] border-[#242436] hover:border-[#38384E]'
                      }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 border flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: t.previewBg,
                        borderColor: t.border,
                      }}
                    >
                      {isSelected && <Check size={14} style={{ color: t.border }} className="stroke-[3]" />}
                    </div>
                    <div>
                      <div className="font-poster text-base text-[#F5F5DC] tracking-wide flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5B301]/20 text-[#F5B301]">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A3A392] leading-tight mt-0.5">
                        {t.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size Preference & Reduce Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size */}
            <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301]">
                  <Type size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F5DC]">
                    Font Size Preference
                  </div>
                  <div className="text-[11px] text-[#737380]">
                    Adjust UI reading scale
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {fontSizes.map((f) => {
                  const isSelected = (settings.fontSize || 'medium') === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateSettings({ fontSize: f.id })}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${isSelected
                        ? 'bg-[#F5B301] text-[#0A0A0F] font-bold border-[#F5B301] shadow-md'
                        : 'bg-[#101018] text-[#A3A392] border-[#242436] hover:text-[#F5F5DC]'
                        }`}
                    >
                      {f.id.charAt(0).toUpperCase() + f.id.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reduce Animations */}
            <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301]">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F5DC]">
                    Reduce Animations
                  </div>
                  <div className="text-[11px] text-[#737380]">
                    Minimize motion for low-spec devices
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.reduceAnimations || false}
                  onChange={(e) => updateSettings({ reduceAnimations: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${settings.reduceAnimations ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${settings.reduceAnimations ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                  >
                    {settings.reduceAnimations ? (
                      <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                    ) : (
                      <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* User Profile Recommender Name */}
          <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301]">
                <User size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F5F5DC]">
                  Cinephile Recommender Name
                </div>
                <div className="text-xs text-[#737380] mt-0.5">
                  Displayed as "Recommended by [You]" on shared tickets and collection passes
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={settings.userName || ''}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder="e.g. Teja, Alex, etc."
                className="w-full bg-[#0A0A0F] border border-[#2c2c40] rounded-xl px-3.5 py-2 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#F5B301] transition-colors"
              />
              <span className="text-xs text-[#737380] shrink-0 font-mono">
                Signed onto all shared tickets
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. NOTIFICATIONS SECTION */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <FilmStripDivider label="2. NOTIFICATIONS & REMINDERS" animated={false} />

          <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
            {/* Master Switch Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#1C1C28] border border-[#28283C] flex items-center justify-center text-[#F5B301]">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F5DC] flex items-center gap-2">
                    <span>Browser Release Alerts</span>
                    {permissionState === 'granted' ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Browser Active
                      </span>
                    ) : permissionState === 'denied' ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C41E3A]/20 text-[#FF5A6E] border border-[#C41E3A]/40">
                        Blocked in Browser
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5B301]/20 text-[#F5B301] border border-[#F5B301]/40">
                        Permission Needed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#737380] mt-0.5">
                    Receive notifications when upcoming watchlist movies release on streaming platforms
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    updateSettings({
                      notificationsEnabled: enabled,
                      notifications: { ...notifications, enabled },
                    });
                    if (enabled && permissionState !== 'granted') {
                      handleRequestPermission();
                    }
                  }}
                  className="sr-only"
                />
                <div
                  className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${settings.notificationsEnabled ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${settings.notificationsEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                  >
                    {settings.notificationsEnabled ? (
                      <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                    ) : (
                      <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </label>
            </div>

            {settings.notificationsEnabled && (
              <div className="pt-4 border-t border-[#20202E] space-y-4">
                {/* Granular Schedule Toggles: Release Day, 3 Days Before, 1 Day Before */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#A3A392] uppercase tracking-wider">
                    Notification Schedule
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0A0A0F] border border-[#20202E] cursor-pointer hover:border-[#383852] transition-colors select-none">
                      <span className="text-xs font-medium text-[#F5F5DC]">On Release Day</span>
                      <input
                        type="checkbox"
                        checked={notifications.notifyOnReleaseDay}
                        onChange={(e) => updateNotifPref({ notifyOnReleaseDay: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${notifications.notifyOnReleaseDay ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${notifications.notifyOnReleaseDay ? 'translate-x-[20px]' : 'translate-x-0'
                            }`}
                        >
                          {notifications.notifyOnReleaseDay ? (
                            <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          ) : (
                            <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0A0A0F] border border-[#20202E] cursor-pointer hover:border-[#383852] transition-colors select-none">
                      <span className="text-xs font-medium text-[#F5F5DC]">1 Day Before</span>
                      <input
                        type="checkbox"
                        checked={notifications.notifyOneDayBefore}
                        onChange={(e) => updateNotifPref({ notifyOneDayBefore: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${notifications.notifyOneDayBefore ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${notifications.notifyOneDayBefore ? 'translate-x-[20px]' : 'translate-x-0'
                            }`}
                        >
                          {notifications.notifyOneDayBefore ? (
                            <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          ) : (
                            <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0A0A0F] border border-[#20202E] cursor-pointer hover:border-[#383852] transition-colors select-none">
                      <span className="text-xs font-medium text-[#F5F5DC]">3 Days Before</span>
                      <input
                        type="checkbox"
                        checked={notifications.notifyThreeDaysBefore}
                        onChange={(e) => updateNotifPref({ notifyThreeDaysBefore: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${notifications.notifyThreeDaysBefore ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${notifications.notifyThreeDaysBefore ? 'translate-x-[20px]' : 'translate-x-0'
                            }`}
                        >
                          {notifications.notifyThreeDaysBefore ? (
                            <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          ) : (
                            <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#20202E] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon size={15} className="text-[#F5B301]" />
                      <span className="text-xs font-semibold text-[#F5F5DC]">
                        Quiet Hours (Do Not Disturb)
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifications.quietHoursEnabled}
                        onChange={(e) => updateNotifPref({ quietHoursEnabled: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 toggle-track ${notifications.quietHoursEnabled ? 'bg-[#F5B301]' : 'bg-[#1E1E2A]'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${notifications.quietHoursEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                            }`}
                        >
                          {notifications.quietHoursEnabled ? (
                            <ChevronLeft size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          ) : (
                            <ChevronRight size={13} className="text-[#1A1A24] stroke-[2.5]" />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>

                  {notifications.quietHoursEnabled && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#A3A392]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#737380]" />
                        <span>Mute from:</span>
                        <input
                          type="time"
                          value={notifications.quietHoursStart}
                          onChange={(e) => updateNotifPref({ quietHoursStart: e.target.value })}
                          className="bg-[#14141C] border border-[#28283C] text-[#F5F5DC] rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span>to:</span>
                        <input
                          type="time"
                          value={notifications.quietHoursEnd}
                          onChange={(e) => updateNotifPref({ quietHoursEnd: e.target.value })}
                          className="bg-[#14141C] border border-[#28283C] text-[#F5F5DC] rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>

                      <span className="text-[11px] text-[#737380] ml-auto">
                        e.g., 11:00 PM – 7:00 AM overnight
                      </span>
                    </div>
                  )}
                </div>

                {/* Test Notification Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <TicketButton
                    onClick={handleTestNotification}
                    variant="gold"
                    size="sm"
                    disabled={isSendingTest}
                  >
                    <Send size={13} className="mr-1 inline" />
                    {isSendingTest ? 'Sending...' : 'Test Notification'}
                  </TicketButton>

                  {permissionState !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-xs font-medium text-[#F5F5DC] hover:text-[#F5B301] transition-colors cursor-pointer"
                    >
                      Enable Browser Permissions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DATA MANAGEMENT (EXPORT, IMPORT, CLEAR) */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <FilmStripDivider label="3. DATA MANAGEMENT & BACKUP" animated={false} />

          <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div>
              <div className="text-sm font-semibold text-[#F5F5DC]">
                Local Storage & Database Sync
              </div>
              <p className="text-xs text-[#737380] mt-0.5">
                Your movie entries are saved persistently in browser IndexedDB (Dexie). Export or restore your collection anytime.
              </p>
            </div>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Export JSON */}
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#F5B301]/50 text-xs font-medium text-[#F5F5DC] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download size={14} className="text-[#F5B301]" />
                <span>Export JSON ({movies.length} titles)</span>
              </button>

              {/* Import JSON */}
              <button
                type="button"
                onClick={handleImportClick}
                className="px-4 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] hover:border-[#38BDF8]/50 text-xs font-medium text-[#F5F5DC] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload size={14} className="text-[#38BDF8]" />
                <span>Import JSON</span>
              </button>

              {/* Load Sample Data */}
              <button
                type="button"
                onClick={async () => {
                  await loadSampleData();
                  onShowToast?.('Sample movies loaded into watchlist 🎬');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#252536] border border-[#28283C] text-xs font-medium text-[#F5F5DC] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} className="text-[#F5B301]" />
                <span>Restore Sample Data</span>
              </button>
            </div>

            {/* Clear all with double confirmation */}
            <div className="pt-4 border-t border-[#20202E]">
              {!doubleConfirmClear ? (
                <button
                  type="button"
                  onClick={() => setDoubleConfirmClear(true)}
                  className="px-4 py-2 rounded-xl bg-[#1C1C28] hover:bg-[#C41E3A]/20 border border-[#28283C] hover:border-[#C41E3A] text-xs font-medium text-[#FF8596] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Clear All Data</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-[#1E0D10] border border-[#C41E3A] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                  <div className="text-xs text-[#FF8596]">
                    <strong className="block font-bold">Double Confirmation Required!</strong>
                    Are you sure? This will erase all {movies.length} movies and history from IndexedDB.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDoubleConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#281418] text-xs text-[#A3A392] hover:text-[#F5F5DC] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClearTrigger}
                      className="px-3.5 py-1.5 rounded-lg bg-[#C41E3A] hover:bg-[#d62443] text-xs font-poster tracking-wider uppercase font-bold text-white shadow-lg cursor-pointer"
                    >
                      Yes, Clear Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. ABOUT SECTION */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <FilmStripDivider label="4. ABOUT & CREDITS" animated={false} />

          <div className="bg-[#14141C] border border-[#28283C] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0F] border border-[#F5B301]/40 flex items-center justify-center text-[#F5B301]">
                  <FilmReelIcon size={22} />
                </div>
                <div>
                  <div className="font-poster text-xl tracking-wider text-[#F5F5DC]">
                    MOVIELIST CINEMATIC WATCHLIST
                  </div>
                  <div className="text-xs text-[#737380] font-mono">
                    Version 2.4.0 (PWA Ready)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PROD
              </span>
            </div>

            <div className="text-xs text-[#A3A392] leading-relaxed space-y-2 border-t border-[#20202E] pt-3">
              <p className="flex items-center gap-1.5 text-[#F5F5DC] font-medium">
                <Heart size={14} className="text-[#C41E3A] fill-[#C41E3A]" />
                <span>Built for movie lovers 🎬</span>
              </p>
              <p>
                Crafted with love for cinephiles tracking theatrical releases, Telugu cinema, international masterworks, anime, and streaming queues in a dark theatre ambiance.
              </p>
            </div>

            <div className="pt-3 border-t border-[#20202E] space-y-3 text-xs text-[#737380]">
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[#A3A392]">Created by</span>
                  <a
                    href="https://www.youtube.com/@telugu_mad_thinker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F5B301] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Telugu Mad Thinker</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>
                  <span className="text-[#3A3A4C]">·</span>
                  <span className="text-[#A3A392]">
                    Assisted by <span className="text-[#4285F4] font-medium">Google AI Studio</span>
                  </span>
                </div>
                <span className="text-[11px] text-[#737380]">
                  All records stored locally in private IndexedDB
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://www.youtube.com/@telugu_mad_thinker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283C] text-[#D0D0DC] hover:text-[#FF0000] hover:border-[#FF0000]/40 transition-colors"
                >
                  <Youtube size={14} className="text-[#FF0000]" />
                  <span>YouTube</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>

                <a
                  href="https://www.instagram.com/telugu_mad_thinker/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283C] text-[#D0D0DC] hover:text-[#E1306C] hover:border-[#E1306C]/40 transition-colors"
                >
                  <Instagram size={14} className="text-[#E1306C]" />
                  <span>Instagram</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>

                <a
                  href="https://x.com/TejaMane37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283C] text-[#D0D0DC] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 transition-colors"
                >
                  <Twitter size={14} className="text-[#1DA1F2]" />
                  <span>Twitter</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>

                <a
                  href="https://www.instructables.com/member/telugu_mad_thinker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283C] text-[#D0D0DC] hover:text-[#FF6600] hover:border-[#FF6600]/40 transition-colors"
                >
                  <Wrench size={14} className="text-[#FF6600]" />
                  <span>Instructables</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>

                <a
                  href="https://github.com/manepalliteja37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#28283C] text-[#D0D0DC] hover:text-[#FFFFFF] hover:border-[#FFFFFF]/40 transition-colors"
                >
                  <Github size={14} className="text-[#E0E0E6]" />
                  <span>GitHub</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
