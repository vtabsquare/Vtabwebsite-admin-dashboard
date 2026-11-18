export interface PipelineStageConfig {
  id: string;
  stageNumber: string;
  stageTag: string;
  stageHeadline: string;
  stageDescription: string;
  bullets: string[];
  bottomBadges: string[];
  activeNode: string;
  streamStates: { name: string; status: string; detail?: string }[];
  filterStatus?: string;
}

export interface FeatureCapabilityConfig {
  id: string;
  name: string;
  shortName: string;
  categoryTag: string;
  headline: string;
  description: string;
  bullets: string[];
  specs: { label: string; value: string }[];
  tagColor?: string;
}

export interface ArchitectureLayerConfig {
  layerNumber: string;
  sectionTag: string;
  headline: string;
  description: string;
  bullets: string[];
  tags: string[];
  rightBoxTitle: string;
  rightBoxSubtitle: string;
  rightBoxItems: { label: string; status: string; detail?: string }[];
}

export interface DeploymentEditionConfig {
  tier: string;
  cardTag: string;
  title: string;
  subtitle: string;
  badge?: string;
  bullets: string[];
  primaryCtaText: string;
  specs: { label: string; value: string }[];
  consoleTitle: string;
  consoleItems: { label: string; value: string }[];
}

export interface FiveScreenArchitectureData {
  topBadge?: string;
  eyebrow?: string;
  pipelineHeadline?: string;
  pipelineDescription?: string;
  pipelineStages?: PipelineStageConfig[];
  capabilitiesHeadline?: string;
  capabilitiesDescription?: string;
  capabilities?: FeatureCapabilityConfig[];
  deepDiveHeadline?: string;
  deepDiveDescription?: string;
  deepDiveLayers?: ArchitectureLayerConfig[];
  editionsHeadline?: string;
  editionsDescription?: string;
  editions?: DeploymentEditionConfig[];
}
