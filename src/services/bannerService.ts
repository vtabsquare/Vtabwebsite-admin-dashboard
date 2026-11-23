import { supabase } from '../lib/supabaseClient';

export interface BannerThemeConfig {
  id: string;
  name: string;
  bgGradient: string;
  badgeBorderClass: string;
  badgeBgClass: string;
  badgePulseColor: string;
  highlightGradient: string;
  ctaGradient: string;
  ctaShadow: string;
  previewBorder: string;
}

export const BANNER_THEMES: Record<string, BannerThemeConfig> = {
  'cyan-purple': {
    id: 'cyan-purple',
    name: 'Cyan & Purple (VTAB Classic)',
    bgGradient:
      'linear-gradient(103deg, rgba(6, 36, 84, 0.40) 0%, rgba(4, 20, 47, 0.35) 31%, rgba(4, 22, 49, 0.35) 58%, rgba(16, 26, 81, 0.45) 79%, rgba(60, 21, 93, 0.50) 100%)',
    badgeBorderClass: 'border-cyan-400/70',
    badgeBgClass: 'bg-[#031c45]/50',
    badgePulseColor: 'bg-cyan-300',
    highlightGradient: 'from-[#17c8fd] via-[#539bfc] to-[#e668e9]',
    ctaGradient: 'from-[#00aaf4] via-[#477ffc] to-[#db4ce7]',
    ctaShadow: 'shadow-[0_0_22px_rgba(112,84,247,.38)] hover:shadow-[0_0_30px_rgba(160,75,243,.6)]',
    previewBorder: 'from-cyan-400 via-blue-500 to-fuchsia-500'
  },
  'cyan-emerald': {
    id: 'cyan-emerald',
    name: 'Cyan & Emerald (Databricks Medallion)',
    bgGradient:
      'linear-gradient(103deg, rgba(2, 26, 56, 0.40) 0%, rgba(4, 23, 56, 0.35) 28%, rgba(3, 43, 73, 0.38) 55%, rgba(5, 59, 88, 0.45) 78%, rgba(9, 74, 76, 0.50) 100%)',
    badgeBorderClass: 'border-emerald-400/70',
    badgeBgClass: 'bg-[#032e3b]/50',
    badgePulseColor: 'bg-emerald-300',
    highlightGradient: 'from-[#22d3ee] via-[#38bdf8] to-[#34d399]',
    ctaGradient: 'from-[#0284c7] via-[#0ea5e9] to-[#059669]',
    ctaShadow: 'shadow-[0_0_22px_rgba(14,165,233,.45)] hover:shadow-[0_0_30px_rgba(52,211,153,.65)]',
    previewBorder: 'from-cyan-400 via-sky-500 to-emerald-400'
  },
  'blue-indigo': {
    id: 'blue-indigo',
    name: 'Blue & Indigo (Enterprise Analytics)',
    bgGradient:
      'linear-gradient(103deg, rgba(3, 18, 54, 0.45) 0%, rgba(8, 28, 72, 0.40) 30%, rgba(14, 28, 92, 0.40) 58%, rgba(28, 22, 98, 0.45) 80%, rgba(42, 28, 114, 0.50) 100%)',
    badgeBorderClass: 'border-blue-400/70',
    badgeBgClass: 'bg-[#031d48]/50',
    badgePulseColor: 'bg-blue-300',
    highlightGradient: 'from-[#38bdf8] via-[#60a5fa] to-[#818cf8]',
    ctaGradient: 'from-[#0284c7] via-[#2563eb] to-[#4f46e5]',
    ctaShadow: 'shadow-[0_0_22px_rgba(37,99,235,.40)] hover:shadow-[0_0_30px_rgba(79,70,229,.6)]',
    previewBorder: 'from-sky-400 via-blue-500 to-indigo-500'
  },
  'amber-orange': {
    id: 'amber-orange',
    name: 'Amber & Orange (Innovation Core)',
    bgGradient:
      'linear-gradient(103deg, rgba(46, 26, 4, 0.45) 0%, rgba(54, 32, 6, 0.40) 30%, rgba(68, 38, 8, 0.40) 58%, rgba(84, 42, 10, 0.45) 80%, rgba(98, 48, 12, 0.50) 100%)',
    badgeBorderClass: 'border-amber-400/70',
    badgeBgClass: 'bg-[#3a2205]/50',
    badgePulseColor: 'bg-amber-300',
    highlightGradient: 'from-[#fbbf24] via-[#f59e0b] to-[#f97316]',
    ctaGradient: 'from-[#d97706] via-[#ea580c] to-[#c2410c]',
    ctaShadow: 'shadow-[0_0_22px_rgba(234,88,12,.40)] hover:shadow-[0_0_30px_rgba(245,158,11,.6)]',
    previewBorder: 'from-yellow-400 via-amber-500 to-orange-500'
  },
  'rose-fuchsia': {
    id: 'rose-fuchsia',
    name: 'Rose & Fuchsia (Creative AI)',
    bgGradient:
      'linear-gradient(103deg, rgba(48, 8, 42, 0.45) 0%, rgba(56, 10, 52, 0.40) 30%, rgba(72, 14, 68, 0.40) 58%, rgba(86, 18, 82, 0.45) 80%, rgba(98, 20, 94, 0.50) 100%)',
    badgeBorderClass: 'border-rose-400/70',
    badgeBgClass: 'bg-[#3b0832]/50',
    badgePulseColor: 'bg-rose-300',
    highlightGradient: 'from-[#fb7185] via-[#f43f5e] to-[#ec4899]',
    ctaGradient: 'from-[#e11d48] via-[#db2777] to-[#c026d3]',
    ctaShadow: 'shadow-[0_0_22px_rgba(225,29,72,.40)] hover:shadow-[0_0_30px_rgba(236,72,153,.6)]',
    previewBorder: 'from-rose-400 via-pink-500 to-fuchsia-500'
  }
};

