import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Plus, Trash2, Save, Upload, Video, CheckCircle2, X, PlayCircle } from 'lucide-react';
import type { IoTContent } from '../types';

const BUCKET = 'product-media';
const VIDEO_PATH_PREFIX = 'custom/iot-videos';

export const IoTEditor: React.FC = () => {
  const [data, setData] = useState<IoTContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase.from('iot_content').update({
      header_badge: data.header_badge,
      header_title: data.header_title,
      header_highlight: data.header_highlight,
      header_description: data.header_description,
      reference_app_badge: data.reference_app_badge,
      reference_app_title: data.reference_app_title,
      benefits: data.benefits,
      capabilities: data.capabilities,
      signals: data.signals,
      demo_video_url: data.demo_video_url,
      updated_at: new Date().toISOString()
    }).eq('id', data.id);

    if (error) {
      console.error(error);
      setMessage('Error saving changes');
    } else {
      setMessage('Changes saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setVideoUploadMsg('❌ Please select a valid video file (MP4, MOV, WebM)');
      return;
    }

    // Max 500MB
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
        console.error('Upload error:', uploadError);
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

      // Save URL to iot_content row
      const { error: updateError } = await supabase
        .from('iot_content')
        .update({ demo_video_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', data.id);

      if (updateError) {
        setVideoUploadMsg('❌ Uploaded but failed to save URL to database.');
        setVideoUploading(false);
        return;
      }

      setData({ ...data, demo_video_url: publicUrl });
      setVideoUploadProgress(100);
      setVideoUploadMsg('✅ Video uploaded and saved successfully!');
      setTimeout(() => { setVideoUploadMsg(''); setVideoUploadProgress(0); }, 4000);
    } catch (err) {
      console.error(err);
      setVideoUploadMsg('❌ Unexpected error during upload.');
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveVideo = async () => {
    if (!data) return;
    if (!window.confirm('Remove the current demo video URL?')) return;
    const { error } = await supabase.from('iot_content').update({ demo_video_url: null }).eq('id', data.id);
    if (!error) {
      setData({ ...data, demo_video_url: null });
      setVideoUploadMsg('Video removed.');
      setTimeout(() => setVideoUploadMsg(''), 2000);
    }
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IoT & Edge AI Content</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the Industrial IoT section on the homepage.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      <form className="space-y-10" onSubmit={handleSave}>
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Header Section</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Badge Text</label>
              <input type="text" value={data.header_badge} onChange={e => setData({...data, header_badge: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Main Title</label>
              <input type="text" value={data.header_title} onChange={e => setData({...data, header_title: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Highlighted Title Text</label>
              <input type="text" value={data.header_highlight} onChange={e => setData({...data, header_highlight: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
            <textarea rows={3} value={data.header_description} onChange={e => setData({...data, header_description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* ── Demo Video Upload ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-500" />
            Demo Video
          </h2>
          <p className="text-sm text-slate-500">
            Upload an MP4 video to showcase in the IoT section on the homepage. It will be stored in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">product-media/custom/iot-videos/</code> bucket.
          </p>

          {/* Current video */}
          {data.demo_video_url ? (
            <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <PlayCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-700 mb-1">Current Demo Video</p>
                <p className="text-xs text-slate-500 truncate">{data.demo_video_url}</p>
                <video
                  src={data.demo_video_url}
                  controls
                  className="mt-3 w-full max-w-md rounded-xl border border-emerald-200"
                  style={{ maxHeight: 200 }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Remove video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400">
              <Video className="w-5 h-5 shrink-0" />
              <span className="text-sm">No demo video uploaded yet.</span>
            </div>
          )}

          {/* Upload input */}
          <div className="flex items-center gap-4">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/mov,video/quicktime"
              className="hidden"
              onChange={handleVideoUpload}
              id="iot-video-upload"
            />
            <label
              htmlFor="iot-video-upload"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all border ${
                videoUploading
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white border-transparent shadow-md hover:shadow-cyan-500/20'
              }`}
            >
              {videoUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> {data.demo_video_url ? 'Replace Video' : 'Upload Video'}</>
              )}
            </label>
            <span className="text-xs text-slate-400">MP4, MOV, WebM · Max 500MB</span>
          </div>

          {/* Progress bar */}
          {videoUploading && (
            <div className="space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${videoUploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{videoUploadProgress}% — {videoUploadMsg}</p>
            </div>
          )}

          {/* Status message */}
          {!videoUploading && videoUploadMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
              videoUploadMsg.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {videoUploadMsg.includes('✅') && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {videoUploadMsg}
            </div>
          )}
        </div>

        {/* Reference App Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Reference Application</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">App Badge</label>
              <input type="text" value={data.reference_app_badge} onChange={e => setData({...data, reference_app_badge: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">App Title</label>
              <input type="text" value={data.reference_app_title} onChange={e => setData({...data, reference_app_title: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">App Benefits (3 Items)</label>
            <div className="grid grid-cols-3 gap-4">
              {data.benefits.map((benefit, i) => (
                <input 
                  key={i} type="text" value={benefit} 
                  onChange={e => {
                    const newBenefits = [...data.benefits];
                    newBenefits[i] = e.target.value;
                    setData({...data, benefits: newBenefits});
                  }} 
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                  placeholder={`Benefit ${i+1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Capabilities Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800">Capabilities (Grid Cards)</h2>
            <button type="button" onClick={() => setData({...data, capabilities: [...data.capabilities, {icon: 'Server', title: '', description: ''}]})} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Capability
            </button>
          </div>
          
          <div className="space-y-4">
            {data.capabilities.map((cap, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lucide Icon Name</label>
                    <input type="text" value={cap.icon} onChange={e => { const nc = [...data.capabilities]; nc[i].icon = e.target.value; setData({...data, capabilities: nc}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" placeholder="e.g. Server, Cpu, Zap, Shield" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title</label>
                    <input type="text" value={cap.title} onChange={e => { const nc = [...data.capabilities]; nc[i].title = e.target.value; setData({...data, capabilities: nc}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea rows={2} value={cap.description} onChange={e => { const nc = [...data.capabilities]; nc[i].description = e.target.value; setData({...data, capabilities: nc}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                </div>
                <button type="button" onClick={() => setData({...data, capabilities: data.capabilities.filter((_, idx) => idx !== i)})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Signals Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800">Signals (App Indicators)</h2>
            <button type="button" onClick={() => setData({...data, signals: [...data.signals, {icon: 'Activity', label: '', detail: '', color: 'text-emerald-400'}]})} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Signal
            </button>
          </div>
          
          <div className="space-y-4">
            {data.signals.map((sig, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lucide Icon</label>
                    <input type="text" value={sig.icon} onChange={e => { const ns = [...data.signals]; ns[i].icon = e.target.value; setData({...data, signals: ns}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Label</label>
                    <input type="text" value={sig.label} onChange={e => { const ns = [...data.signals]; ns[i].label = e.target.value; setData({...data, signals: ns}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detail Text</label>
                    <input type="text" value={sig.detail} onChange={e => { const ns = [...data.signals]; ns[i].detail = e.target.value; setData({...data, signals: ns}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color Class</label>
                    <input type="text" value={sig.color} onChange={e => { const ns = [...data.signals]; ns[i].color = e.target.value; setData({...data, signals: ns}); }} className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm" placeholder="e.g. text-cyan-400" />
                  </div>
                </div>
                <button type="button" onClick={() => setData({...data, signals: data.signals.filter((_, idx) => idx !== i)})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
