const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Helper to replace precisely
function replaceExact(find, replace, errorMessage) {
  if (content.includes(find)) {
    content = content.replace(find, replace);
  } else {
    console.error("COULD NOT FIND:", errorMessage);
    process.exit(1);
  }
}

// 1. Update activeTab type
replaceExact(
  "const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'innovations' | 'leads' | 'analytics'>('projects');",
  "const [activeTab, setActiveTab] = useState<'projects' | 'employees' | 'innovations' | 'leads' | 'analytics' | 'careers'>('projects');",
  "activeTab definition"
);

// 2. Add careers state
replaceExact(
  "const [innovations, setInnovations] = useState<any[]>([]);\n  const [leads, setLeads] = useState<any[]>([]);",
  "const [innovations, setInnovations] = useState<any[]>([]);\n  const [careers, setCareers] = useState<any[]>([]);\n  const [leads, setLeads] = useState<any[]>([]);",
  "innovations state"
);

// 3. Add to formData
replaceExact(
  "    badge?: string;\n  }>({",
  "    badge?: string;\n    // Careers\n    department?: string;\n    location?: string;\n    type?: string;\n    experience?: string;\n    requirements?: string;\n  }>({",
  "formData interface"
);

// 4. Update fetchData
replaceExact(
  "    } else if (activeTab === 'innovations') {\n      const { data, error } = await supabase.from('innovations').select('*').order('id', { ascending: true });\n      if (!error && data) setInnovations(data);\n    } else if (activeTab === 'leads') {",
  "    } else if (activeTab === 'innovations') {\n      const { data, error } = await supabase.from('innovations').select('*').order('id', { ascending: true });\n      if (!error && data) setInnovations(data);\n    } else if (activeTab === 'careers') {\n      const { data, error } = await supabase.from('career_roles').select('*').order('created_at', { ascending: false });\n      if (!error && data) setCareers(data);\n    } else if (activeTab === 'leads') {",
  "fetchData innovations block"
);

// 5. Update handleOpenNewModal
replaceExact(
  "      // Employees\n      capabilities: '',\n      samplePrompt: '',\n      sampleOutput: '',\n      badge: ''\n    });",
  "      // Employees\n      capabilities: '',\n      samplePrompt: '',\n      sampleOutput: '',\n      badge: '',\n      // Careers\n      department: '',\n      location: '',\n      type: 'Full-time',\n      experience: '',\n      requirements: ''\n    });",
  "handleOpenNewModal reset block"
);

// 6. Update handleEdit
replaceExact(
  "    } else if (activeTab === 'innovations') {\n      setFormData({\n        title: item.title || '',\n        description: item.description || '',\n        tagline: item.tagline || '',\n        highlights: item.highlights || '',\n        icon: item.icon || 'Lightbulb',\n        status: item.status || 'In Development',\n      });\n    }\n    setIsModalOpen(true);\n  };",
  "    } else if (activeTab === 'innovations') {\n      setFormData({\n        title: item.title || '',\n        description: item.description || '',\n        tagline: item.tagline || '',\n        highlights: item.highlights || '',\n        icon: item.icon || 'Lightbulb',\n        status: item.status || 'In Development',\n      });\n    } else if (activeTab === 'careers') {\n      const reqArr: string[] = Array.isArray(item.requirements) ? item.requirements : (typeof item.requirements === 'string' ? JSON.parse(item.requirements || '[]') : []);\n      setFormData({\n        title: item.title || '',\n        description: item.description || '',\n        department: item.department || '',\n        location: item.location || '',\n        type: item.type || 'Full-time',\n        experience: item.experience || '',\n        requirements: reqArr.join('\\n')\n      });\n    }\n    setIsModalOpen(true);\n  };",
  "handleEdit block"
);

// 7. Update handleSave
replaceExact(
  "    } else if (activeTab === 'innovations') {\n      table = 'innovations';\n      payload = {\n        title: formData.title,\n        description: formData.description,\n        tagline: formData.tagline,\n        highlights: formData.highlights,\n        icon: formData.icon,\n        status: formData.status\n      };\n      if (!editingId) payload.id = id;\n    }\n\n    const { error } = editingId ",
  "    } else if (activeTab === 'innovations') {\n      table = 'innovations';\n      payload = {\n        title: formData.title,\n        description: formData.description,\n        tagline: formData.tagline,\n        highlights: formData.highlights,\n        icon: formData.icon,\n        status: formData.status\n      };\n      if (!editingId) payload.id = id;\n    } else if (activeTab === 'careers') {\n      table = 'career_roles';\n      const reqArr = formData.requirements ? formData.requirements.split('\\n').map(s => s.trim()).filter(Boolean) : [];\n      payload = {\n        title: formData.title,\n        description: formData.description,\n        department: formData.department,\n        location: formData.location,\n        type: formData.type,\n        experience: formData.experience,\n        requirements: reqArr\n      };\n      if (!editingId) payload.id = id;\n    }\n\n    const { error } = editingId ",
  "handleSave block"
);

