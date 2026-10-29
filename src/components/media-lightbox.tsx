"use client";

import { useState, useEffect } from "react";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

export function MediaLightbox({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="relative group cursor-zoom-in" onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="grid size-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur-sm border border-white/20 shadow-lg">
            <Maximize2 size={16} />
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setOpen(false)}
        >
          {/* Controls Bar */}
          <div
            className="absolute top-5 right-5 z-10 flex items-center gap-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomed(!zoomed)}
              className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title={zoomed ? "Reset zoom" : "Zoom in"}
            >
              {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Content */}
          <div
            className="relative max-h-[92vh] max-w-[95vw] overflow-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={`transition-all duration-200 select-none ${
                zoomed
                  ? "max-h-none max-w-none cursor-zoom-out scale-125"
                  : "max-h-[90vh] max-w-[90vw] object-contain cursor-zoom-in"
              }`}
              onClick={() => setZoomed(!zoomed)}
            />
          </div>
        </div>
      )}
    </>
  );
}
