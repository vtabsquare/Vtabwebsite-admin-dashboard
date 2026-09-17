import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /(<Users className="w-5 h-5" \/> Careers\s*<\/button>)/g;
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
  content = content.replace(regex, "$1" + iotSection);
  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx sidebar patched successfully via regex');
} else {
  console.log('IoT button already exists');
}
