import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* Sidebar \*\/\}[\s\S]*?<\/nav>/;

const newSidebar = `{/* Sidebar */}
      <div className={\`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out \${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }\`}>
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
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'projects' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Package className="w-5 h-5" /> Projects
          </button>
          <button 
            onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'employees' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Users className="w-5 h-5" /> AI Employees
          </button>
          <button 
            onClick={() => { setActiveTab('innovations'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'innovations' ? 'bg-amber-600/10 text-amber-500' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Lightbulb className="w-5 h-5" /> Labs & Innovations
          </button>
          <button 
            onClick={() => { setActiveTab('careers'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'careers' ? 'bg-teal-600/10 text-teal-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Users className="w-5 h-5" /> Careers
          </button>
          <button 
            onClick={() => { setActiveTab('iot'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'iot' ? 'bg-cyan-600/10 text-cyan-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Wifi className="w-5 h-5" /> IoT & Edge AI
          </button>

          <div className="my-2 border-t border-slate-800" />
          
          <button 
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'leads' ? 'bg-emerald-600/10 text-emerald-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <Inbox className="w-5 h-5" />
            <span>Leads</span>
            {leads.length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-emerald-500 text-white rounded-full px-2 py-0.5">
                {leads.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
              activeTab === 'analytics' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800/50 hover:text-white'
            }\`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Visitors</span>
            <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white rounded-full px-2 py-0.5">LIVE</span>
          </button>
        </nav>`;

content = content.replace(regex, newSidebar);
fs.writeFileSync('src/App.tsx', content);
console.log('Sidebar perfectly replaced.');
