export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: 'Analytics & BI' | 'Enterprise Automation' | 'Database & Migration' | 'AI Vision & Construction' | 'Logistics';
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
