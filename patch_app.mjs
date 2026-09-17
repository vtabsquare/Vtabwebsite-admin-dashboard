import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
if (!content.includes("import { IoTEditor }")) {
  content = content.replace(
    "import { AnalyticsDashboard } from './components/AnalyticsDashboard';",
    "import { AnalyticsDashboard } from './components/AnalyticsDashboard';\nimport { IoTEditor } from './components/IoTEditor';"
  );
}

// 2. Add Wifi icon
if (!content.includes("Wifi,")) {
  content = content.replace(
    "import { \n  LayoutDashboard, ",
    "import { \n  LayoutDashboard, \n  Wifi,\n"
  );
}

// 3. Update activeTab state
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'innovations' | 'leads' | 'analytics' | 'careers'>('projects');",
  "const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'innovations' | 'leads' | 'analytics' | 'careers' | 'iot'>('projects');"
);

// 4. Add Sidebar Button
const careersButton = `
            <button 
              onClick={() => { setActiveTab('careers'); setSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
                activeTab === 'careers' ? 'bg-teal-600/10 text-teal-400' : 'hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <Users className="w-5 h-5" /> Careers
            </button>`;

const iotButton = `
            <button 
              onClick={() => { setActiveTab('iot'); setSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
                activeTab === 'iot' ? 'bg-cyan-600/10 text-cyan-400' : 'hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <Wifi className="w-5 h-5" /> IoT & Edge AI
            </button>`;

if (!content.includes("IoT & Edge AI")) {
  content = content.replace(careersButton, careersButton + '\n' + iotButton);
}

// 5. Render IoTEditor in Content Area
const analyticsView = `{/* Analytics View */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}`;

const iotView = `
          {/* IoT View */}
          {activeTab === 'iot' && (
            <IoTEditor />
          )}`;

if (!content.includes("<IoTEditor />")) {
  content = content.replace(analyticsView, analyticsView + '\n' + iotView);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched successfully');
