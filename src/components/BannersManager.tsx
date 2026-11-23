import React, { useState, useEffect, useRef } from 'react';
import {
  bannerService,
  BANNER_THEMES,
  type AnnouncementBanner,
  type BannerThemeConfig
} from '../services/bannerService';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../types';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  ArrowUpRight,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Copy,
  Check,
  X,
  Code2,
  Sliders
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'VTAB Reporting Analytics Chart',
    url: '/media/vtab-reporting-analytics-bg.png'
  },
  {
    name: 'Databricks Medallion Architecture',
    url: '/media/sql-to-databricks-migration-flow.jpg'
  }
];

export const BannersManager: React.FC = () => {
  const [banners, setBanners] = useState<AnnouncementBanner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AnnouncementBanner | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AnnouncementBanner>>({
    headlinePrefix: 'Meet',
    headlineHighlight: '',
    badgeText: 'New Application',
    description: '',
    ctaText: 'Explore Now',
    ctaMobileText: 'Explore',
    productId: 'ai-reporting-platform',
    backgroundImage: '/media/vtab-reporting-analytics-bg.png',
    themePreset: 'cyan-purple',
    isActive: true,
    displayOrder: 1
  });

  // Image Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Preview Index
  const [previewBannerIndex, setPreviewBannerIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedBanners, { data: prods }] = await Promise.all([
        bannerService.fetchBanners(),
        supabase.from('products').select('id, title, category').order('title')
      ]);

      setBanners(fetchedBanners);
      if (prods) setProducts(prods as Product[]);
    } catch (err: any) {
      console.error('Failed to load banner data:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load banners' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      headlinePrefix: 'Meet',
      headlineHighlight: '',
      badgeText: 'New Application',
      description: '',
      ctaText: 'Explore Now',
      ctaMobileText: 'Explore',
      productId: products[0]?.id || 'ai-reporting-platform',
      backgroundImage: PRESET_IMAGES[0].url,
      themePreset: 'cyan-purple',
      isActive: true,
      displayOrder: banners.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: AnnouncementBanner) => {
    setEditingBanner(banner);
    setFormData({ ...banner });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (banner: AnnouncementBanner) => {
    try {
      const updatedStatus = await bannerService.toggleActive(banner);
      setBanners(prev =>
        prev.map(b => (b.id === banner.id ? { ...b, isActive: updatedStatus } : b))
      );
      setMessage({
        type: 'success',
        text: `Banner "${banner.headlineHighlight}" is now ${updatedStatus ? 'LIVE' : 'PAUSED'}.`
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update banner status: ' + err.message });
    }
  };

  const handleDelete = async (banner: AnnouncementBanner) => {
    if (!window.confirm(`Delete banner "${banner.headlineHighlight}"?`)) return;

    try {
      await bannerService.deleteBanner(banner);
      setBanners(prev => prev.filter(b => b.id !== banner.id));
      setMessage({ type: 'success', text: 'Banner deleted successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete banner: ' + err.message });
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const publicUrl = await bannerService.uploadImage(file);
      setFormData(prev => ({ ...prev, backgroundImage: publicUrl }));
      setMessage({ type: 'success', text: 'Background image uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Image upload failed: ' + err.message });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headlineHighlight?.trim()) {
      setMessage({ type: 'error', text: 'Headline highlight is required' });
      return;
    }

    setSaving(true);
    try {
      const saved = await bannerService.saveBanner(formData);
      if (editingBanner) {
        setBanners(prev => prev.map(b => (b.id === saved.id ? saved : b)));
        setMessage({ type: 'success', text: 'Banner updated successfully!' });
      } else {
        setBanners(prev => [...prev, saved]);
        setMessage({ type: 'success', text: 'New banner published successfully!' });
      }
      setIsModalOpen(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save banner: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const currentTheme: BannerThemeConfig =
    BANNER_THEMES[formData.themePreset || 'cyan-purple'] || BANNER_THEMES['cyan-purple'];

  const SQL_DDL = `-- =========================================================
-- OPTIONAL DEDICATED TABLE FOR ANNOUNCEMENT BANNERS
-- Run in Supabase SQL Editor (wclpchjxdglhinoazxmr)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.announcement_banners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  badge_text TEXT NOT NULL DEFAULT 'New Application',
  headline_prefix TEXT NOT NULL DEFAULT 'Meet',
  headline_highlight TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Explore Reporting Tool',
  cta_mobile_text TEXT NOT NULL DEFAULT 'Explore',
  background_image TEXT,
  theme_preset TEXT DEFAULT 'cyan-purple',
  bg_gradient TEXT,
  highlight_gradient TEXT,
  cta_gradient TEXT,
  cta_shadow TEXT,
  badge_border_class TEXT,
  badge_bg_class TEXT,
  badge_pulse_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcement_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read on announcement_banners" ON public.announcement_banners FOR SELECT USING (true);
CREATE POLICY "All access on announcement_banners" ON public.announcement_banners FOR ALL USING (true) WITH CHECK (true);
`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-md transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Live Website Announcement Hero</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Announcement Banners Manager
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Create, edit, and restyle the glowing obsidian announcement banners rotated at the top of
              the company website. Changes sync immediately to all visitors in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="View SQL DDL for database"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Database DDL</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Refresh banners"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW OF CURRENTLY SELECTED OR FIRST BANNER */}
      {banners.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Eye className="w-4 h-4 text-cyan-500" />
              <span>Live Appearance on Website (Mockup Preview)</span>
            </div>
            {banners.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {banners.map((b, idx) => (
                  <button
                    key={`prev-dot-${b.id}`}
                    onClick={() => setPreviewBannerIndex(idx)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                      previewBannerIndex === idx
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Slide {idx + 1}: {b.headlineHighlight}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Render the actual live banner mockup */}
          {(() => {
            const b = banners[previewBannerIndex] || banners[0];
            const theme = BANNER_THEMES[b.themePreset] || BANNER_THEMES['cyan-purple'];
            return (
              <div
                className="relative isolate flex h-[112px] min-h-[112px] w-full items-center overflow-hidden rounded-2xl border border-cyan-400/30 text-white backdrop-blur-xl shadow-2xl transition-all"
                style={{
                  backgroundColor: 'rgba(4, 19, 48, 0.85)',
                  boxShadow:
                    '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 -2px 16px rgba(0, 199, 255, .12), 0 3px 18px rgba(148, 65, 255, .12)'
                }}
              >
                {/* Background Gradient */}
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{ background: b.bgGradient || theme.bgGradient }}
                />

                {/* Background Image / Illustration */}
                {b.backgroundImage && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-[36%] right-[14%] top-0 z-0 hidden sm:block opacity-75"
                    style={{
                      backgroundImage: `url('${b.backgroundImage}')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center 50%',
                      backgroundSize: 'cover',
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent 0%, #000 25%, #000 80%, transparent 100%)',
                      maskImage:
                        'linear-gradient(to right, transparent 0%, #000 25%, #000 80%, transparent 100%)'
                    }}
                  />
                )}

                {/* Glowing neon borders */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[2px]"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(0,229,255,.12) 0%, #00dfff 16%, #3895ff 47%, #986bff 74%, #f060e8 94%, rgba(240,96,232,.2) 100%)'
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[2px]"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(0,229,255,.15) 0%, #05cbf6 20%, #4777ff 52%, #b75dff 79%, #ee67dd 96%, rgba(240,96,232,.18) 100%)'
                  }}
                />

                {/* Content */}
                <div className="relative z-10 mx-auto flex h-full w-full max-w-[1840px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:gap-7 lg:px-10">
                  <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-6">
                    {/* Badge */}
                    <div
                      className={`hidden shrink-0 items-center gap-2.5 rounded-full border ${
                        b.badgeBorderClass || theme.badgeBorderClass
                      } ${
                        b.badgeBgClass || theme.badgeBgClass
                      } px-3.5 py-2 shadow-[0_0_15px_rgba(0,187,255,.09)] backdrop-blur-sm md:inline-flex`}
                    >
                      <span className="relative flex h-2 w-2 items-center justify-center">
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${
                            b.badgePulseColor || theme.badgePulseColor
                          } shadow-[0_0_9px_currentColor]`}
                        />
                      </span>
                      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[.16em] text-cyan-200 lg:text-[11px]">
                        {b.badgeText}
                      </span>
                    </div>

                    {/* Headline & Description */}
                    <div className="min-w-0">
                      <h2 className="flex flex-wrap items-baseline gap-x-1.5 text-[18px] font-bold leading-tight tracking-tight text-white sm:text-[20px] lg:text-[23px] xl:text-[25px]">
                        <span>{b.headlinePrefix}</span>
                        <span
                          className={`whitespace-nowrap bg-gradient-to-r ${
                            b.highlightGradient || theme.highlightGradient
                          } bg-clip-text font-extrabold text-transparent`}
                        >
                          {b.headlineHighlight}
                        </span>
                      </h2>
                      <p className="mt-1 hidden max-w-[620px] text-[11px] leading-snug text-slate-200/90 sm:block lg:text-[12.5px] truncate">
                        {b.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r ${
                        b.ctaGradient || theme.ctaGradient
                      } ${b.ctaShadow || theme.ctaShadow} px-4 py-2.5 text-xs font-semibold text-white shadow-lg`}
                    >
                      <span>{b.ctaText}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* CONFIGURED BANNERS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Configured Banners ({banners.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag, edit, toggle active status, or reorder announcement slides for the live website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Active: {banners.filter(b => b.isActive).length} / {banners.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm">Loading announcement banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No announcement banners found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Add New Banner&quot; above to create your first announcement slide.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Banner</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => {
              const theme = BANNER_THEMES[banner.themePreset] || BANNER_THEMES['cyan-purple'];
              return (
                <div
                  key={banner.id}
                  className={`border rounded-2xl p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    banner.isActive
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      : 'border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                  }`}
                >
                  {/* Left Info & Color preview */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Order & Color Swatch Pill */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-bold text-slate-400">#{index + 1}</span>
                      <div
                        className={`w-9 h-9 rounded-xl border border-white/20 shadow-md flex items-center justify-center bg-gradient-to-tr ${theme.previewBorder}`}
                        title={`Theme: ${theme.name}`}
                      >
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            banner.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              banner.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {banner.isActive ? 'Live' : 'Paused'}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Theme: {theme.name}
                        </span>

                        <span className="text-slate-300 dark:text-slate-700">•</span>

                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          Target: {banner.productId}
                        </span>
                      </div>

                      {/* Headline */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-slate-500 font-normal">{banner.headlinePrefix}</span>
                        <span className="font-extrabold">{banner.headlineHighlight}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {banner.badgeText}
                        </span>
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                        {banner.description}
                      </p>

                      {/* Button and Image pill */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          Button: &quot;{banner.ctaText}&quot;
                        </span>
                        {banner.backgroundImage && (
                          <span className="inline-flex items-center gap-1 text-slate-400 truncate max-w-xs">
                            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{banner.backgroundImage}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        banner.isActive
                          ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={banner.isActive ? 'Pause this banner' : 'Publish to live website'}
                    >
                      {banner.isActive ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Make Live</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(banner)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingBanner ? 'Edit Announcement Banner' : 'Create New Announcement Banner'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure headline, description, button, background visual, and glowing color theme.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: HEADLINE & BADGE */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-500" />
                  <span>1. Headline & Badge</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Headline Prefix
                    </label>
                    <input
                      type="text"
                      value={formData.headlinePrefix || ''}
                      onChange={e => setFormData({ ...formData, headlinePrefix: e.target.value })}
                      placeholder="e.g. Meet, Introducing, Announcing"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Headline Highlight (Gradient Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headlineHighlight || ''}
                      onChange={e => setFormData({ ...formData, headlineHighlight: e.target.value })}
                      placeholder="e.g. VTAB Reporting, AI Databricks Migration"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pill Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText || ''}
                      onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                      placeholder="e.g. New Application, Featured, AI Suite"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Destination / Linked Product
                    </label>
                    <select
                      value={formData.productId || 'ai-reporting-platform'}
                      onChange={e => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.id})
                        </option>
                      ))}
                      <option value="ai-migration-factory-databricks-control-plane">
                        Databricks Migration Suite
                      </option>
                      <option value="qlik-to-powerbi-migration">Qlik to Power BI Migration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description Snippet
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Turn complex data into clear, actionable insights."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 2: CTA BUTTON */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>2. Call-to-Action (CTA) Button</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Button Text (Desktop)
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText || ''}
                      onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                      placeholder="e.g. Explore Reporting Tool"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Button Text (Mobile Compact)
                    </label>
                    <input
                      type="text"
                      value={formData.ctaMobileText || ''}
                      onChange={e => setFormData({ ...formData, ctaMobileText: e.target.value })}
                      placeholder="e.g. Explore"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: COLOR THEME PRESET */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-fuchsia-500" />
                  <span>3. Banner Color Theme & Gradients</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(BANNER_THEMES).map(([themeKey, config]) => {
                    const selected = formData.themePreset === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, themePreset: themeKey })}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl shrink-0 border border-white/20 shadow-md bg-gradient-to-tr ${config.previewBorder}`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {config.name}
                          </p>
                          <span
                            className={`text-[10px] bg-gradient-to-r ${config.highlightGradient} bg-clip-text font-extrabold text-transparent`}
                          >
                            Accent Gradient
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: BACKGROUND IMAGE & VISUAL */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <span>4. Background Graphic / Illustration</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Image URL or Uploaded Asset
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.backgroundImage || ''}
                      onChange={e => setFormData({ ...formData, backgroundImage: e.target.value })}
                      placeholder="https://... or /media/vtab-reporting-analytics-bg.png"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={imageUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      {imageUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* Quick presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500">Quick Image Presets:</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {PRESET_IMAGES.map(preset => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setFormData({ ...formData, backgroundImage: preset.url })}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          formData.backgroundImage === preset.url
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      None (Gradient Only)
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: LIVE MOCKUP PREVIEW INSIDE MODAL */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Live Preview (Instant Result)</span>
                </h4>

                <div
                  className="relative isolate flex h-[104px] min-h-[104px] w-full items-center overflow-hidden rounded-2xl border border-cyan-400/30 text-white backdrop-blur-xl shadow-xl transition-all"
                  style={{
                    backgroundColor: 'rgba(4, 19, 48, 0.85)'
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{ background: currentTheme.bgGradient }}
                  />

                  {formData.backgroundImage && (
                    <div
                      className="pointer-events-none absolute bottom-0 left-[36%] right-[14%] top-0 z-0 hidden sm:block opacity-75"
                      style={{
                        backgroundImage: `url('${formData.backgroundImage}')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center 50%',
                        backgroundSize: 'cover',
                        WebkitMaskImage:
                          'linear-gradient(to right, transparent 0%, #000 25%, #000 80%, transparent 100%)',
                        maskImage:
                          'linear-gradient(to right, transparent 0%, #000 25%, #000 80%, transparent 100%)'
                      }}
                    />
                  )}

                  <div className="relative z-10 flex h-full w-full items-center justify-between gap-3 px-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`hidden shrink-0 items-center gap-2 rounded-full border ${currentTheme.badgeBorderClass} ${currentTheme.badgeBgClass} px-3 py-1.5 md:inline-flex`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${currentTheme.badgePulseColor}`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                          {formData.badgeText || 'Badge'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h2 className="flex flex-wrap items-baseline gap-x-1.5 text-lg font-bold text-white">
                          <span>{formData.headlinePrefix}</span>
                          <span
                            className={`whitespace-nowrap bg-gradient-to-r ${currentTheme.highlightGradient} bg-clip-text font-extrabold text-transparent`}
                          >
                            {formData.headlineHighlight || 'Highlighted Title'}
                          </span>
                        </h2>
                        <p className="text-[11px] text-slate-200/90 truncate max-w-md">
                          {formData.description || 'Description snippet...'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-gradient-to-r ${currentTheme.ctaGradient} px-4 py-2 text-xs font-semibold text-white shadow-md`}
                    >
                      <span>{formData.ctaText || 'Explore'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Display Order */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Publish live on website</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Order:</span>
                    <input
                      type="number"
                      min={1}
                      value={formData.displayOrder ?? 1}
                      onChange={e =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                      }
                      className="w-16 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingBanner ? 'Save Changes' : 'Publish Banner'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL DDL HELPER MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-white">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold">Supabase SQL DDL Schema</h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                The manager currently works seamlessly using the Supabase database. If you would like
                to create a dedicated <code className="text-cyan-300 font-mono">announcement_banners</code>{' '}
                table in Supabase SQL editor, copy the query below and execute it:
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-cyan-200 overflow-x-auto border border-slate-800 max-h-60 leading-relaxed">
                  {SQL_DDL}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_DDL);
                    setSqlCopied(true);
                    setTimeout(() => setSqlCopied(false), 2000);
                  }}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-right">
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
