export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory?: string;
  tags: string[];
  impactMetric: string;
  keyFeatures: string[];
  techStack: string[];
  iconName: string;
  featured?: boolean;
  imageUrl?: string;
  embedUrl?: string;
  demoSnippet?: any;
  detailContent?: any;
}

export interface CareerRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
}

export interface IoTCapability {
  icon: string;
  title: string;
  description: string;
}

export interface IoTSignal {
  icon: string;
  label: string;
  detail: string;
  color: string;
}

export interface IoTContent {
  id: string;
  header_badge: string;
  header_title: string;
  header_highlight: string;
  header_description: string;
  reference_app_badge: string;
  reference_app_title: string;
  benefits: string[];
  capabilities: IoTCapability[];
  signals: IoTSignal[];
  demo_video_url?: string | null;
  updated_at?: string;
}

export interface MetricItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
}

export interface DashboardEmbed {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}


