import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Users, Globe, Globe2, Monitor, Smartphone, Tablet,
  TrendingUp, Clock, Eye, Zap, RefreshCw,
  ChevronDown, ChevronUp,
  Activity, BarChart2, ArrowUpRight, Wifi
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisitorSession {
  id: string;
  visitor_id: string;
  session_id: string;
  ip_address: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  device_type: string | null;
  screen_width: number | null;
  screen_height: number | null;
  language: string | null;
  traffic_source: string | null;
  referrer: string | null;
  landing_page: string | null;
  page_count: number;
  duration_seconds: number;
  started_at: string;
  last_seen: string;
  ended_at: string | null;
  timezone: string | null;
}

interface PageView {
  id: string;
  session_id: string;
  page_name: string;
  page_title: string | null;
  entered_at: string;
  exited_at: string | null;
  time_on_page: number | null;
}

interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  page_name: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(secs: number): string {
  if (!secs || secs <= 0) return '—';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function flagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
  );
}

function sourceIcon(source: string | null): string {
  if (!source) return '🔗';
  const s = source.toLowerCase();
  if (s.includes('google'))   return '🔍';
  if (s.includes('linkedin')) return '💼';
  if (s.includes('twitter') || s.includes('x.com')) return '𝕏';
  if (s.includes('facebook')) return '📘';
  if (s.includes('direct'))   return '⚡';
  if (s.includes('referral')) return '🔗';
  return '🌐';
}

function deviceIcon(type: string | null) {
  if (type === 'Mobile')  return <Smartphone className="w-3.5 h-3.5" />;
  if (type === 'Tablet')  return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home', products: 'Products', solutions: 'Solutions',
  industries: 'Industries', about: 'About', careers: 'Careers',
  contact: 'Contact', lab: 'Lab'
};

// ─── Mini Charts ──────────────────────────────────────────────────────────────
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto" />;

  let offset = 0;
  const radius = 36;
  const cx = 44, cy = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 88 88" className="w-24 h-24 mx-auto -rotate-90">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={16}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={26} fill="white" />
    </svg>
  );
}

