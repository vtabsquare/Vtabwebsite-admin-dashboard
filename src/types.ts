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
