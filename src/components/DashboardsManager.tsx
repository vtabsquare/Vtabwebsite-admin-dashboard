import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { DashboardEmbed, MetricItem } from '../types';
import {
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  Sliders,
  Copy,
  Check,
  X
} from 'lucide-react';

const CATEGORY_PRESETS = [
  'Retail Performance Analysis',
  'Sales Analytics',
  'Financial Analytics',
  'Geographic Intelligence',
  'Healthcare Reporting',
  'Supply Chain Analytics',
  'Customer Churn & Retention',
  'Executive Scorecard'
];

const DEFAULT_METRICS: MetricItem[] = [
  { label: 'Total Revenue', value: '$10.0M', change: '+15.2%', trend: 'up', subtext: 'Annualized run-rate' },
  { label: 'Conversion Rate', value: '3.8%', change: '+0.5%', trend: 'up', subtext: 'Omnichannel baskets' },
  { label: 'Active Users', value: '250K', change: '+12.4%', trend: 'up', subtext: 'Monthly active' },
  { label: 'Net Margin', value: '24.5%', change: '+2.1%', trend: 'up', subtext: 'Above target' }
];

export const DashboardsManager: React.FC = () => {
  const [dashboards, setDashboards] = useState<DashboardEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<DashboardEmbed | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    product_id: string;
    title: string;
    subtitle: string;
    category: string;
    embed_url: string;
    timeframe: string;
    report_type: string;
    badge: string;
    metrics: MetricItem[];
    is_live_embed: boolean;
    is_active: boolean;
    display_order: number;
  }>({
    product_id: 'ai-reporting-platform',
    title: '',
    subtitle: '',
    category: 'Retail Performance Analysis',
    embed_url: '',
    timeframe: 'Live Production Model',
    report_type: 'Interactive BI Report',
    badge: 'LIVE BI',
    metrics: DEFAULT_METRICS,
    is_live_embed: true,
    is_active: true,
    display_order: 1
  });

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_dashboards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDashboards(data || []);
    } catch (err: any) {
      console.error('Error fetching dashboards:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load dashboards' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDashboard(null);
    setFormData({
      product_id: 'ai-reporting-platform',
      title: '',
      subtitle: '',
      category: 'Retail Performance Analysis',
      embed_url: '',
      timeframe: 'Live Production Model',
      report_type: 'Interactive BI Report',
      badge: 'LIVE BI',
      metrics: JSON.parse(JSON.stringify(DEFAULT_METRICS)),
      is_live_embed: true,
      is_active: true,
      display_order: dashboards.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dash: DashboardEmbed) => {
    setEditingDashboard(dash);
    let parsedMetrics: MetricItem[] = [];
    if (Array.isArray(dash.metrics)) {
      parsedMetrics = dash.metrics;
    } else if (typeof dash.metrics === 'string') {
      try {
        parsedMetrics = JSON.parse(dash.metrics);
      } catch {
        parsedMetrics = DEFAULT_METRICS;
      }
    } else {
      parsedMetrics = DEFAULT_METRICS;
    }

    setFormData({
      id: dash.id,
      product_id: dash.product_id || 'ai-reporting-platform',
      title: dash.title,
      subtitle: dash.subtitle || '',
      category: dash.category || 'Retail Performance Analysis',
      embed_url: dash.embed_url || '',
      timeframe: dash.timeframe || 'Live Production Model',
      report_type: dash.report_type || 'Interactive BI Report',
      badge: dash.badge || 'LIVE BI',
      metrics: parsedMetrics.length === 4 ? parsedMetrics : DEFAULT_METRICS,
      is_live_embed: dash.is_live_embed,
      is_active: dash.is_active,
      display_order: dash.display_order || 1
    });
    setIsModalOpen(true);
  };

  const sanitizeEmbedUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    // If it's a vtab reportservices url without &embed=1, append it
    if (trimmed.includes('reportservices.vtabsquare.com') && !trimmed.includes('embed=1')) {
      const sep = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${sep}embed=1`;
    }
    return trimmed;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const cleanUrl = sanitizeEmbedUrl(formData.embed_url);

    const payload = {
      product_id: formData.product_id,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      category: formData.category.trim(),
      embed_url: cleanUrl,
      timeframe: formData.timeframe.trim() || 'Live Production Model',
      report_type: formData.report_type.trim() || 'Interactive BI Report',
      badge: formData.badge.trim() || 'LIVE BI',
      metrics: formData.metrics,
      is_live_embed: formData.is_live_embed,
      is_active: formData.is_active,
      display_order: Number(formData.display_order) || 1,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingDashboard?.id) {
        // Update
        const { error } = await supabase
          .from('product_dashboards')
          .update(payload)
          .eq('id', editingDashboard.id);

        if (error) throw error;
        setMessage({ type: 'success', text: `Dashboard "${formData.title}" updated successfully!` });
      } else {
        // Insert
        const newId = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `dash-${Date.now()}`;

        const { error } = await supabase
          .from('product_dashboards')
          .insert({
            id: newId,
            ...payload
          });

        if (error) throw error;
        setMessage({ type: 'success', text: `Dashboard "${formData.title}" created and published!` });
      }

      setIsModalOpen(false);
      fetchDashboards();
    } catch (err: any) {
      console.error('Error saving dashboard:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save dashboard' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('product_dashboards').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: `Deleted "${title}"` });
      fetchDashboards();
    } catch (err: any) {
      console.error('Error deleting dashboard:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete dashboard' });
    }
  };

  const handleToggleActive = async (dash: DashboardEmbed) => {
    const nextState = !dash.is_active;
    try {
      const { error } = await supabase
        .from('product_dashboards')
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq('id', dash.id);

      if (error) throw error;
      setDashboards(prev => prev.map(d => d.id === dash.id ? { ...d, is_active: nextState } : d));
      setMessage({
        type: 'success',
        text: `"${dash.title}" is now ${nextState ? 'VISIBLE' : 'HIDDEN'} on the website.`
      });
    } catch (err: any) {
      console.error('Error toggling active:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateMetric = (index: number, field: keyof MetricItem, value: string) => {
    const updated = [...formData.metrics];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, metrics: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Reporting Platform · Tailored Dashboards Gallery</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Live Interactive Dashboards</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Manage interactive dashboard embeds, report canvas links, and KPI metrics. Changes made here automatically wire into the company website's reporting gallery in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboards}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dashboard</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboards Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Configured Gallery Dashboards</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Order determines the pill tab placement on the website.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {dashboards.length} total
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm">Loading dashboards from Supabase...</span>
          </div>
        ) : dashboards.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <LayoutDashboard className="w-12 h-12 mx-auto text-slate-500 opacity-50" />
            <p className="text-base font-medium text-slate-300">No dashboards found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Click "Add Dashboard" above to embed your first live report link or analytical template.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dashboards.map((dash, idx) => {
              const isLive = dash.is_live_embed && Boolean(dash.embed_url);
              return (
                <div 
                  key={dash.id}
                  className={`p-6 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    !dash.is_active ? 'opacity-60 bg-slate-50/30 dark:bg-slate-950/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Order Pill */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                      #{dash.display_order ?? idx + 1}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {dash.title}
                        </h4>

                        {/* Category Badge */}
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          {dash.category}
                        </span>

                        {/* Live Embed Badge */}
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            LIVE IFRAME EMBED
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            CURATED TEMPLATE
                          </span>
                        )}

                        {/* Visibility Pill */}
                        <button
                          onClick={() => handleToggleActive(dash)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                            dash.is_active 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                          title="Click to toggle visibility on website"
                        >
                          {dash.is_active ? '● Public Active' : '○ Hidden Draft'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {dash.subtitle || 'No subtitle provided'}
                      </p>

                      {/* Embed URL Preview */}
                      {dash.embed_url && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono truncate max-w-md bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-[11px]">
                            {dash.embed_url}
                          </span>
                          <button
                            onClick={() => handleCopyLink(dash.embed_url, dash.id)}
                            className="p-1 hover:text-indigo-400 transition"
                            title="Copy link"
                          >
                            {copiedId === dash.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <a
                            href={dash.embed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-indigo-400 transition"
                            title="Open link directly"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {dash.embed_url && (
                      <button
                        onClick={() => setPreviewUrl(dash.embed_url)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title="Preview Iframe"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(dash)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(dash.id, dash.title)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition cursor-pointer"
                      title="Delete dashboard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingDashboard ? `Edit "${editingDashboard.title}"` : 'Add New Live Dashboard'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure the project link, embed settings, and key analytical metrics.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Core Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Dashboard Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Retail Performance Analysis"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category Tab Label *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Retail Performance Analysis"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                      onChange={e => e.target.value && setFormData({ ...formData, category: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="">Presets...</option>
                      {CATEGORY_PRESETS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Subtitle / Business Objective
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Store performance, revenue velocity, category margins, and India geographic insights"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Embed Link Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Real-time Live Iframe Embed Configuration</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.is_live_embed}
                      onChange={e => setFormData({ ...formData, is_live_embed: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enable Live iFrame Embed</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <input
                    type="url"
                    value={formData.embed_url}
                    onChange={e => setFormData({ ...formData, embed_url: e.target.value })}
                    placeholder="https://reportservices.vtabsquare.com/?workspace=1&report=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tip: If pasting a VTAB Reporting URL, <code className="text-indigo-400">&embed=1</code> is automatically appended to strip the desktop toolbar and render the clean visual canvas.
                  </p>
                </div>

                {formData.embed_url && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(sanitizeEmbedUrl(formData.embed_url))}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Test load this URL in a preview frame</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Badges, Timeframe, Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="LIVE BI"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Timeframe Label
                  </label>
                  <input
                    type="text"
                    value={formData.timeframe}
                    onChange={e => setFormData({ ...formData, timeframe: e.target.value })}
                    placeholder="Live Production Model"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Display Order (#)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* KPI Metrics Editor (4 cards) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>KPI Metrics Cards (Featured at top of dashboard)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">4 analytical metrics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {formData.metrics.map((m, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-400 flex justify-between">
                        <span>Card #{idx + 1}</span>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={m.label}
                          onChange={e => updateMetric(idx, 'label', e.target.value)}
                          placeholder="Label (e.g. Total Revenue)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={m.value}
                          onChange={e => updateMetric(idx, 'value', e.target.value)}
                          placeholder="Value (₹142.8M)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold outline-none"
                        />
                        <input
                          type="text"
                          value={m.change}
                          onChange={e => updateMetric(idx, 'change', e.target.value)}
                          placeholder="+22.4%"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-emerald-500 font-bold outline-none"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={m.subtext}
                          onChange={e => updateMetric(idx, 'subtext', e.target.value)}
                          placeholder="Subtext note"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-slate-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggle & Submit */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish to Website Immediately</span>
                </label>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingDashboard ? 'Save Changes' : 'Publish Dashboard'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {previewUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-300 truncate max-w-xl">{previewUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iFrame View */}
            <div className="flex-1 w-full bg-slate-950 relative">
              <iframe
                src={previewUrl}
                title="Dashboard Live Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