function BarMini({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{
    views: PageView[];
    events: AnalyticsEvent[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('today');

  // ── Data Fetch ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);

    const since: string | null = (() => {
      const now = new Date();
      if (range === 'today') { now.setHours(0, 0, 0, 0); return now.toISOString(); }
      if (range === '7d')   { now.setDate(now.getDate() - 7); return now.toISOString(); }
      if (range === '30d')  { now.setDate(now.getDate() - 30); return now.toISOString(); }
      return null;
    })();

    let sessQ = supabase.from('visitor_sessions').select('*').order('started_at', { ascending: false }).limit(500);
    if (since) sessQ = sessQ.gte('started_at', since);

    let pvQ = supabase.from('page_views').select('*').order('entered_at', { ascending: false }).limit(2000);
    if (since) pvQ = pvQ.gte('entered_at', since);

    let evQ = supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(2000);
    if (since) evQ = evQ.gte('created_at', since);

    const [sessRes, pvRes, evRes] = await Promise.all([sessQ, pvQ, evQ]);

    setSessions(sessRes.data || []);
    setPageViews(pvRes.data || []);
    setEvents(evRes.data || []);
    
    // Auto-refresh expanded session details if one is open
    if (expandedSession) {
      const [detPvRes, detEvRes] = await Promise.all([
        supabase.from('page_views').select('*').eq('session_id', expandedSession).order('entered_at'),
        supabase.from('analytics_events').select('*').eq('session_id', expandedSession).order('created_at'),
      ]);
      setSessionDetails({ views: detPvRes.data || [], events: detEvRes.data || [] });
    }

    setLastRefresh(new Date());
    setLoading(false);
  }, [range, expandedSession]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(fetchData, 60_000);
    return () => clearInterval(t);
  }, [fetchData]);

  // ── Session Detail ────────────────────────────────────────────────────────
  const toggleSessionDetail = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSessionDetails(null);
      return;
    }
    setExpandedSession(sessionId);
    setDetailLoading(true);

    const [pvRes, evRes] = await Promise.all([
      supabase.from('page_views').select('*').eq('session_id', sessionId).order('entered_at'),
      supabase.from('analytics_events').select('*').eq('session_id', sessionId).order('created_at'),
    ]);

    setSessionDetails({ views: pvRes.data || [], events: evRes.data || [] });
    setDetailLoading(false);
  };

  // ── Computed Stats ────────────────────────────────────────────────────────
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const liveCount = sessions.filter(s => s.last_seen >= twoMinsAgo).length;

  const uniqueVisitors = new Set(sessions.map(s => s.visitor_id)).size;
  const totalPageViews = pageViews.length;
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length)
    : 0;

  // Countries
  const countryCounts = sessions.reduce<Record<string, { count: number; code: string | null }>>((acc, s) => {
    if (!s.country) return acc;
    if (!acc[s.country]) acc[s.country] = { count: 0, code: s.country_code };
    acc[s.country].count++;
    return acc;
  }, {});
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 6);

  // Devices
  const deviceCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const d = s.device_type || 'Desktop';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const deviceData = Object.entries(deviceCounts).map(([label, value]) => ({ label, value }));

  // Browsers
  const browserCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const b = s.browser || 'Other';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});
  const topBrowsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Traffic Sources
  const sourceCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const src = s.traffic_source || 'Direct';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Top Pages
  const pageCounts = pageViews.reduce<Record<string, number>>((acc, pv) => {
    const pg = pv.page_name || 'home';
    acc[pg] = (acc[pg] || 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);

  // Events
  const eventCounts = events.reduce<Record<string, number>>((acc, e) => {
    let name = e.event_name;
    if (name === 'click' && e.event_data?.element) {
      name = `Click: ${e.event_data.element}`;
    }
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 7);

  const maxPageCount = topPages[0]?.[1] || 1;
  const maxSourceCount = topSources[0]?.[1] || 1;

  const DEVICE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4'];
  const BROWSER_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header Row ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Website Visitors</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Refreshed {timeAgo(lastRefresh.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live pill */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${liveCount > 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            <span className={`w-2 h-2 rounded-full ${liveCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            {liveCount > 0 ? `${liveCount} Live` : 'No one live'}
          </span>
          {/* Range selector */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
            {(['today', '7d', '30d', 'all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 cursor-pointer transition-colors ${range === r ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Sessions',    value: sessions.length,   icon: <Users className="w-5 h-5" />,      color: 'blue' },
          { label: 'Unique Visitors',   value: uniqueVisitors,    icon: <Eye className="w-5 h-5" />,        color: 'violet' },
          { label: 'Page Views',        value: totalPageViews,    icon: <BarChart2 className="w-5 h-5" />,  color: 'cyan' },
          { label: 'Avg Session Time',  value: formatDuration(avgDuration), icon: <Clock className="w-5 h-5" />, color: 'emerald', isStr: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center 
              ${kpi.color === 'blue'    ? 'bg-blue-50 text-blue-600'    : ''}
              ${kpi.color === 'violet'  ? 'bg-violet-50 text-violet-600' : ''}
              ${kpi.color === 'cyan'    ? 'bg-cyan-50 text-cyan-600'    : ''}
              ${kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
            `}>
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 leading-none">
                {(kpi as any).isStr ? kpi.value : Number(kpi.value).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Pages + Sources + Devices ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-slate-900">Top Pages</h3>
          </div>
          <div className="space-y-3">
            {topPages.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
            {topPages.map(([page, count]) => (
              <div key={page} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{PAGE_LABELS[page] || page}</span>
                  <span className="text-slate-400 font-mono">{count}</span>
                </div>
                <BarMini value={count} max={maxPageCount} color="#3b82f6" />
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900">Traffic Sources</h3>
          </div>
          <div className="space-y-3">
            {topSources.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data yet</p>}
            {topSources.map(([src, count]) => (
              <div key={src} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span>{sourceIcon(src)}</span>{src}
                  </span>
                  <span className="text-slate-400 font-mono">{count}</span>
                </div>
                <BarMini value={count} max={maxSourceCount} color="#10b981" />
              </div>
            ))}
          </div>
        </div>

        {/* Devices + Browsers */}
        <div className="space-y-4">
          {/* Devices */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-slate-900">Devices</h3>
            </div>
            {deviceData.length === 0
              ? <p className="text-xs text-slate-400 text-center py-2">No data yet</p>
              : (
              <div className="flex items-center gap-4">
                <DonutChart data={deviceData} colors={DEVICE_COLORS} />
                <div className="space-y-2 flex-1">
                  {deviceData.map((d, i) => (
                    <div key={d.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: DEVICE_COLORS[i % 3] }} />
                        <span className="text-slate-600">{d.label}</span>
                      </span>
                      <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Browsers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Browsers</h3>
            </div>
            <div className="space-y-2">
              {topBrowsers.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No data yet</p>}
              {topBrowsers.map(([br, cnt], i) => (
                <div key={br} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: BROWSER_COLORS[i % 5] }} />
                  <span className="flex-1 text-slate-700 font-medium">{br}</span>
                  <span className="font-mono text-slate-400">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Countries + Key Events ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Countries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-cyan-500" />
            <h3 className="font-bold text-sm text-slate-900">Top Countries</h3>
          </div>
          {topCountries.length === 0
            ? <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
            : (
            <div className="space-y-2">
              {topCountries.map(([country, { count, code }]) => {
                const pct = sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0;
                return (
                  <div key={country} className="flex items-center gap-3 text-sm">
                    <span className="text-xl leading-none w-7 text-center">{flagEmoji(code)}</span>
                    <span className="flex-1 text-slate-700 font-medium text-xs">{country}</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Key Events */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Key Interactions</h3>
          </div>
          {topEvents.length === 0
            ? <p className="text-xs text-slate-400 text-center py-4">No interactions tracked yet</p>
            : (
            <div className="space-y-3">
              {topEvents.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">
                      {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-800 shrink-0">{count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Visitors Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-900">Recent Visitors</h3>
          <span className="ml-auto text-xs text-slate-400">{sessions.length} sessions</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Wifi className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No visitor data yet.</p>
            <p className="text-xs text-slate-300 mt-1">Visit www.vtabsquare.com and data will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-8 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
              <span className="col-span-1">Time</span>
              <span className="col-span-1">Location</span>
              <span className="col-span-1">Device</span>
              <span className="col-span-1">Browser</span>
              <span className="col-span-1">Source</span>
              <span className="col-span-1">Pages</span>
              <span className="col-span-1">Duration</span>
              <span className="col-span-1">Detail</span>
            </div>

            {sessions.slice(0, 50).map(s => {
              const isLive = s.last_seen >= twoMinsAgo;
              const isExpanded = expandedSession === s.session_id;

              return (
                <React.Fragment key={s.session_id}>
                  {/* Row */}
                  <div
                    className={`px-5 py-3 cursor-pointer transition-colors hover:bg-blue-50/50 ${isExpanded ? 'bg-blue-50/70' : ''}`}
                    onClick={() => toggleSessionDetail(s.session_id)}
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl leading-none">{flagEmoji(s.country_code)}</span>
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {[s.city, s.country].filter(Boolean).join(', ') || 'Unknown'}
                          </span>
                          {isLive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">{deviceIcon(s.device_type)}{s.device_type || 'Desktop'}</span>
                          <span>{s.browser || '—'}</span>
                          <span>{sourceIcon(s.traffic_source)}{s.traffic_source || 'Direct'}</span>
                          <span>{s.page_count || 1}p · {formatDuration(s.duration_seconds)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{timeAgo(s.started_at)}</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-500 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-300 shrink-0 mt-1" />}
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-8 items-center text-xs text-slate-600">
                      <div className="col-span-1">
                        <div className="font-medium text-slate-700">{formatTime(s.started_at)}</div>
                        <div className="text-slate-400">{timeAgo(s.started_at)}</div>
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />LIVE
                          </span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base leading-none">{flagEmoji(s.country_code)}</span>
                          <div>
                            <div className="font-medium text-slate-700 truncate max-w-[80px]">{s.city || s.country || 'Unknown'}</div>
                            <div className="text-slate-400">{s.country || '—'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center gap-1.5 text-slate-600">
                        {deviceIcon(s.device_type)}<span>{s.device_type || 'Desktop'}</span>
                      </div>
                      <div className="col-span-1 font-medium text-slate-700">{s.browser || '—'}</div>
                      <div className="col-span-1">
                        <span className="flex items-center gap-1">
                          <span>{sourceIcon(s.traffic_source)}</span>
                          <span className="truncate max-w-[70px]">{s.traffic_source || 'Direct'}</span>
                        </span>
                      </div>
                      <div className="col-span-1 font-mono font-bold text-slate-800">{s.page_count || 1}</div>
                      <div className="col-span-1 font-medium">{formatDuration(s.duration_seconds)}</div>
                      <div className="col-span-1 flex items-center gap-1 text-blue-500 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Less' : 'Detail'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Detail Panel */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 border-t border-b border-blue-100 px-5 py-4 space-y-4">
                      {detailLoading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading session detail…
                        </div>
                      ) : (
                        <>
                          {/* Meta Info Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'IP Address',  value: s.ip_address || '—' },
                              { label: 'OS',          value: s.os || '—' },
                              { label: 'Screen',      value: s.screen_width && s.screen_height ? `${s.screen_width}×${s.screen_height}` : '—' },
                              { label: 'Language',    value: s.language || '—' },
                              { label: 'Timezone',    value: s.timezone || '—' },
                              { label: 'Referrer',    value: s.referrer ? new URL(s.referrer).hostname : 'None' },
                              { label: 'Landing',     value: PAGE_LABELS[s.landing_page || ''] || s.landing_page || '—' },
                              { label: 'Session ID',  value: s.session_id.slice(0, 12) + '…' },
                            ].map(item => (
                              <div key={item.label} className="bg-white rounded-xl border border-slate-100 p-3">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{item.label}</div>
                                <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate" title={item.value}>{item.value}</div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Page Timeline */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Pages Visited
                              </h4>
                              {sessionDetails?.views.length === 0
                                ? <p className="text-xs text-slate-400">No page data</p>
                                : (
                                <div className="relative space-y-0">
                                  {sessionDetails?.views.map((pv, idx) => (
                                    <div key={pv.id} className="flex items-start gap-3 pb-3">
                                      <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0" />
                                        {idx < (sessionDetails?.views.length || 0) - 1 && (
                                          <div className="w-0.5 bg-blue-100 flex-1 min-h-[12px]" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs font-semibold text-slate-700">
                                          {PAGE_LABELS[pv.page_name] || pv.page_name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          {formatTime(pv.entered_at)}
                                          {pv.time_on_page != null && ` · ${formatDuration(pv.time_on_page)}`}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Events */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5" /> Interactions
                                </h4>
                                <button 
                                  onClick={() => toggleSessionDetail(s.session_id)}
                                  className="text-[10px] flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                >
                                  <RefreshCw className="w-3 h-3" /> Refresh Interactions
                                </button>
                              </div>
                              {sessionDetails?.events.length === 0
                                ? <p className="text-xs text-slate-400">No interactions recorded</p>
                                : (
                                <div className="space-y-2">
                                  {sessionDetails?.events.map(ev => {
                                      const isScroll = ev.event_name === 'scroll_depth';
                                      const isSectionEnter = ev.event_name === 'section_enter';
                                      const isSectionExit = ev.event_name === 'section_exit';
                                      const isClick = ev.event_name === 'click';

                                      return (
                                      <div key={ev.id} className="bg-white rounded-lg border border-slate-100 px-3 py-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className={`text-xs font-semibold ${isScroll ? 'text-blue-600' : isSectionExit || isSectionEnter ? 'text-indigo-600' : isClick ? 'text-amber-600' : 'text-slate-700'}`}>
                                            {ev.event_name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                          </span>
                                          <span className="text-[10px] text-slate-400">{formatTime(ev.created_at)}</span>
                                        </div>
                                        
                                        {/* Rich Data Display */}
                                        {ev.event_data && (
                                          <div className="text-[10px] text-slate-500">
                                            {isScroll && (
                                              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                                                Reached <strong>{String(ev.event_data.percent)}%</strong> of {String(ev.event_data.page || 'page')}
                                              </div>
                                            )}
                                            {isSectionEnter && (
                                              <div className="flex items-center gap-1.5 bg-indigo-50/50 text-indigo-600 px-2 py-1 rounded w-fit border border-indigo-100">
                                                Entered <strong>{String(ev.event_data.section)}</strong> section
                                              </div>
                                            )}
                                            {isSectionExit && (
                                              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded w-fit">
                                                Viewed <strong>{String(ev.event_data.section)}</strong> for {String(ev.event_data.seconds_spent)}s
                                              </div>
                                            )}
                                            {isClick && (
                                              <div className="flex flex-col gap-0.5 mt-1">
                                                <div className="text-slate-800 font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded w-fit border border-amber-100">
                                                  Clicked: {String(ev.event_data.element)}
                                                </div>
                                                {Object.keys(ev.event_data).filter(k => k !== 'element' && k !== 'page').length > 0 && (
                                                  <div className="text-slate-400 truncate pl-1">
                                                    {Object.entries(ev.event_data).filter(([k]) => k !== 'element' && k !== 'page').map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            {!isScroll && !isSectionEnter && !isSectionExit && !isClick && (
                                              <div className="truncate">
                                                {Object.entries(ev.event_data).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )})}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
