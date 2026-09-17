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

