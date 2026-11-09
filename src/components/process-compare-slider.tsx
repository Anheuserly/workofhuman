"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";

interface ProcessCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatioClass?: string;
}

export function ProcessCompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Raw Process / Sketch",
  afterLabel = "Finished Craft",
  aspectRatioClass = "aspect-[16/10]",
}: ProcessCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 2) percentage = 2;
    if (percentage > 98) percentage = 98;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleStopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleStopDragging);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleStopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleStopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleStopDragging);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleStopDragging]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6f6a61]">
        <span className="inline-flex items-center gap-1.5 text-[#0f766e]">
          <SlidersHorizontal size={13} />
          Interactive Process Comparison
        </span>
        <span className="text-[11px] text-[#8c857b]">Drag slider to compare craft evolution</span>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border border-[#ded9cf] select-none shadow-sm cursor-ew-resize ${aspectRatioClass} bg-[#e9e4da]`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* Background Image: After (Finished Craft) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 size-full object-contain pointer-events-none"
        />

        {/* Foreground Image: Before (Process / Sketch) clipped */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 size-full object-contain max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            }}
          />
        </div>

        {/* Divider Bar & Center Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 rounded-full bg-[#151515] border-2 border-white text-white grid place-items-center shadow-lg">
            <SlidersHorizontal size={14} />
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm border border-white/20">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="rounded-full bg-[#0f766e]/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm border border-white/20">
            {afterLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
