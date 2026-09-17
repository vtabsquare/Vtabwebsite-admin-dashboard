import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const brokenSection = `          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
          <button `;

const fixedSection = `          <button
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
          <button `;

content = content.replace(brokenSection, fixedSection);

const careersSection = `            <button 
              onClick={() => { setActiveTab('careers'); setSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
                activeTab === 'careers' ? 'bg-teal-600/10 text-teal-400' : 'hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <Users className="w-5 h-5" /> Careers
            </button>`;

const iotSection = `
            <button 
              onClick={() => { setActiveTab('iot'); setSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer \${
                activeTab === 'iot' ? 'bg-cyan-600/10 text-cyan-400' : 'hover:bg-slate-800/50 hover:text-white'
              }\`}
            >
              <Wifi className="w-5 h-5" /> IoT & Edge AI
            </button>`;

if (!content.includes("IoT & Edge AI")) {
  content = content.replace(careersSection, careersSection + iotSection);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx sidebar patched successfully');
