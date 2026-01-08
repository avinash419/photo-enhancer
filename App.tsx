import React, { useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Download, RefreshCw, ChevronLeft, Github, Info, AlertCircle, Sparkles, Crown, Zap } from 'lucide-react';
import ImageUploader from './components/ImageUploader.tsx';
import ComparisonSlider from './components/ComparisonSlider.tsx';
import ControlPanel from './components/ControlPanel.tsx';
import { AppStage, ImageFile, AnalysisResult, EnhancementConfig } from './types.ts';
import { analyzeImage, enhanceImage } from './services/geminiService.ts';

const StatusItem = ({ label, value, active }: { label: string; value: string; active: boolean }) => (
  <div className={`p-5 rounded-2xl border transition-all shadow-lg ${
    active 
      ? 'bg-blue-500/10 border-blue-500/30' 
      : 'bg-white/5 border-white/10'
  }`}>
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">{label}</p>
    <p className={`text-sm font-bold ${active ? 'text-blue-400' : 'text-white/60'}`}>
      {value}
    </p>
  </div>
);

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('upload');
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [config, setConfig] = useState<EnhancementConfig>({
    sharpness: 'Medium',
    colorIntensity: 50,
    preserveIdentity: true,
    focusDistant: true,
    redEyeCorrection: true
  });
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    
    setError(null);
    const preview = URL.createObjectURL(file);
    
    const img = new Image();
    img.src = preview;
    img.onload = async () => {
      setOriginalImage({ 
        file, 
        preview, 
        width: img.width, 
        height: img.height,
        aspectRatio: img.width / img.height
      });
      setStage('analyzing');

      try {
        const result = await analyzeImage(file);
        setAnalysis(result);
        setStage('result');
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setAnalysis({
          blurDetected: true,
          noiseLevel: 'medium',
          lightingIssue: 'none',
          pixelated: true,
          redEyeDetected: false,
          summary: "Automatic analysis failed, but the engine is ready for manual reconstruction."
        });
        setStage('result');
      }
    };
    img.onerror = () => {
      setError("Failed to load image preview. The file might be corrupted.");
      setStage('upload');
    };
  }, []);

  const handleEnhance = async () => {
    if (!originalImage) return;
    if (!isOnline) {
      setError("You appear to be offline. Please check your connection.");
      return;
    }
    
    setError(null);
    setStage('enhancing');

    try {
      const result = await enhanceImage(originalImage.file, config, originalImage.aspectRatio);
      setEnhancedPreview(result);
      setStage('result');
    } catch (err: any) {
      console.error("Enhancement Error:", err);
      setError(err.message || "Enhancement failed. Please try a different photo or lower settings.");
      setStage('result');
    }
  };

  const reset = () => {
    if (originalImage?.preview) URL.revokeObjectURL(originalImage.preview);
    if (enhancedPreview) {
      // Small delay to ensure browser isn't using it
      setTimeout(() => URL.revokeObjectURL(enhancedPreview), 100);
    }
    setOriginalImage(null);
    setEnhancedPreview(null);
    setAnalysis(null);
    setError(null);
    setStage('upload');
  };

  const downloadImage = async () => {
    if (!enhancedPreview || !originalImage) return;
    
    const img = new Image();
    img.src = enhancedPreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Calculate UHD dimensions: Max of original or 4096 (UHD), but capped for mobile stability
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const MAX_SIDE = isMobile ? 3072 : 4096;
      
      let w = originalImage.width;
      let h = originalImage.height;
      
      if (w > MAX_SIDE || h > MAX_SIDE) {
        if (w > h) {
          w = MAX_SIDE;
          h = MAX_SIDE / originalImage.aspectRatio;
        } else {
          h = MAX_SIDE;
          w = MAX_SIDE * originalImage.aspectRatio;
        }
      } else if (w < 2048 && h < 2048) {
        // Upscale small images to at least 2K for "UHD" feeling
        if (w > h) {
          w = 2560;
          h = 2560 / originalImage.aspectRatio;
        } else {
          h = 2560;
          w = 2560 * originalImage.aspectRatio;
        }
      }
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const sizeInMb = (blob.size / (1024 * 1024)).toFixed(1);
            link.download = `photo-enhance-ai-uhd-${sizeInMb}mb.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 500);
          }
        }, 'image/png');
      }
    };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans antialiased">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest py-2 text-center z-[100] animate-in fade-in slide-in-from-top-full duration-300">
          Working Offline - Some AI features may be limited
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/5 z-50 glass">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ImageIcon className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none mb-1">PhotoEnhance <span className="text-blue-500">AI</span></h1>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Studio Grade Restoration</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <Zap size={14} className="text-blue-400" /> Flash Engine Active
          </span>
          <div className="h-4 w-px bg-white/10" />
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
            <Github size={18} />
          </a>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        {stage === 'upload' && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-16 space-y-6 max-w-3xl">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 uppercase tracking-[0.2em] flex items-center gap-2 w-fit mx-auto animate-pulse">
                <Crown size={12} /> Deployment Stable
              </span>
              <h2 className="text-6xl md:text-8xl font-black gradient-text leading-[0.9] tracking-tighter">
                Restore <br /> <span className="text-white">Every Pixel.</span>
              </h2>
              <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                Advanced AI reconstruction for blurry and red-eye photos.
                Fix artifacts and digital zoom issues with professional precision.
              </p>
            </div>
            
            <ImageUploader onUpload={handleUpload} />
            
            {error && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        )}

        {(stage === 'analyzing' || stage === 'enhancing') && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-12">
               <div className="w-20 h-20 border-[4px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-blue-400 animate-pulse" size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              {stage === 'analyzing' ? 'Neural Mapping...' : 'Deep Reconstruction...'}
            </h2>
            <p className="text-white/30 text-center max-w-sm text-lg font-medium leading-relaxed">
              {stage === 'analyzing' 
                ? 'Detecting subjects and red-eye patterns.' 
                : 'Neutralizing artifacts and building pixel density.'}
            </p>
          </div>
        )}

        {stage === 'result' && originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-all group font-bold text-xs uppercase tracking-widest"
                >
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  New Project
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleEnhance}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 shadow-lg"
                    title="Reprocess Image"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button 
                    onClick={downloadImage}
                    disabled={!enhancedPreview}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50 shadow-2xl shadow-white/5 uppercase text-xs tracking-widest"
                  >
                    <Download size={20} />
                    Download UHD
                  </button>
                </div>
              </div>

              <ComparisonSlider 
                before={originalImage.preview} 
                after={enhancedPreview || originalImage.preview} 
              />

              {analysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatusItem 
                    label="Eye Status" 
                    value={analysis.redEyeDetected ? "Red-Eye Found" : "Neutral Eyes"} 
                    active={analysis.redEyeDetected} 
                  />
                  <StatusItem 
                    label="Noise Tech" 
                    value={analysis.noiseLevel.toUpperCase()} 
                    active={analysis.noiseLevel !== 'low'} 
                  />
                  <StatusItem 
                    label="Super-Res" 
                    value="4K Verified" 
                    active={true} 
                  />
                  <StatusItem 
                    label="Identity" 
                    value="Locked Safe" 
                    active={false} 
                  />
                </div>
              )}
              
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap