const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states
code = code.replace(
  'const [isNewSubcategory, setIsNewSubcategory] = useState(false);',
  'const [isNewSubcategory, setIsNewSubcategory] = useState(false);\n  const [uniqueCategories, setUniqueCategories] = useState<string[]>([\'Analytics & BI\', \'Enterprise Automation\', \'Database & Migration\', \'AI Vision & Construction\', \'Logistics\', \'Healthcare\']);\n  const [uniqueSubcategories, setUniqueSubcategories] = useState<string[]>([]);'
);

// 2. formData type & default
code = code.replace(
  'category?: string;\n    impactMetric?: string;',
  'category?: string;\n    subcategory?: string;\n    impactMetric?: string;'
).replace(
  'category?: string;\r\n    impactMetric?: string;',
  'category?: string;\r\n    subcategory?: string;\r\n    impactMetric?: string;'
);

code = code.replace(
  'category: \'Analytics & BI\',\n    impactMetric: \'\',',
  'category: \'Analytics & BI\',\n    subcategory: \'\',\n    impactMetric: \'\','
).replace(
  'category: \'Analytics & BI\',\r\n    impactMetric: \'\',',
  'category: \'Analytics & BI\',\r\n    subcategory: \'\',\r\n    impactMetric: \'\','
);

// 3. handleEdit
code = code.replace(
  'category: item.category || \'Analytics & BI\',\n        impactMetric:',
  'category: item.category || \'Analytics & BI\',\n        subcategory: item.subcategory || \'\',\n        impactMetric:'
).replace(
  'category: item.category || \'Analytics & BI\',\r\n        impactMetric:',
  'category: item.category || \'Analytics & BI\',\r\n        subcategory: item.subcategory || \'\',\r\n        impactMetric:'
);

// reset isNew state
code = code.replace(
  '    setIsModalOpen(true);\n  };',
  '    setIsNewCategory(false);\n    setIsNewSubcategory(false);\n    setIsModalOpen(true);\n  };'
).replace(
  '    setIsModalOpen(true);\r\n  };',
  '    setIsNewCategory(false);\r\n    setIsNewSubcategory(false);\r\n    setIsModalOpen(true);\r\n  };'
);

// 4. fetchData map
code = code.replace(
  'category: item.category,\n            tags: typeof',
  'category: item.category,\n            subcategory: item.subcategory || \'\',\n            tags: typeof'
).replace(
  'category: item.category,\r\n            tags: typeof',
  'category: item.category,\r\n            subcategory: item.subcategory || \'\',\r\n            tags: typeof'
);

// 5. extract unique cats in fetchData
code = code.replace(
  '        setProjects(mappedProducts);\n      }',
  '        const cats = Array.from(new Set(data.map(i => i.category).filter(Boolean)));\n        const subcats = Array.from(new Set(data.map(i => i.subcategory).filter(Boolean)));\n        if (cats.length > 0) setUniqueCategories(cats);\n        setUniqueSubcategories(subcats);\n        setProjects(mappedProducts);\n      }'
).replace(
  '        setProjects(mappedProducts);\r\n      }',
  '        const cats = Array.from(new Set(data.map(i => i.category).filter(Boolean)));\r\n        const subcats = Array.from(new Set(data.map(i => i.subcategory).filter(Boolean)));\r\n        if (cats.length > 0) setUniqueCategories(cats);\r\n        setUniqueSubcategories(subcats);\r\n        setProjects(mappedProducts);\r\n      }'
);

// 6. handleSave
code = code.replace(
  'category: formData.category,\n        impact_metric: formData.impactMetric,',
  'category: formData.category,\n        subcategory: formData.subcategory || null,\n        impact_metric: formData.impactMetric,'
).replace(
  'category: formData.category,\r\n        impact_metric: formData.impactMetric,',
  'category: formData.category,\r\n        subcategory: formData.subcategory || null,\r\n        impact_metric: formData.impactMetric,'
);

// 7. handleOpenNewModal default
code = code.replace(
  'category: \'Analytics & BI\',\n      impactMetric: \'\',',
  'category: \'Analytics & BI\',\n      subcategory: \'\',\n      impactMetric: \'\','
).replace(
  'category: \'Analytics & BI\',\r\n      impactMetric: \'\',',
  'category: \'Analytics & BI\',\r\n      subcategory: \'\',\r\n      impactMetric: \'\','
);

// 8. Replace the Category UI
const uiRegex = /<div>[\s\S]*?<label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category<\/label>[\s\S]*?<\/select>\r?\n\s*<\/div>/;

const newUI = `<div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                      {!isNewCategory ? (
                        <select 
                          value={formData.category}
                          onChange={e => {
                            if (e.target.value === '__NEW__') setIsNewCategory(true);
                            else setFormData({...formData, category: e.target.value});
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        >
                          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__NEW__" className="font-bold text-blue-600">+ Add New Category</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                            placeholder="Enter new category"
                            autoFocus
                          />
                          <button type="button" onClick={() => setIsNewCategory(false)} className="px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-medium">Cancel</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sub Category</label>
                      {!isNewSubcategory ? (
                        <select 
                          value={formData.subcategory || ''}
                          onChange={e => {
                            if (e.target.value === '__NEW__') setIsNewSubcategory(true);
                            else setFormData({...formData, subcategory: e.target.value === '__NONE__' ? '' : e.target.value});
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        >
                          <option value="__NONE__">None</option>
                          {uniqueSubcategories.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__NEW__" className="font-bold text-blue-600">+ Add New Subcategory</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.subcategory || ''}
                            onChange={e => setFormData({...formData, subcategory: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                            placeholder="Enter new subcategory"
                            autoFocus
                          />
                          <button type="button" onClick={() => setIsNewSubcategory(false)} className="px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-medium">Cancel</button>
                        </div>
                      )}
                    </div>`;
                    
code = code.replace(uiRegex, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
