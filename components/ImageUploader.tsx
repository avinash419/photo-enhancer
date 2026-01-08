
import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer bg-white/5 hover:bg-white/[0.08] hover:border-blue-500/50 transition-all duration-300 group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className="p-4 rounded-full bg-blue-500/10 mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-10 h-10 text-blue-400" />
          </div>
          <p className="mb-2 text-xl font-medium text-white">Click to upload or drag & drop</p>
          <p className="text-sm text-white/40 mb-6">PNG, JPG or WEBP (Max 20MB)</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/60 border border-white/10">
              <ImageIcon size={14} /> Pixel Repair
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/60 border border-white/10">
              <Camera size={14} /> Identity Protection
            </span>
          </div>
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer">
             <img 
              src={`https://picsum.photos/400/400?random=${i}`} 
              alt="Example" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <span className="text-[10px] font-bold tracking-widest uppercase">Try This</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