export interface AnnouncementBanner {
  id: string; // Database record ID (UUID or text)
  bannerKey?: string; // Slug (e.g. 'vtab-reporting')
  productId: string;
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  description: string;
  ctaText: string;
  ctaMobileText: string;
  backgroundImage: string;
  themePreset: string;
  bgGradient?: string;
  badgeBorderClass?: string;
  badgeBgClass?: string;
  badgePulseColor?: string;
  highlightGradient?: string;
  ctaGradient?: string;
  ctaShadow?: string;
  isActive: boolean;
  displayOrder: number;
  sourceTable?: 'announcement_banners' | 'product_dashboards';
}

function mapFromDashboardRow(row: any): AnnouncementBanner {
  let meta: Record<string, any> = {};
  if (typeof row.metrics === 'object' && row.metrics !== null && !Array.isArray(row.metrics)) {
    meta = row.metrics;
  } else if (typeof row.metrics === 'string') {
    try { meta = JSON.parse(row.metrics); } catch {}
  }

  const themeKey = meta.themePreset || 'cyan-purple';
  const themeDefaults = BANNER_THEMES[themeKey] || BANNER_THEMES['cyan-purple'];

  return {
    id: row.id,
    bannerKey: meta.bannerId || row.id,
    productId: row.product_id || 'ai-reporting-platform',
    badgeText: row.badge || meta.badgeText || 'New Application',
    headlinePrefix: meta.headlinePrefix || 'Meet',
    headlineHighlight: meta.headlineHighlight || row.title || 'New Announcement',
    description: row.subtitle || meta.description || '',
    ctaText: row.report_type || meta.ctaText || 'Explore Now',
    ctaMobileText: row.timeframe || meta.ctaMobileText || 'Explore',
    backgroundImage: row.embed_url || meta.backgroundImage || '',
    themePreset: themeKey,
    bgGradient: meta.bgGradient || themeDefaults.bgGradient,
    badgeBorderClass: meta.badgeBorderClass || themeDefaults.badgeBorderClass,
    badgeBgClass: meta.badgeBgClass || themeDefaults.badgeBgClass,
    badgePulseColor: meta.badgePulseColor || themeDefaults.badgePulseColor,
    highlightGradient: meta.highlightGradient || themeDefaults.highlightGradient,
    ctaGradient: meta.ctaGradient || themeDefaults.ctaGradient,
    ctaShadow: meta.ctaShadow || themeDefaults.ctaShadow,
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 1,
    sourceTable: 'product_dashboards'
  };
}

function mapFromBannerRow(row: any): AnnouncementBanner {
  const themeKey = row.theme_preset || 'cyan-purple';
  const themeDefaults = BANNER_THEMES[themeKey] || BANNER_THEMES['cyan-purple'];

  return {
    id: row.id,
    bannerKey: row.id,
    productId: row.product_id || 'ai-reporting-platform',
    badgeText: row.badge_text || 'New Application',
    headlinePrefix: row.headline_prefix || 'Meet',
    headlineHighlight: row.headline_highlight || 'New Announcement',
    description: row.description || '',
    ctaText: row.cta_text || 'Explore Now',
    ctaMobileText: row.cta_mobile_text || 'Explore',
    backgroundImage: row.background_image || '',
    themePreset: themeKey,
    bgGradient: row.bg_gradient || themeDefaults.bgGradient,
    badgeBorderClass: row.badge_border_class || themeDefaults.badgeBorderClass,
    badgeBgClass: row.badge_bg_class || themeDefaults.badgeBgClass,
    badgePulseColor: row.badge_pulse_color || themeDefaults.badgePulseColor,
    highlightGradient: row.highlight_gradient || themeDefaults.highlightGradient,
    ctaGradient: row.cta_gradient || themeDefaults.ctaGradient,
    ctaShadow: row.cta_shadow || themeDefaults.ctaShadow,
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 1,
    sourceTable: 'announcement_banners'
  };
}

export const bannerService = {
  async fetchBanners(): Promise<AnnouncementBanner[]> {
    // 1. Try dedicated announcement_banners table
    const { data: bData, error: bErr } = await supabase
      .from('announcement_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!bErr && bData && bData.length > 0) {
      return bData.map(mapFromBannerRow);
    }

    // 2. Fallback to product_dashboards where category = 'announcement_banner'
    const { data: dData, error: dErr } = await supabase
      .from('product_dashboards')
      .select('*')
      .eq('category', 'announcement_banner')
      .order('display_order', { ascending: true });

    if (!dErr && dData && dData.length > 0) {
      return dData.map(mapFromDashboardRow);
    }

    return [];
  },

  async saveBanner(banner: Partial<AnnouncementBanner>): Promise<AnnouncementBanner> {
    const themeKey = banner.themePreset || 'cyan-purple';
    const themeDefaults = BANNER_THEMES[themeKey] || BANNER_THEMES['cyan-purple'];

    const bgGradient = banner.bgGradient || themeDefaults.bgGradient;
    const badgeBorderClass = banner.badgeBorderClass || themeDefaults.badgeBorderClass;
    const badgeBgClass = banner.badgeBgClass || themeDefaults.badgeBgClass;
    const badgePulseColor = banner.badgePulseColor || themeDefaults.badgePulseColor;
    const highlightGradient = banner.highlightGradient || themeDefaults.highlightGradient;
    const ctaGradient = banner.ctaGradient || themeDefaults.ctaGradient;
    const ctaShadow = banner.ctaShadow || themeDefaults.ctaShadow;

    // First try saving to announcement_banners table if present
    const bannerPayload = {
      product_id: banner.productId || 'ai-reporting-platform',
      badge_text: banner.badgeText || 'New Application',
      headline_prefix: banner.headlinePrefix || 'Meet',
      headline_highlight: banner.headlineHighlight || 'VTAB Reporting',
      description: banner.description || '',
      cta_text: banner.ctaText || 'Explore Reporting Tool',
      cta_mobile_text: banner.ctaMobileText || 'Explore',
      background_image: banner.backgroundImage || '',
      theme_preset: themeKey,
      bg_gradient: bgGradient,
      highlight_gradient: highlightGradient,
      cta_gradient: ctaGradient,
      cta_shadow: ctaShadow,
      badge_border_class: badgeBorderClass,
      badge_bg_class: badgeBgClass,
      badge_pulse_color: badgePulseColor,
      is_active: banner.isActive ?? true,
      display_order: banner.displayOrder ?? 1,
      updated_at: new Date().toISOString()
    };

    if (banner.id && banner.sourceTable === 'announcement_banners') {
      const { data, error } = await supabase
        .from('announcement_banners')
        .update(bannerPayload)
        .eq('id', banner.id)
        .select()
        .single();

      if (!error && data) return mapFromBannerRow(data);
    }

    // Default fallback storage: product_dashboards (category: 'announcement_banner')
    const dashboardPayload = {
      product_id: banner.productId || 'ai-reporting-platform',
      title: banner.headlineHighlight || 'New Announcement',
      subtitle: banner.description || '',
      category: 'announcement_banner',
      badge: banner.badgeText || 'New Application',
      embed_url: banner.backgroundImage || '',
      report_type: banner.ctaText || 'Explore Reporting Tool',
      timeframe: banner.ctaMobileText || 'Explore',
      metrics: {
        bannerId: banner.bannerKey || banner.id || `banner-${Date.now()}`,
        headlinePrefix: banner.headlinePrefix || 'Meet',
        headlineHighlight: banner.headlineHighlight || 'New Announcement',
        themePreset: themeKey,
        bgGradient,
        highlightGradient,
        ctaGradient,
        ctaShadow,
        badgeBorderClass,
        badgeBgClass,
        badgePulseColor
      },
      is_live_embed: true,
      is_active: banner.isActive ?? true,
      display_order: banner.displayOrder ?? 1,
      updated_at: new Date().toISOString()
    };

    if (banner.id) {
      const { data, error } = await supabase
        .from('product_dashboards')
        .update(dashboardPayload)
        .eq('id', banner.id)
        .select()
        .single();

      if (error) throw error;
      return mapFromDashboardRow(data);
    } else {
      const { data, error } = await supabase
        .from('product_dashboards')
        .insert(dashboardPayload)
        .select()
        .single();

      if (error) throw error;
      return mapFromDashboardRow(data);
    }
  },

  async deleteBanner(banner: AnnouncementBanner): Promise<void> {
    const table = banner.sourceTable || 'product_dashboards';
    const { error } = await supabase.from(table).delete().eq('id', banner.id);
    if (error) throw error;
  },

  async toggleActive(banner: AnnouncementBanner): Promise<boolean> {
    const table = banner.sourceTable || 'product_dashboards';
    const newStatus = !banner.isActive;
    const { error } = await supabase
      .from(table)
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', banner.id);

    if (error) throw error;
    return newStatus;
  },

  async uploadImage(file: File): Promise<string> {
    const cleanFileName = `banners/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('product-media')
      .upload(cleanFileName, file, { upsert: true });

    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from('product-media')
      .getPublicUrl(data.path);

    return publicUrl;
  }
};