// 8. Add Sidebar link (after innovations)
replaceExact(
  "          <button \n            onClick={() => { setActiveTab('innovations'); setSidebarOpen(false); }}\n            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${\n              activeTab === 'innovations' ? 'bg-amber-600/10 text-amber-500' : 'hover:bg-slate-800/50 hover:text-white'\n            }`}\n          >\n            <Lightbulb className=\"w-5 h-5\" /> Labs & Innovations\n          </button>",
  "          <button \n            onClick={() => { setActiveTab('innovations'); setSidebarOpen(false); }}\n            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${\n              activeTab === 'innovations' ? 'bg-amber-600/10 text-amber-500' : 'hover:bg-slate-800/50 hover:text-white'\n            }`}\n          >\n            <Lightbulb className=\"w-5 h-5\" /> Labs & Innovations\n          </button>\n          <button \n            onClick={() => { setActiveTab('careers'); setSidebarOpen(false); }}\n            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${\n              activeTab === 'careers' ? 'bg-teal-600/10 text-teal-400' : 'hover:bg-slate-800/50 hover:text-white'\n            }`}\n          >\n            <Users className=\"w-5 h-5\" /> Careers\n          </button>",
  "Sidebar links"
);

// 9. Update table header
replaceExact(
  "                  {activeTab === 'employees' && <th className=\"px-6 py-4\">Role</th>}\n                  {activeTab === 'innovations' && <th className=\"px-6 py-4\">Status</th>}\n                  <th className=\"px-6 py-4 text-right\">Actions</th>",
  "                  {activeTab === 'employees' && <th className=\"px-6 py-4\">Role</th>}\n                  {activeTab === 'innovations' && <th className=\"px-6 py-4\">Status</th>}\n                  {activeTab === 'careers' && <th className=\"px-6 py-4\">Department</th>}\n                  {activeTab === 'careers' && <th className=\"px-6 py-4\">Location</th>}\n                  <th className=\"px-6 py-4 text-right\">Actions</th>",
  "Table headers"
);

// 10. Update table rows (after innovations map)
const careersTBodyStr = `
                    {activeTab === 'careers' && careers.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                              <Users className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500 truncate w-64">{item.type} • {item.experience}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 border border-teal-200">
                            {item.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {item.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id, 'career_roles')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
`;
replaceExact(
  "                    {activeTab === 'innovations' && innovations.map((item) => (",
  careersTBodyStr + "\n                    {activeTab === 'innovations' && innovations.map((item) => (",
  "Table body map"
);

// 11. Modal Title
replaceExact(
  "                  <h2 className=\"text-xl font-bold text-slate-900\">{editingId ? 'Edit Record' : `Add New ${activeTab === 'projects' ? 'Project' : activeTab === 'employees' ? 'AI Employee' : 'Innovation'}`}</h2>",
  "                  <h2 className=\"text-xl font-bold text-slate-900\">{editingId ? 'Edit Record' : `Add New ${activeTab === 'projects' ? 'Project' : activeTab === 'employees' ? 'AI Employee' : activeTab === 'careers' ? 'Career Role' : 'Innovation'}`}</h2>",
  "Modal Title"
);

// 12. Modal fields (after employees)
const careersModalStr = `
              {activeTab === 'careers' && (
                <>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department</label>
                      <input 
                        type="text" 
                        value={formData.department || ''}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. AI Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                      <input 
                        type="text" 
                        value={formData.location || ''}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. Hybrid / Remote"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Employment Type</label>
                      <input 
                        type="text" 
                        value={formData.type || ''}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. Full-time"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience</label>
                      <input 
                        type="text" 
                        value={formData.experience || ''}
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. 4+ Years"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Requirements (one per line)</label>
                    <textarea 
                      rows={5}
                      value={formData.requirements || ''}
                      onChange={e => setFormData({...formData, requirements: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="Requirement 1\\nRequirement 2"
                    />
                  </div>
                </>
              )}
`;

replaceExact(
  "              {activeTab === 'innovations' && (",
  careersModalStr + "\n              {activeTab === 'innovations' && (",
  "Modal fields"
);

// 13. Empty states in table tbody
replaceExact(
  "                  ) : (activeTab === 'projects' && projects.length === 0) || (activeTab === 'employees' && employees.length === 0) || (activeTab === 'innovations' && innovations.length === 0) ? (",
  "                  ) : (activeTab === 'projects' && projects.length === 0) || (activeTab === 'employees' && employees.length === 0) || (activeTab === 'innovations' && innovations.length === 0) || (activeTab === 'careers' && careers.length === 0) ? (",
  "Empty states"
);

fs.writeFileSync('src/App.tsx', content);
