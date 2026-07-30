import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from './lib/supabaseClient';
import type { Product } from './types';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Lightbulb, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Upload,
  Video,
  Loader2,
  CheckCircle2,
  X,
  Inbox,
  Mail,
  Calendar,
  Building2,
  TrendingUp,
  Zap,
  LogOut,
  FileText,
  Menu
} from 'lucide-react';
import { Login } from './components/Login';

const SUPABASE_MEDIA = 'https://jqxqujrldlutwgkaqwkb.supabase.co/storage/v1/object/public/product-media';

const STREAMING_VIDEOS: Record<string, string> = {
  'ai-reporting-platform': `${SUPABASE_MEDIA}/powerbi/application-analysis-report.mp4`,
  'qlik-to-powerbi-migration': `${SUPABASE_MEDIA}/qlik2powerbi.mp4`,
  'gbti-smart-home-builder': `${SUPABASE_MEDIA}/buildsmart.mp4`,
  'buildsmart-estimator': `${SUPABASE_MEDIA}/buildsmart.mp4`,
  'faceauth': `${SUPABASE_MEDIA}/faceauth.mp4`,
  'packaging-optimization-platform': `${SUPABASE_MEDIA}/l1_agent.mp4`,
  'ai-l1-support-agent': `${SUPABASE_MEDIA}/l1_agent.mp4`,
  'postgresql-to-sqlserver-migration': `${SUPABASE_MEDIA}/qlik2powerbi.mp4`,
  'all-phase-dashboard': `${SUPABASE_MEDIA}/powerbi/e-grow-analysis-dashboard.mp4`,
  'application-analysis-report': `${SUPABASE_MEDIA}/powerbi/application-analysis-report.mp4`,
  'e-grow-analysis-dashboard': `${SUPABASE_MEDIA}/powerbi/e-grow-analysis-dashboard.mp4`,
  'google-analytics-dashboard': `${SUPABASE_MEDIA}/powerbi/google-analytics-dashboard.mp4`,
  'hva-score-analysis-dashboard': `${SUPABASE_MEDIA}/powerbi/hva-score-analysis-dashboard.mp4`,
  'final-quality-inspection-dashboard': `${SUPABASE_MEDIA}/powerbi/final-quality-inspection-dashboard.mp4`,
  'food-inspection-dashboard': `${SUPABASE_MEDIA}/powerbi/food-inspection-dashboard.mp4`,
  'energy-consumption-dashboard': `${SUPABASE_MEDIA}/powerbi/energy-consumption-dashboard.mp4`,
  'hr-analytics-dashboard': `${SUPABASE_MEDIA}/powerbi/google-analytics-dashboard.mp4`,
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'innovations' | 'leads'>('projects');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [projects, setProjects] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [innovations, setInnovations] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsSearch, setLeadsSearch] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Unified Form State for all 3 tabs
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category?: string;
    impactMetric?: string;
    featured?: boolean;
    role?: string;
    status?: string;
    videoUrl?: string;
    pptUrl?: string;
    imageUrl?: string;
    techStack?: string;
    challenge?: string;
    approach?: string;
    feature1Title?: string;
    feature1Desc?: string;
    feature2Title?: string;
    feature2Desc?: string;
    feature3Title?: string;
    feature3Desc?: string;
    benchmark1Val?: string;
    benchmark1Label?: string;
    benchmark1Desc?: string;
    benchmark2Val?: string;
    benchmark2Label?: string;
    benchmark2Desc?: string;
    benchmark3Val?: string;
    benchmark3Label?: string;
    benchmark3Desc?: string;
    // Innovations
    tagline?: string;
    highlights?: string;
    icon?: string;
    // Employees
    capabilities?: string;
    samplePrompt?: string;
    sampleOutput?: string;
    badge?: string;
  }>({
    title: '',
    description: '',
    category: 'Analytics & BI',
    impactMetric: '',
    featured: true,
    role: 'Enterprise Automation',
    status: 'In Development',
    videoUrl: '',
      pptUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'projects') {
      const { data, error } = await supabaseAdmin.from('products').select('*').order('id', { ascending: true });
      if (!error && data) {
        const mappedProducts: Product[] = data.map(item => {
          let demoSnippet: any = item.demo_snippet || item.demoSnippet;
          if (typeof demoSnippet === 'string') {
            try { demoSnippet = JSON.parse(demoSnippet); } catch(e) {}
          }

          let detailContent: any = item.detail_content || item.detailContent;
          if (typeof detailContent === 'string') {
            try { detailContent = JSON.parse(detailContent); } catch(e) {}
          }

          if (!detailContent && demoSnippet && demoSnippet.type === 'detailContent') {
            detailContent = { ...demoSnippet };
            delete detailContent.type;
            demoSnippet = undefined;
          }

          return {
            id: item.id,
            title: item.title,
            shortDescription: item.short_description || item.shortDescription || '',
            fullDescription: item.full_description || item.fullDescription || '',
            category: item.category,
            tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags || [],
            impactMetric: item.impact_metric || item.impactMetric || '',
            keyFeatures: typeof item.key_features === 'string' ? JSON.parse(item.key_features) : item.keyFeatures || item.key_features || [],
            techStack: typeof item.tech_stack === 'string' ? JSON.parse(item.tech_stack) : item.techStack || item.tech_stack || [],
            iconName: item.icon_name || item.iconName || 'Package',
            featured: item.featured ?? true,
            imageUrl: item.image_url || item.imageUrl,
            demoSnippet,
            detailContent
          };
        });
        setProjects(mappedProducts);
      }
    } else if (activeTab === 'employees') {
      const { data, error } = await supabaseAdmin.from('ai_employees').select('*').order('id', { ascending: true });
      if (!error && data) setEmployees(data);
    } else if (activeTab === 'innovations') {
      const { data, error } = await supabaseAdmin.from('innovations').select('*').order('id', { ascending: true });
      if (!error && data) setInnovations(data);
    } else if (activeTab === 'leads') {
      // Fetch demo requests
      // Fetch demo requests using Admin client to bypass RLS
      const { data: demoData } = await supabaseAdmin
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false });
      // Fetch subscribers
      const { data: subData } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      const demoLeads = (demoData || []).map(d => ({
        ...d,
        leadType: (d.interest_area || '').startsWith('[Early Access]') ? 'Early Beta Access' : 'Demo Booking'
      }));
      const subLeads = (subData || []).map(s => ({ 
        id: s.id || s.email,
        full_name: s.name || '—',
        work_email: s.email,
        company_name: '—',
        team_size: '—',
        interest_area: 'Newsletter',
        created_at: s.subscribed_at,
        leadType: 'Newsletter'
      }));
      
      setLeads([...demoLeads, ...subLeads].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ));
    }
    setLoading(false);
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Analytics & BI',
      impactMetric: '',
      featured: true,
      role: 'Enterprise Automation',
      status: 'In Development',
      videoUrl: '',
      pptUrl: '',
      imageUrl: '',
      techStack: 'React, Node.js, Python, Supabase',
      challenge: 'Legacy manual operations cause delays\nHigh operational cost without automation\nLacks real-time data visibility',
      approach: '',
      feature1Title: 'Real-time AI Processing',
      feature1Desc: 'Processes data with sub-second latency.',
      feature2Title: 'Automated Workflows',
      feature2Desc: 'Eliminates repetitive tasks autonomously.',
      feature3Title: 'Enterprise Integration',
      feature3Desc: 'Connects seamlessly with existing ERP and databases.',
      benchmark1Val: '< 15 ms',
      benchmark1Label: 'API Query Latency',
      benchmark1Desc: '99th percentile response time across distributed edge nodes.',
      benchmark2Val: '99.99%',
      benchmark2Label: 'System Uptime SLA',
      benchmark2Desc: 'Multi-region active-active replication with automated failover.',
      benchmark3Val: '10x',
      benchmark3Label: 'Throughput Scaling',
      benchmark3Desc: 'Auto-scaling worker pods handling burst data ingestion spikes.',
      // Innovations
      tagline: '',
      highlights: '',
      icon: 'Cpu',
      // Employees
      capabilities: '',
      samplePrompt: '',
      sampleOutput: '',
      badge: 'Alpha Testing'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'projects') {
      const existingVideo = item.detailContent?.videoUrl || (item.demoSnippet as any)?.videoUrl || STREAMING_VIDEOS[item.id] || '';
      const detail: any = item.detailContent || item.demoSnippet || {};
      const features: any[] = detail.features || item.keyFeatures || [
        { title: 'Real-time AI Processing', description: 'Processes data with sub-second latency.' },
        { title: 'Automated Workflows', description: 'Eliminates repetitive tasks autonomously.' },
        { title: 'Enterprise Integration', description: 'Connects seamlessly with existing ERP and databases.' }
      ];
      const benchmarks: any[] = detail.benchmarks || [
        { val: '< 15 ms', label: 'API Query Latency', desc: '99th percentile response time across distributed edge nodes.' },
        { val: '99.99%', label: 'System Uptime SLA', desc: 'Multi-region active-active replication with automated failover.' },
        { val: '10x', label: 'Throughput Scaling', desc: 'Auto-scaling worker pods handling burst data ingestion spikes.' }
      ];
      const techStackArr: string[] = item.techStack || item.tech_stack || ['React', 'Node.js', 'Python', 'Supabase'];
      const challengeArr: string[] = detail.challenge || ['Legacy manual operations cause delays', 'High operational cost without automation'];

      setFormData({
        title: item.title || '',
        description: item.shortDescription || item.short_description || '',
        category: item.category || 'Analytics & BI',
        impactMetric: item.impactMetric || item.impact_metric || '',
        videoUrl: existingVideo,
        pptUrl: detail.pptUrl || item.pptUrl || '',
        techStack: techStackArr.join(', '),
        challenge: challengeArr.join('\n'),
        approach: detail.approach || item.fullDescription || item.full_description || '',
        feature1Title: typeof features[0] === 'string' ? features[0] : (features[0]?.title || ''),
        feature1Desc: typeof features[0] === 'string' ? '' : (features[0]?.description || ''),
        feature2Title: typeof features[1] === 'string' ? features[1] : (features[1]?.title || ''),
        feature2Desc: typeof features[1] === 'string' ? '' : (features[1]?.description || ''),
        feature3Title: typeof features[2] === 'string' ? features[2] : (features[2]?.title || ''),
        feature3Desc: typeof features[2] === 'string' ? '' : (features[2]?.description || ''),
        benchmark1Val: benchmarks[0]?.val || '< 15 ms',
        benchmark1Label: benchmarks[0]?.label || 'API Query Latency',
        benchmark1Desc: benchmarks[0]?.desc || '',
        benchmark2Val: benchmarks[1]?.val || '99.99%',
        benchmark2Label: benchmarks[1]?.label || 'System Uptime SLA',
        benchmark2Desc: benchmarks[1]?.desc || '',
        benchmark3Val: benchmarks[2]?.val || '10x',
        benchmark3Label: benchmarks[2]?.label || 'Throughput Scaling',
        benchmark3Desc: benchmarks[2]?.desc || '',
        featured: item.featured ?? true,
        imageUrl: item.imageUrl || item.image_url || ''
      });
    } else if (activeTab === 'employees') {
      const capArr: string[] = Array.isArray(item.capabilities) ? item.capabilities : (typeof item.capabilities === 'string' ? JSON.parse(item.capabilities || '[]') : []);
      setFormData({
        title: item.title || '',
        description: item.description || '',
        role: item.role || 'Enterprise Automation',
        capabilities: capArr.join('\n'),
        samplePrompt: item.sample_prompt || item.samplePrompt || '',
        sampleOutput: item.sample_output || item.sampleOutput || '',
        badge: item.badge || 'Alpha Testing',
        icon: item.icon || 'Cpu'
      });
    } else if (activeTab === 'innovations') {
      const hlArr: string[] = Array.isArray(item.highlights) ? item.highlights : (typeof item.highlights === 'string' ? JSON.parse(item.highlights || '[]') : []);
      setFormData({
        title: item.title || '',
        description: item.description || '',
        status: item.status || 'In Development',
        tagline: item.tagline || '',
        highlights: hlArr.join('\n'),
        icon: item.icon || 'Cpu'
      });
    }
    setIsModalOpen(true);
  };


  const handlePptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const fileName = `presentations/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage.from('product-media').upload(fileName, file);
    
    if (error) {
      alert('Upload failed: ' + error.message);
    } else if (data) {
      const { data: { publicUrl } } = supabaseAdmin.storage.from('product-media').getPublicUrl(data.path);
      setFormData({ ...formData, pptUrl: publicUrl });
    }
    setIsUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const fileName = `custom/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage.from('product-media').upload(fileName, file);
    
    if (error) {
      alert('Upload failed: ' + error.message);
    } else if (data) {
      const { data: { publicUrl } } = supabaseAdmin.storage.from('product-media').getPublicUrl(data.path);
      setFormData({ ...formData, videoUrl: publicUrl });
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || (formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-item');

    let table = 'products';
    let payload: any = {};

    if (activeTab === 'projects') {
      table = 'products';
      const techStackArr = formData.techStack ? formData.techStack.split(',').map(s => s.trim()).filter(Boolean) : ['React', 'Node.js', 'Python', 'Supabase'];
      const challengeArr = formData.challenge ? formData.challenge.split('\n').map(s => s.trim()).filter(Boolean) : ['Legacy manual operations cause delays', 'High operational cost without automation'];
      const approachStr = formData.approach || formData.description;
      const featArr = [
        { title: formData.feature1Title || 'Real-time AI Processing', description: formData.feature1Desc || 'Processes data with sub-second latency.' },
        { title: formData.feature2Title || 'Automated Workflows', description: formData.feature2Desc || 'Eliminates repetitive tasks autonomously.' },
        { title: formData.feature3Title || 'Enterprise Integration', description: formData.feature3Desc || 'Connects seamlessly with existing ERP and databases.' }
      ];
      const bmArr = [
        { val: formData.benchmark1Val || '< 15 ms', label: formData.benchmark1Label || 'API Query Latency', desc: formData.benchmark1Desc || '99th percentile response time across distributed edge nodes.' },
        { val: formData.benchmark2Val || '99.99%', label: formData.benchmark2Label || 'System Uptime SLA', desc: formData.benchmark2Desc || 'Multi-region active-active replication with automated failover.' },
        { val: formData.benchmark3Val || '10x', label: formData.benchmark3Label || 'Throughput Scaling', desc: formData.benchmark3Desc || 'Auto-scaling worker pods handling burst data ingestion spikes.' }
      ];

      payload = {
        title: formData.title,
        short_description: formData.description,
        full_description: approachStr,
        category: formData.category,
        impact_metric: formData.impactMetric,
        icon_name: 'Package',
        featured: formData.featured ?? true,
        image_url: formData.imageUrl || null,
        tags: ['New', 'Beta'],
        key_features: featArr.map(f => f.title),
        tech_stack: techStackArr,
        demo_snippet: {
          type: 'detailContent',
          videoUrl: formData.videoUrl || '',
          pptUrl: formData.pptUrl || '',
          approach: approachStr,
          challenge: challengeArr,
          features: featArr,
          benchmarks: bmArr,
          impact: [formData.impactMetric || '10x Faster Operations', '99.9% Uptime Reliability']
        }
      };
      if (!editingId) payload.id = id;
    } else if (activeTab === 'employees') {
      table = 'ai_employees';
      const capArr = formData.capabilities ? formData.capabilities.split('\n').map(s => s.trim()).filter(Boolean) : [];
      payload = {
        title: formData.title,
        description: formData.description,
        role: formData.role || 'Enterprise Automation',
        capabilities: capArr,
        sample_prompt: formData.samplePrompt || '',
        sample_output: formData.sampleOutput || '',
        badge: formData.badge || 'Alpha Testing',
        icon: formData.icon || 'Cpu'
      };
      if (!editingId) payload.id = id;
    } else if (activeTab === 'innovations') {
      table = 'innovations';
      const hlArr = formData.highlights ? formData.highlights.split('\n').map(s => s.trim()).filter(Boolean) : [];
      payload = {
        title: formData.title,
        description: formData.description,
        tagline: formData.tagline || '',
        highlights: hlArr,
        icon: formData.icon || 'Cpu',
        status: formData.status || 'In Development'
      };
      if (!editingId) payload.id = id;
    }

    const { error } = editingId 
      ? await supabaseAdmin.from(table).update(payload).eq('id', editingId)
      : await supabaseAdmin.from(table).insert([payload]);

    if (error) {
      alert('Error saving record: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (confirm(`Are you sure you want to delete this from ${table}?`)) {
      await supabaseAdmin.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-wide">VTAB ADMIN</span>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'projects' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" /> Projects
          </button>
          <button 
            onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'employees' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" /> AI Employees
          </button>
          <button 
            onClick={() => { setActiveTab('innovations'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'innovations' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Lightbulb className="w-5 h-5" /> Innovations
          </button>

          <div className="my-2 border-t border-slate-800" />
          
          <button 
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'leads' ? 'bg-emerald-600/10 text-emerald-400' : 'hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span>Leads</span>
            {leads.length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-emerald-500 text-white rounded-full px-2 py-0.5">
                {leads.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm shrink-0">
          {/* Top row: hamburger + title + action button */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <div className="flex items-center gap-3">
              {/* Hamburger - mobile only */}
              <button
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                  {activeTab === 'leads' ? 'Leads & Inquiries' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Directory`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">
                  {activeTab === 'leads' 
                    ? `${leads.length} total leads — demo bookings & newsletter subscribers`
                    : `Manage your VTAB Square ${activeTab} portfolio`
                  }
                </p>
              </div>
            </div>
            {/* Add button - always visible on right */}
            {activeTab !== 'leads' && (
              <button 
                onClick={handleOpenNewModal}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New {activeTab === 'projects' ? 'Project' : activeTab === 'employees' ? 'Employee' : 'Innovation'}</span>
                <span className="sm:hidden">New</span>
              </button>
            )}
            {activeTab === 'leads' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold">
                  <Mail className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {leads.filter(l => l.leadType === 'Demo Booking').length} Demos
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-xs font-bold">
                  <TrendingUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {leads.filter(l => l.leadType === 'Newsletter').length} Subs
                </span>
              </div>
            )}
          </div>
          {/* Search bar - full width on mobile */}
          <div className="px-4 sm:px-8 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'leads' ? 'Search leads...' : `Search ${activeTab}...`}
                value={activeTab === 'leads' ? leadsSearch : undefined}
                onChange={activeTab === 'leads' ? e => setLeadsSearch(e.target.value) : undefined}
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 bg-slate-50">

          {/* Leads View */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 font-medium">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No leads yet. Demo bookings and newsletter subscribers will appear here.</p>
                </div>
              ) : (
                leads
                  .filter(lead => {
                    const q = leadsSearch.toLowerCase();
                    return !q || 
                      (lead.full_name || '').toLowerCase().includes(q) ||
                      (lead.work_email || '').toLowerCase().includes(q) ||
                      (lead.company_name || '').toLowerCase().includes(q) ||
                      (lead.interest_area || '').toLowerCase().includes(q);
                  })
                  .map((lead, idx) => (
                    <div key={lead.id || idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 hover:shadow-md transition-shadow group">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            lead.leadType === 'Demo Booking' 
                              ? 'bg-blue-50 border-blue-200 text-blue-600' 
                              : lead.leadType === 'Early Beta Access'
                              ? 'bg-purple-50 border-purple-200 text-purple-600'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          }`}>
                            {lead.leadType === 'Demo Booking' ? <Calendar className="w-5 h-5" /> : lead.leadType === 'Early Beta Access' ? <Zap className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                          </div>
                          
                          {/* Lead Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900 text-sm">{lead.full_name || lead.work_email}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                lead.leadType === 'Demo Booking'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : lead.leadType === 'Early Beta Access'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}>
                                {lead.leadType}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <a href={`mailto:${lead.work_email}`} className="hover:text-blue-600 transition-colors">{lead.work_email}</a>
                              </span>
                              {lead.company_name && lead.company_name !== '—' && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {lead.company_name}
                                </span>
                              )}
                              {lead.team_size && lead.team_size !== '—' && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {lead.team_size}
                                </span>
                              )}
                              {lead.interest_area && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {lead.interest_area}
                                </span>
                              )}
                            </div>
                            {lead.message && (
                              <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 line-clamp-2">
                                {lead.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Date + Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-xs text-slate-400 whitespace-nowrap">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                          {lead.preferred_date && lead.preferred_date !== 'Flexible' && (
                            <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-0.5 font-medium">
                              📅 Preferred: {lead.preferred_date}
                            </span>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                              href={`mailto:${lead.work_email}?subject=Re: Your VTAB Square Demo Request&body=Hi ${lead.full_name || ''},`}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Reply via Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <button 
                              onClick={async () => {
                                const table = lead.leadType === 'Demo Booking' ? 'demo_requests' : 'subscribers';
                                if (confirm('Delete this lead?')) {
                                  await supabase.from(table).delete().eq(
                                    lead.leadType === 'Newsletter' ? 'email' : 'id', 
                                    lead.leadType === 'Newsletter' ? lead.work_email : lead.id
                                  );
                                  fetchData();
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Projects / Employees / Innovations Table */}
          {activeTab !== 'leads' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Title</th>
                  {activeTab === 'projects' && <th className="px-6 py-4">Category</th>}
                  {activeTab === 'employees' && <th className="px-6 py-4">Role</th>}
                  {activeTab === 'innovations' && <th className="px-6 py-4">Status</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Loading database...</td></tr>
                ) : (activeTab === 'projects' && projects.length === 0) || (activeTab === 'employees' && employees.length === 0) || (activeTab === 'innovations' && innovations.length === 0) ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No records found.</td></tr>
                ) : (
                  <>
                    {activeTab === 'projects' && projects.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500 truncate w-64">{item.shortDescription}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id, 'products')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeTab === 'employees' && employees.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                              <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500 truncate w-64">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id, 'ai_employees')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeTab === 'innovations' && innovations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                              <Lightbulb className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500 truncate w-64">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id, 'innovations')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
            </div>
          </div>
          )}
        </main>
      </div>

      {/* Unified Add/Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className={`bg-white rounded-3xl shadow-2xl w-full ${activeTab === 'projects' ? 'max-w-3xl' : 'max-w-lg'} overflow-hidden border border-slate-200/50 max-h-[90vh] flex flex-col`}>
            <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between relative">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Record' : `Add New ${activeTab === 'projects' ? 'Project' : activeTab === 'employees' ? 'AI Employee' : 'Innovation'}`}</h2>
                <p className="text-sm text-slate-500 mt-1">{editingId ? 'Update existing details in database' : 'Deploy a new item to your public website'}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                title="Close Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Title / Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Short Description</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  placeholder="Enter brief description..."
                />
              </div>

              {activeTab === 'projects' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      >
                        <option value="Analytics & BI">Analytics & BI</option>
                        <option value="Enterprise Automation">Enterprise Automation</option>
                        <option value="Database & Migration">Database & Migration</option>
                        <option value="AI Vision & Construction">AI Vision & Construction</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Healthcare">Healthcare</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Impact Metric</label>
                      <input 
                        required
                        type="text" 
                        value={formData.impactMetric}
                        onChange={e => setFormData({...formData, impactMetric: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. 50% Faster"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Project Image URL</label>
                      <input 
                        type="text" 
                        value={formData.imageUrl || ''}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="https://... or /src/assets/images/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Show in AI Portfolio</label>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, featured: !formData.featured})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                            formData.featured ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            formData.featured ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-sm font-medium text-slate-600">
                          {formData.featured ? 'Featured — shown in portfolio' : 'Hidden from portfolio'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tech Stack (comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.techStack || ''}
                      onChange={e => setFormData({...formData, techStack: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium transition-all"
                      placeholder="e.g. React, Node.js, Python, Supabase"
                    />
                  </div>

                  {/* Video Upload / URL Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-600" />
                      Project Demo Video
                    </label>

                    <div>
                      <input 
                        type="text" 
                        value={formData.videoUrl || ''}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono transition-all placeholder:text-slate-400"
                        placeholder="Paste video URL (MP4/Supabase Media URL)..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">OR</span>
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer transition-all">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Uploading to Storage...</span>
                          </>
                        ) : formData.videoUrl ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="truncate max-w-[180px]">Video Attached</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload MP4 File</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleFileUpload} 
                          disabled={isUploading}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* PPT Upload / URL Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Presentation URL (PPT/PDF)
                    </label>

                    <div>
                      <input 
                        type="text" 
                        value={formData.pptUrl || ''}
                        onChange={e => setFormData({...formData, pptUrl: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs font-mono transition-all placeholder:text-slate-400"
                        placeholder="Paste URL or upload file..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">OR</span>
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-slate-300 hover:border-purple-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-purple-600 cursor-pointer transition-all">
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 animate-spin text-purple-600 border-2 border-purple-600 border-t-transparent rounded-full" />
                            <span>Uploading...</span>
                          </>
                        ) : formData.pptUrl ? (
                          <>
                            <div className="w-4 h-4 text-green-500 flex items-center justify-center font-bold">✓</div>
                            <span className="truncate max-w-[180px]">File Attached</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload PPT/PDF</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept=".ppt,.pptx,.pdf" 
                          onChange={handlePptUpload} 
                          disabled={isUploading}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Explore Architecture & Specs Section Header */}
                  <div className="pt-3 border-t border-slate-200 space-y-4">
                    <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                      Explore Architecture & Deep-Dive Specs Configuration
                    </h3>

                    {/* The Challenge */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">The Challenge / Problem Statement (One bullet per line)</label>
                      <textarea 
                        rows={2}
                        value={formData.challenge || ''}
                        onChange={e => setFormData({...formData, challenge: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium transition-all"
                        placeholder="Legacy manual operations cause delays&#10;High operational cost without automation"
                      />
                    </div>

                    {/* The Approach */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">The Approach / Technical Solution</label>
                      <textarea 
                        rows={2}
                        value={formData.approach || ''}
                        onChange={e => setFormData({...formData, approach: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium transition-all"
                        placeholder="Detail the technical architecture and solution approach..."
                      />
                    </div>

                    {/* Core System Capabilities / Features */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">System Intelligence & Features (3 Cards)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <input 
                            type="text" 
                            value={formData.feature1Title || ''}
                            onChange={e => setFormData({...formData, feature1Title: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Feature 1 Title"
                          />
                          <input 
                            type="text" 
                            value={formData.feature1Desc || ''}
                            onChange={e => setFormData({...formData, feature1Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]"
                            placeholder="Feature 1 Description"
                          />
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <input 
                            type="text" 
                            value={formData.feature2Title || ''}
                            onChange={e => setFormData({...formData, feature2Title: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Feature 2 Title"
                          />
                          <input 
                            type="text" 
                            value={formData.feature2Desc || ''}
                            onChange={e => setFormData({...formData, feature2Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]"
                            placeholder="Feature 2 Description"
                          />
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <input 
                            type="text" 
                            value={formData.feature3Title || ''}
                            onChange={e => setFormData({...formData, feature3Title: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Feature 3 Title"
                          />
                          <input 
                            type="text" 
                            value={formData.feature3Desc || ''}
                            onChange={e => setFormData({...formData, feature3Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]"
                            placeholder="Feature 3 Description"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Benchmarks & SLA */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Architecture Benchmarks & Specs (3 Metrics)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <input 
                            type="text" 
                            value={formData.benchmark1Val || ''}
                            onChange={e => setFormData({...formData, benchmark1Val: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-extrabold text-blue-600"
                            placeholder="e.g. < 15 ms"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark1Label || ''}
                            onChange={e => setFormData({...formData, benchmark1Label: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Label (e.g. API Latency)"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark1Desc || ''}
                            onChange={e => setFormData({...formData, benchmark1Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px]"
                            placeholder="Description"
                          />
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <input 
                            type="text" 
                            value={formData.benchmark2Val || ''}
                            onChange={e => setFormData({...formData, benchmark2Val: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-extrabold text-emerald-600"
                            placeholder="e.g. 99.99%"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark2Label || ''}
                            onChange={e => setFormData({...formData, benchmark2Label: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Label (e.g. Uptime SLA)"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark2Desc || ''}
                            onChange={e => setFormData({...formData, benchmark2Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px]"
                            placeholder="Description"
                          />
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <input 
                            type="text" 
                            value={formData.benchmark3Val || ''}
                            onChange={e => setFormData({...formData, benchmark3Val: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-extrabold text-purple-600"
                            placeholder="e.g. 10x"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark3Label || ''}
                            onChange={e => setFormData({...formData, benchmark3Label: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                            placeholder="Label (e.g. Scaling)"
                          />
                          <input 
                            type="text" 
                            value={formData.benchmark3Desc || ''}
                            onChange={e => setFormData({...formData, benchmark3Desc: e.target.value})}
                            className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px]"
                            placeholder="Description"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'employees' && (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department / Role</label>
                      <input 
                        required
                        type="text" 
                        value={formData.role || ''}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. Enterprise Automation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Badge / Status</label>
                      <select 
                        value={formData.badge || 'Alpha Testing'}
                        onChange={e => setFormData({...formData, badge: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      >
                        <option value="Alpha Testing">Alpha Testing</option>
                        <option value="In Development">In Development</option>
                        <option value="Private Beta">Private Beta</option>
                        <option value="Live">Live</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Icon Name (Lucide)</label>
                    <input 
                      type="text" 
                      value={formData.icon || ''}
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="e.g. Mic, Users, FileText, Code2, Sparkles, Cpu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Capabilities (one per line)</label>
                    <textarea 
                      rows={3}
                      value={formData.capabilities || ''}
                      onChange={e => setFormData({...formData, capabilities: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="Multilingual transcription&#10;Real-time speaker identification&#10;Auto-sync to Jira"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sample Prompt</label>
                      <textarea 
                        rows={2}
                        value={formData.samplePrompt || ''}
                        onChange={e => setFormData({...formData, samplePrompt: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium transition-all"
                        placeholder="Summarize the quarterly product roadmap meeting..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sample Output</label>
                      <textarea 
                        rows={2}
                        value={formData.sampleOutput || ''}
                        onChange={e => setFormData({...formData, sampleOutput: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium transition-all"
                        placeholder="Decision: Approved v2.4 launch date for Oct 15..."
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'innovations' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tagline <span className="normal-case font-normal text-slate-400">(shown under title in Future Innovations section)</span></label>
                    <input 
                      type="text"
                      value={formData.tagline || ''}
                      onChange={e => setFormData({...formData, tagline: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="e.g. Never take meeting notes manually again"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status / Label</label>
                      <select 
                        value={formData.status || 'In Development'}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      >
                        <option value="Upcoming">🔜 Upcoming</option>
                        <option value="In Development">🔧 In Development</option>
                        <option value="Alpha Testing">🧪 Alpha Testing</option>
                        <option value="Private Beta">🔒 Private Beta</option>
                        <option value="Live">✅ Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Icon Name (Lucide)</label>
                      <input 
                        type="text" 
                        value={formData.icon || ''}
                        onChange={e => setFormData({...formData, icon: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. Mic, Users, FileText, Code2, Sparkles"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Feature Highlights <span className="normal-case font-normal text-slate-400">(one per line — shown as bullet points)</span></label>
                    <textarea 
                      rows={4}
                      value={formData.highlights || ''}
                      onChange={e => setFormData({...formData, highlights: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="Real-time speaker sentiment & engagement index&#10;Automatic task assignment into Jira & Trello&#10;Support for 40+ languages"
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Save Changes' : 'Publish Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
