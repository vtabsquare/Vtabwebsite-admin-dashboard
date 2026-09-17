import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Plus, Trash2, Save, Upload, Video, X, PlayCircle, Settings, Edit, Cpu } from 'lucide-react';
import type { IoTContent } from '../types';

const BUCKET = 'product-media';
const VIDEO_PATH_PREFIX = 'custom/iot-videos';

export const IoTEditor: React.FC = () => {
  const [data, setData] = useState<IoTContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Modals state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState(false);
  
  // Capability Form
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [capForm, setCapForm] = useState({ icon: 'Server', title: '', description: '' });

  // Video Upload State
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadMsg, setVideoUploadMsg] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase.from('iot_content').select('*').limit(1).single();
    if (result && !error) {
      setData(result);
    }
    setLoading(false);
  };

  const saveToDatabase = async (updatedData: IoTContent) => {
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.from('iot_content').update({
      header_badge: updatedData.header_badge,
      header_title: updatedData.header_title,
      header_highlight: updatedData.header_highlight,
      header_description: updatedData.header_description,
      reference_app_badge: updatedData.reference_app_badge,
      reference_app_title: updatedData.reference_app_title,
      benefits: updatedData.benefits,
      capabilities: updatedData.capabilities,
      signals: updatedData.signals,
      demo_video_url: updatedData.demo_video_url,
      updated_at: new Date().toISOString()
    }).eq('id', updatedData.id);

    if (error) {
      console.error(error);
      setMessage('Error saving changes');
      alert('Error saving changes: ' + error.message);
    } else {
      setData(updatedData);
      setMessage('Changes saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    await saveToDatabase(data);
    setIsSettingsModalOpen(false);
  };

  const handleOpenNewCapability = () => {
    setEditingIndex(null);
    setCapForm({ icon: 'Server', title: '', description: '' });
    setIsCapabilityModalOpen(true);
  };

  const handleEditCapability = (index: number) => {
    if (!data) return;
    setEditingIndex(index);
    setCapForm(data.capabilities[index]);
    setIsCapabilityModalOpen(true);
  };

  const handleSaveCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    
    const newCapabilities = [...data.capabilities];
    if (editingIndex !== null) {
      newCapabilities[editingIndex] = capForm;
    } else {
      newCapabilities.push(capForm);
    }
    
    const updatedData = { ...data, capabilities: newCapabilities };
    await saveToDatabase(updatedData);
    setIsCapabilityModalOpen(false);
  };

  const handleDeleteCapability = async (index: number) => {
    if (!data) return;
    if (!window.confirm('Are you sure you want to delete this capability?')) return;
    
    const newCapabilities = data.capabilities.filter((_, idx) => idx !== index);
    const updatedData = { ...data, capabilities: newCapabilities };
    await saveToDatabase(updatedData);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    if (!file.type.startsWith('video/')) {
      setVideoUploadMsg('❌ Please select a valid video file (MP4, MOV, WebM)');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setVideoUploadMsg('❌ File too large. Max size is 500MB.');
      return;
    }

    setVideoUploading(true);
    setVideoUploadProgress(10);
    setVideoUploadMsg('Uploading video to Supabase Storage...');

    const fileName = `iot-demo-${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `${VIDEO_PATH_PREFIX}/${fileName}`;

    try {
      setVideoUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setVideoUploadMsg(`❌ Upload failed: ${uploadError.message}`);
        setVideoUploading(false);
        return;
      }

      setVideoUploadProgress(80);
      setVideoUploadMsg('Getting public URL...');

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        setVideoUploadMsg('❌ Could not get public URL after upload.');
        setVideoUploading(false);
        return;
      }

      setData({ ...data, demo_video_url: publicUrl });
      setVideoUploadProgress(100);
      setVideoUploadMsg('✅ Video uploaded successfully! Click Save Settings to confirm.');
      setTimeout(() => { setVideoUploadMsg(''); setVideoUploadProgress(0); }, 4000);
    } catch (err) {
      setVideoUploadMsg('❌ Unexpected error during upload.');
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = () => {
    if (!data) return;
    if (!window.confirm('Remove the current demo video URL? (Must save to apply)')) return;
    setData({ ...data, demo_video_url: null });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Failed to load IoT content.</div>;
  }

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" /> Global Settings & Video
            </button>
          </div>
          <button 
            onClick={handleOpenNewCapability}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Capability
          </button>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded-xl text-sm font-semibold ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {message}
          </div>
        )}

        {/* Directory Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Capability Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.capabilities.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500 font-medium">No capabilities found.</td></tr>
                ) : (
                  data.capabilities.map((cap, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center border border-cyan-100">
                            <Cpu className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cap.title}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Icon: {cap.icon}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 max-w-sm line-clamp-2">{cap.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditCapability(i)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCapability(i)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsSettingsModalOpen(false) }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/50 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Global Settings & Video</h2>
                <p className="text-sm text-slate-500 mt-1">Manage main headers and demo video</p>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Header Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Badge Text</label>
                    <input type="text" value={data.header_badge} onChange={e => setData({...data, header_badge: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Main Title</label>
                    <input type="text" value={data.header_title} onChange={e => setData({...data, header_title: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Highlighted Title Text</label>
                    <input type="text" value={data.header_highlight} onChange={e => setData({...data, header_highlight: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
                    <textarea rows={2} value={data.header_description} onChange={e => setData({...data, header_description: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Reference App Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">App Badge</label>
                    <input type="text" value={data.reference_app_badge} onChange={e => setData({...data, reference_app_badge: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">App Title</label>
                    <input type="text" value={data.reference_app_title} onChange={e => setData({...data, reference_app_title: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">App Benefits (3 Items)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {data.benefits.map((b, i) => (
                      <input key={i} type="text" value={b} onChange={e => { const nb = [...data.benefits]; nb[i] = e.target.value; setData({...data, benefits: nb}) }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs" placeholder={`Benefit ${i+1}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2"><Video className="w-4 h-4 text-cyan-500"/> Demo Video</h3>
                {data.demo_video_url ? (
                  <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <PlayCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate">{data.demo_video_url}</p>
                      <video src={data.demo_video_url} controls className="mt-2 w-full max-w-sm rounded-xl border border-emerald-200" style={{maxHeight: 150}} />
                    </div>
                    <button type="button" onClick={handleRemoveVideo} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400">
                    <Video className="w-5 h-5 shrink-0" />
                    <span className="text-sm">No video uploaded yet.</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/mov" className="hidden" onChange={handleVideoUpload} id="modal-video-upload" />
                  <label htmlFor="modal-video-upload" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer border ${videoUploading ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-cyan-600 text-white border-transparent'}`}>
                    {videoUploading ? <><Loader2 className="w-4 h-4 animate-spin"/> Uploading...</> : <><Upload className="w-4 h-4"/> Upload Video</>}
                  </label>
                </div>
                {videoUploading && <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{width: `${videoUploadProgress}%`}}></div></div>}
                {videoUploadMsg && <p className="text-xs font-semibold text-slate-600">{videoUploadMsg}</p>}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Capability Modal */}
      {isCapabilityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsCapabilityModalOpen(false) }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/50">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingIndex !== null ? 'Edit Capability' : 'New Capability'}</h2>
                <p className="text-sm text-slate-500 mt-1">Configure grid card content</p>
              </div>
              <button onClick={() => setIsCapabilityModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCapability} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Title</label>
                <input required type="text" value={capForm.title} onChange={e => setCapForm({...capForm, title: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="e.g. Predictive Maintenance" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Lucide Icon Name</label>
                <input required type="text" value={capForm.icon} onChange={e => setCapForm({...capForm, icon: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500" placeholder="e.g. Server, Activity" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
                <textarea required rows={3} value={capForm.description} onChange={e => setCapForm({...capForm, description: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Capability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
