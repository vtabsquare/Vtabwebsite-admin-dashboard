import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Settings, 
  Radio, 
  Server, 
  Plus, 
  Trash2, 
  Wand2
} from 'lucide-react';
import type { 
  FiveScreenArchitectureData, 
  PipelineStageConfig, 
  FeatureCapabilityConfig, 
  ArchitectureLayerConfig, 
  DeploymentEditionConfig 
} from '../types/architecture';
import { createDefaultArchitectureTemplate } from '../data/defaultArchitectureTemplate';

interface FiveScreenArchitectureEditorProps {
  data: FiveScreenArchitectureData;
  onChange: (updated: FiveScreenArchitectureData) => void;
  projectTitle: string;
  projectCategory: string;
}

export const FiveScreenArchitectureEditor: React.FC<FiveScreenArchitectureEditorProps> = ({
  data,
  onChange,
  projectTitle,
  projectCategory
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'capabilities' | 'deepdive' | 'editions'>('pipeline');

  const handleApplyTemplate = () => {
    if (window.confirm('Apply 5-Screen Architecture template tailored to this project? This will populate recommended stages, capabilities, and telemetry.')) {
      const template = createDefaultArchitectureTemplate(projectTitle, projectCategory);
      onChange({
        ...template,
        ...data, // preserve existing custom overrides if desired
        topBadge: data.topBadge || template.topBadge,
        pipelineStages: (data.pipelineStages && data.pipelineStages.length > 0) ? data.pipelineStages : template.pipelineStages,
        capabilities: (data.capabilities && data.capabilities.length > 0) ? data.capabilities : template.capabilities,
        deepDiveLayers: (data.deepDiveLayers && data.deepDiveLayers.length > 0) ? data.deepDiveLayers : template.deepDiveLayers,
        editions: (data.editions && data.editions.length > 0) ? data.editions : template.editions
      });
    }
  };

  const stages = data.pipelineStages || [];
  const capabilities = data.capabilities || [];
  const layers = data.deepDiveLayers || [];
  const editions = data.editions || [];

  return (
    <div className="space-y-5 border-t border-slate-200 pt-5">
      {/* Top Header & Template Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5-Screen Architecture Presentation Suite
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure the 4-stage pipeline, 6 interactive studio capabilities, architectural layers, and deployment editions matching the VTAB Reporting standard.
          </p>
        </div>
        <button
          type="button"
          onClick={handleApplyTemplate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm transition-all cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Pre-fill Standard Template</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('pipeline')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'pipeline'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>1. Pipeline (4 Stages)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('capabilities')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'capabilities'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>2. Studio (6 Capabilities)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('deepdive')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'deepdive'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Deep-Dive Layers (01-04)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('editions')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'editions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>4. Deployment Editions</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: END-TO-END PIPELINE ARCHITECTURE (4 STAGES)
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Top Bar Badge
              </label>
              <input
                type="text"
                value={data.topBadge || ''}
                onChange={e => onChange({ ...data, topBadge: e.target.value })}
                placeholder="e.g. BUILDSMART 360 CIVIL ESTIMATOR SUITE · V2.4.1 ENTERPRISE"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Eyebrow
              </label>
              <input
                type="text"
                value={data.eyebrow || 'END-TO-END PIPELINE ARCHITECTURE'}
                onChange={e => onChange({ ...data, eyebrow: e.target.value })}
                placeholder="e.g. END-TO-END CIVIL ESTIMATION ARCHITECTURE"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pipeline Section Headline
              </label>
              <input
                type="text"
                value={data.pipelineHeadline || ''}
                onChange={e => onChange({ ...data, pipelineHeadline: e.target.value })}
                placeholder="e.g. Engineered for the complete construction estimation journey."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pipeline Narrative Description
              </label>
              <input
                type="text"
                value={data.pipelineDescription || ''}
                onChange={e => onChange({ ...data, pipelineDescription: e.target.value })}
                placeholder="From raw ingestion to dynamic rate resolution and audit-ready quotation..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pipeline Stages ({stages.length} Stages)
              </span>
              <button
                type="button"
                onClick={() => {
                  const num = String(stages.length + 1).padStart(2, '0');
                  const newStage: PipelineStageConfig = {
                    id: `stage-${Date.now()}`,
                    stageNumber: num,
                    stageTag: `STAGE ${num} OF 04 · Stage Name`,
                    stageHeadline: 'Stage Headline',
                    stageDescription: 'Detailed explanation of processing that occurs in this stage.',
                    bullets: ['Point 1', 'Point 2', 'Point 3'],
                    bottomBadges: ['Operational', 'Sub-second'],
                    activeNode: 'Primary Service Node',
                    streamStates: [
                      { name: 'Stream Monitor 1', status: 'LIVE', detail: '100% OK' }
                    ],
                    filterStatus: 'Precision Filter: Operational'
                  };
                  onChange({ ...data, pipelineStages: [...stages, newStage] });
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={stage.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-blue-700 font-mono">
                      STAGE {stage.stageNumber || idx + 1}: {stage.stageHeadline || 'Untitled Stage'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          pipelineStages: stages.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Stage Number</label>
                      <input
                        type="text"
                        value={stage.stageNumber || ''}
                        onChange={e => {
                          const updated = [...stages];
                          updated[idx].stageNumber = e.target.value;
                          onChange({ ...data, pipelineStages: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="01"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Headline</label>
                      <input
                        type="text"
                        value={stage.stageHeadline || ''}
                        onChange={e => {
                          const updated = [...stages];
                          updated[idx].stageHeadline = e.target.value;
                          onChange({ ...data, pipelineStages: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                        placeholder="Ingest & Parameterize"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Stage Tag Header</label>
                      <input
                        type="text"
                        value={stage.stageTag || ''}
                        onChange={e => {
                          const updated = [...stages];
                          updated[idx].stageTag = e.target.value;
                          onChange({ ...data, pipelineStages: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="STAGE 01 OF 04 · Description"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Stage Description</label>
                    <textarea
                      rows={2}
                      value={stage.stageDescription || ''}
                      onChange={e => {
                        const updated = [...stages];
                        updated[idx].stageDescription = e.target.value;
                        onChange({ ...data, pipelineStages: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      placeholder="Multi-floor dimensional parsing, room-by-room MEP fixture cataloging..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Key Execution Bullets (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(stage.bullets || []).join('\n')}
                        onChange={e => {
                          const updated = [...stages];
                          updated[idx].bullets = e.target.value.split('\n').filter(Boolean);
                          onChange({ ...data, pipelineStages: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="Built-up area aggregation&#10;MEP point quantification&#10;Turnkey quality tier selection"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Bottom Badges (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(stage.bottomBadges || []).join(', ')}
                        onChange={e => {
                          const updated = [...stages];
                          updated[idx].bottomBadges = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          onChange({ ...data, pipelineStages: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="IS 456 Structural Compliant, Real-Time Vector Calculation"
                      />

                      <div className="mt-2">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Right-Box Active Node & Precision Filter
                        </label>
                        <input
                          type="text"
                          value={stage.activeNode || ''}
                          onChange={e => {
                            const updated = [...stages];
                            updated[idx].activeNode = e.target.value;
                            onChange({ ...data, pipelineStages: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono mb-1"
                          placeholder="Active Node: Structural Quantity & Rate Harvester"
                        />
                        <input
                          type="text"
                          value={stage.filterStatus || ''}
                          onChange={e => {
                            const updated = [...stages];
                            updated[idx].filterStatus = e.target.value;
                            onChange({ ...data, pipelineStages: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                          placeholder="Filter: 100% mathematical consistency with zero contractor discrepancy."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: INTERACTIVE STUDIO CAPABILITIES (6 TABS)
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'capabilities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capabilities Section Headline
              </label>
              <input
                type="text"
                value={data.capabilitiesHeadline || ''}
                onChange={e => onChange({ ...data, capabilitiesHeadline: e.target.value })}
                placeholder="Interactive civil estimation & contracting capabilities."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Capabilities Section Description
              </label>
              <input
                type="text"
                value={data.capabilitiesDescription || ''}
                onChange={e => onChange({ ...data, capabilitiesDescription: e.target.value })}
                placeholder="Select a capability below to explore how Buildsmart 360 AI Estimator powers..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Studio Capabilities ({capabilities.length} Tabs)
              </span>
              <button
                type="button"
                onClick={() => {
                  const newCap: FeatureCapabilityConfig = {
                    id: `cap-${Date.now()}`,
                    name: 'New Capability',
                    shortName: 'New Capability',
                    categoryTag: 'QUANTIFY · SYSTEM ENGINE',
                    headline: 'Capability Headline',
                    description: 'Detailed description of this interactive studio capability.',
                    bullets: ['Point 1', 'Point 2', 'Point 3'],
                    specs: [
                      { label: 'PROCESSING SLA', value: '< 15 ms' },
                      { label: 'ACCURACY', value: '99.9%' }
                    ]
                  };
                  onChange({ ...data, capabilities: [...capabilities, newCap] });
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Capability Tab</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {capabilities.map((cap, idx) => (
                <div key={cap.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      TAB {idx + 1}: {cap.shortName || cap.name || 'Untitled Capability'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          capabilities: capabilities.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Capability"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Tab Button Label</label>
                      <input
                        type="text"
                        value={cap.shortName || cap.name || ''}
                        onChange={e => {
                          const updated = [...capabilities];
                          updated[idx].shortName = e.target.value;
                          updated[idx].name = e.target.value;
                          onChange({ ...data, capabilities: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold"
                        placeholder="Dimensional Quantification"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Category Badge Tag</label>
                      <input
                        type="text"
                        value={cap.categoryTag || ''}
                        onChange={e => {
                          const updated = [...capabilities];
                          updated[idx].categoryTag = e.target.value;
                          onChange({ ...data, capabilities: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="QUANTIFY · CIVIL & STRUCTURAL TAKEOFF"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Main Headline</label>
                      <input
                        type="text"
                        value={cap.headline || ''}
                        onChange={e => {
                          const updated = [...capabilities];
                          updated[idx].headline = e.target.value;
                          onChange({ ...data, capabilities: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                        placeholder="High-Precision Dimensional Quantity Surveying"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={cap.description || ''}
                      onChange={e => {
                        const updated = [...capabilities];
                        updated[idx].description = e.target.value;
                        onChange({ ...data, capabilities: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      placeholder="Automatically transform architectural room layouts and floor dimensions into exact..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Feature Bullets (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(cap.bullets || []).join('\n')}
                        onChange={e => {
                          const updated = [...capabilities];
                          updated[idx].bullets = e.target.value.split('\n').filter(Boolean);
                          onChange({ ...data, capabilities: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="Sub-millisecond room dimension parsing&#10;Dynamic deduction for openings&#10;Real-time vector takeoffs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Benchmark Specs (2 Key Metrics)
                      </label>
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cap.specs?.[0]?.label || ''}
                            onChange={e => {
                              const updated = [...capabilities];
                              if (!updated[idx].specs) updated[idx].specs = [{ label: '', value: '' }, { label: '', value: '' }];
                              updated[idx].specs[0].label = e.target.value;
                              onChange({ ...data, capabilities: updated });
                            }}
                            className="flex-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-mono"
                            placeholder="Spec 1 Label"
                          />
                          <input
                            type="text"
                            value={cap.specs?.[0]?.value || ''}
                            onChange={e => {
                              const updated = [...capabilities];
                              if (!updated[idx].specs) updated[idx].specs = [{ label: '', value: '' }, { label: '', value: '' }];
                              updated[idx].specs[0].value = e.target.value;
                              onChange({ ...data, capabilities: updated });
                            }}
                            className="w-28 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-blue-600"
                            placeholder="Value"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cap.specs?.[1]?.label || ''}
                            onChange={e => {
                              const updated = [...capabilities];
                              if (!updated[idx].specs) updated[idx].specs = [{ label: '', value: '' }, { label: '', value: '' }];
                              if (!updated[idx].specs[1]) updated[idx].specs[1] = { label: '', value: '' };
                              updated[idx].specs[1].label = e.target.value;
                              onChange({ ...data, capabilities: updated });
                            }}
                            className="flex-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-mono"
                            placeholder="Spec 2 Label"
                          />
                          <input
                            type="text"
                            value={cap.specs?.[1]?.value || ''}
                            onChange={e => {
                              const updated = [...capabilities];
                              if (!updated[idx].specs) updated[idx].specs = [{ label: '', value: '' }, { label: '', value: '' }];
                              if (!updated[idx].specs[1]) updated[idx].specs[1] = { label: '', value: '' };
                              updated[idx].specs[1].value = e.target.value;
                              onChange({ ...data, capabilities: updated });
                            }}
                            className="w-28 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-emerald-600"
                            placeholder="Value"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 3: ARCHITECTURAL DEEP-DIVE (LAYERS 01-04)
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'deepdive' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deep-Dive Section Headline
              </label>
              <input
                type="text"
                value={data.deepDiveHeadline || ''}
                onChange={e => onChange({ ...data, deepDiveHeadline: e.target.value })}
                placeholder="Engineered layer by layer for security, compliance, and real-time speed."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deep-Dive Narrative
              </label>
              <input
                type="text"
                value={data.deepDiveDescription || ''}
                onChange={e => onChange({ ...data, deepDiveDescription: e.target.value })}
                placeholder="Every tier is purpose-built to eliminate discrepancies and enforce strict governance."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Architectural Layers ({layers.length} Layers)
              </span>
              <button
                type="button"
                onClick={() => {
                  const num = String(layers.length + 1).padStart(2, '0');
                  const newLayer: ArchitectureLayerConfig = {
                    layerNumber: num,
                    sectionTag: `LAYER ${num} · NEW SYSTEM LAYER`,
                    headline: 'Layer Headline',
                    description: 'Technical explanation of this architectural subsystem.',
                    bullets: ['Point 1', 'Point 2', 'Point 3'],
                    tags: ['Python', 'Docker', 'REST API'],
                    rightBoxTitle: 'Active Subsystem Monitor',
                    rightBoxSubtitle: 'Live Telemetry & Ingestion',
                    rightBoxItems: [
                      { label: 'Subsystem Status', status: 'LIVE', detail: 'Operational' }
                    ]
                  };
                  onChange({ ...data, deepDiveLayers: [...layers, newLayer] });
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Layer</span>
              </button>
            </div>

            <div className="space-y-4">
              {layers.map((layer, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-blue-700 font-mono">
                      LAYER {layer.layerNumber || idx + 1}: {layer.headline || 'Untitled Layer'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          deepDiveLayers: layers.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Layer Number</label>
                      <input
                        type="text"
                        value={layer.layerNumber || ''}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].layerNumber = e.target.value;
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="01"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Section Tag</label>
                      <input
                        type="text"
                        value={layer.sectionTag || ''}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].sectionTag = e.target.value;
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="LAYER 01 · SECURE DATA INGESTION"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Headline</label>
                      <input
                        type="text"
                        value={layer.headline || ''}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].headline = e.target.value;
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                        placeholder="Enterprise-grade data persistence powered by Microsoft Dataverse."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={layer.description || ''}
                      onChange={e => {
                        const updated = [...layers];
                        updated[idx].description = e.target.value;
                        onChange({ ...data, deepDiveLayers: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      placeholder="Seamlessly integrate employee registries and real-time logs..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Architecture Bullets (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={(layer.bullets || []).join('\n')}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].bullets = e.target.value.split('\n').filter(Boolean);
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="Point 1&#10;Point 2&#10;Point 3"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Technology Badges (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(layer.tags || []).join(', ')}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono mb-2"
                        placeholder="Python, OpenCV, WebRTC, Brevo"
                      />

                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Right-Box Telemetry Title
                      </label>
                      <input
                        type="text"
                        value={layer.rightBoxTitle || ''}
                        onChange={e => {
                          const updated = [...layers];
                          updated[idx].rightBoxTitle = e.target.value;
                          onChange({ ...data, deepDiveLayers: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="Active Knowledge Ingestion Mesh"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 4: DEPLOYMENT ECOSYSTEM / EDITIONS
         ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'editions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deployment Section Headline
              </label>
              <input
                type="text"
                value={data.editionsHeadline || ''}
                onChange={e => onChange({ ...data, editionsHeadline: e.target.value })}
                placeholder="Enterprise deployment options tailored to your infrastructure."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deployment Section Narrative
              </label>
              <input
                type="text"
                value={data.editionsDescription || ''}
                onChange={e => onChange({ ...data, editionsDescription: e.target.value })}
                placeholder="Choose between lightweight developer studio or high-throughput enterprise cloud."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Deployment Editions ({editions.length} Editions)
              </span>
              <button
                type="button"
                onClick={() => {
                  const newEd: DeploymentEditionConfig = {
                    tier: 'Enterprise Tier',
                    cardTag: 'MISSION-CRITICAL CLOUD',
                    title: 'Enterprise Suite',
                    subtitle: 'Full-featured enterprise edition',
                    badge: 'Production Ready',
                    bullets: ['Feature 1', 'Feature 2', 'Feature 3'],
                    primaryCtaText: 'Schedule Technical Demo',
                    specs: [
                      { label: 'DEPLOYMENT', value: 'Cloud / On-Prem' },
                      { label: 'SLA', value: '99.99%' }
                    ],
                    consoleTitle: 'Deployment Environment',
                    consoleItems: [
                      { label: 'Runtime Status', value: 'Active' }
                    ]
                  };
                  onChange({ ...data, editions: [...editions, newEd] });
                }}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Edition</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editions.map((edition, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-blue-700 font-mono">
                      EDITION {idx + 1}: {edition.title || 'Untitled Edition'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({
                          ...data,
                          editions: editions.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Edition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Edition Title</label>
                      <input
                        type="text"
                        value={edition.title || ''}
                        onChange={e => {
                          const updated = [...editions];
                          updated[idx].title = e.target.value;
                          onChange({ ...data, editions: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                        placeholder="BuildSmart Studio"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Tag Header</label>
                      <input
                        type="text"
                        value={edition.cardTag || ''}
                        onChange={e => {
                          const updated = [...editions];
                          updated[idx].cardTag = e.target.value;
                          onChange({ ...data, editions: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                        placeholder="DEVELOPER WORKSTATION"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={edition.subtitle || ''}
                      onChange={e => {
                        const updated = [...editions];
                        updated[idx].subtitle = e.target.value;
                        onChange({ ...data, editions: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      placeholder="Local-first execution for engineering and technical teams"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Included Capabilities (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(edition.bullets || []).join('\n')}
                      onChange={e => {
                        const updated = [...editions];
                        updated[idx].bullets = e.target.value.split('\n').filter(Boolean);
                        onChange({ ...data, editions: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                      placeholder="Lightweight local execution&#10;Full-featured studio interface&#10;Vector PDF export"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
