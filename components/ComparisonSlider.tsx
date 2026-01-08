
import React, { useState, useRef, useLayoutEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface Props {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<Props> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) return; 
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const next = Math.max(1, Math.min(8, prev + delta));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const startPanning = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStart.current = { x: x - offset.x, y: y - offset.y };
  };

  const onPanning = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: x - dragStart.current.x,
      y: y - dragStart.current.y
    });
  };

  const stopPanning = () => setIsPanning(false);

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] rounded-3xl overflow-hidden border border-white/10 bg-[#050505] group select-none shadow-2xl">
      <div className="absolute top-4 right-4 z-30 flex flex-col md:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-1">
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoom(1.5); }}
            className="p-2 hover:bg-white/10 text-white transition-all rounded-lg"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleZoom(-1.5); }}
            className="p-2 hover:bg-white/10 text-white transition-all rounded-lg"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-px bg-white/10 mx-1 self-stretch" />
          <button 
            onClick={(e) => { e.stopPropagation(); setZoom(1); setOffset({x:0, y:0}); }}
            className="p-2 hover:bg-white/10 text-white transition-all rounded-lg"
          >
            <Maximize size={18} />
          </button>
        </div>
        <div className="px-3 py-2 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 text-[10px] font-bold text-blue-400 flex items-center shadow-lg">
          {Math.round(zoom * 100)}% ZOOM
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-ew-resize'}`}
        onMouseMove={(e) => { handleMove(e); onPanning(e); }}
        onMouseDown={startPanning}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
        onTouchMove={(e) => { handleMove(e); onPanning(e); }}
        onTouchStart={startPanning}
        onTouchEnd={stopPanning}
      >
        <div 
          className="w-full h-full"
          style={{ 
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <img 
            src={before} 
            alt="Before" 
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          <div 
            className="absolute inset-0 h-full overflow-hidden pointer-events-none transition-[width] duration-75"
            style={{ width: `${sliderPosition}%` }}
          >
            <img 
              src={after} 
              alt="After" 
              className="absolute inset-0 h-full object-contain max-w-none"
              style={{ width: containerWidth || '100%' }}
            />
          </div>

          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_30px_rgba(0,0,0,1)] z-10 pointer-events-none transition-transform"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 border-white/30 backdrop-blur-sm">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex flex-wrap gap-2">
        <div className="px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 shadow-lg">
          Original
        </div>
        {zoom > 1 && (
          <div className="px-4 py-2 bg-blue-600/90 backdrop-blur-xl rounded-xl text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2 shadow-lg animate-pulse">
            <Move size={12} /> Pan Active
          </div>
        )}
      </div>
      <div className="absolute bottom-6 right-6 z-20">
        <div className="px-4 py-2 bg-blue-600/90 backdrop-blur-xl border border-blue-400/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
          AI Restored
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
