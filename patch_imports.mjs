import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /import React.*?Edit,/s;

const newImports = `import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Product } from './types';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { IoTEditor } from './components/IoTEditor';
import { 
  Wifi,
  LayoutDashboard, 
  Package, 
  Users, 
  Lightbulb, 
  Plus, 
  Search, 
  Edit,`;

content = content.replace(regex, newImports);
fs.writeFileSync('src/App.tsx', content);
console.log('Imports patched');
