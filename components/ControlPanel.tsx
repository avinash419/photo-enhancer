
import React from 'react';
import { EnhancementConfig } from '../types';
import { Settings, ShieldCheck, Sparkles, Target, Eye } from 'lucide-react';

interface Props {
  config: EnhancementConfig;
  onChange: (config: EnhancementConfig) => void;
  onEnhance: () => void;
  loading: boolean;
}

const ControlPanel: React.FC<Props> = ({ config, onChange, onEnhance, loading }) => {
  return (
    <div className="glass rounded-3xl p-6 space-y-6 w-full max-w-sm">
      <div className="flex items-center gap-2 text-white/90 font-semibold mb-2">
        <Settings size={18} className="text-blue-400" />
        Advanced Engine Config
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/50 mb-3">Reconstruction Depth</label>
          <div className="flex gap-2">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onChange({ ...config, sharpness: level })}
                className={`flex-1 py-2 text-xs rounded-xl border transition-all ${
                  config.sharpness === level
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-3">
            <label className="text-white/50">Vibrance Balance</label>
            <span className="text-white/80">{config.colorIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.colorIntensity}
            onChange={(e) => onChange({ ...config, colorIntensity: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button 
          onClick={() => onChange({ ...config, focusDistant: !config.focusDistant })}
          className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all ${
            config.focusDistant ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Target className={config.focusDistant ? "text-blue-400" : "text-white/30"} size={20} />
            <div className="text-left">
              <p className={`text-xs font-semibold ${config.focusDistant ? "text-blue-400" : "text-white/50"}`}>Subject-Aware Super-Res</p>
              <p className="text-[10px] text-white/40 leading-tight">Focus distant details</p>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${config.focusDistant ? 'bg-blue-500/40' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.focusDistant ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>

        <button 
          onClick={() => onChange({ ...config, redEyeCorrection: !config.redEyeCorrection })}
          className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all ${
            config.redEyeCorrection ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10 opacity-60'
          }`}
        >
          <div className="flex items-center gap-3">
            <Eye className={config.redEyeCorrection ? "text-amber-400" : "text-white/30"} size={20} />
            <div className="text-left">
              <p className={`text-xs font-semibold ${config.redEyeCorrection ? "text-amber-400" : "text-white/50"}`}>Red-Eye Correction</p>
              <p className="text-[10px] text-white/40 leading-tight">Neutralize pupils</p>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${config.redEyeCorrection ? 'bg-amber-500/40' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.redEyeCorrection ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>

        <div className="pt-2 flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-400" size={20} />
            <div>
              <p className="text-xs font-semibold text-green-400">Progressive Lock</p>
              <p className="text-[10px] text-white/40 leading-tight">Identity & Proportion Safety</p>
            </div>
          </div>
          <div className="w-10 h-6 bg-green-500/20 rounded-full flex items-center px-1">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      <button
        onClick={onEnhance}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden relative group"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Reconstructing...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>AI Super-Res Enhance</span>
          </>
        )}
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      </button>
    </div>
  );
};

export default ControlPanel;
