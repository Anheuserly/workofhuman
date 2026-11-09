"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Share2,
  Palette,
  Loader2,
} from "lucide-react";

interface StoryCardProps {
  title: string;
  creatorName?: string;
  creatorUsername: string;
  creatorAvatar?: string | null;
  discipline: string;
  location?: string | null;
  thumbnailUrl?: string | null;
  projectSlug: string;
  creatorShortId?: string | null;
  verified?: boolean;
}

type AspectRatio = "9:16" | "1:1" | "16:9";
type CardTheme = "light" | "dark";

export function StoryCardModal({
  title,
  creatorName,
  creatorUsername,
  discipline,
  location,
  thumbnailUrl,
  projectSlug,
  creatorShortId,
  verified,
}: StoryCardProps) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState<AspectRatio>("9:16");
  const [theme, setTheme] = useState<CardTheme>("light");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const creatorHandle = creatorShortId || creatorUsername;
  const shortDomain = "theworkofhuman.com";

  const renderCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions based on selected ratio
    let width = 1080;
    let height = 1920; // 9:16 standard story
    if (ratio === "1:1") {
      width = 1200;
      height = 1200;
    } else if (ratio === "16:9") {
      width = 1920;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    const isDark = theme === "dark";
    const bgColor = isDark ? "#121212" : "#f4efe6";
    const textColor = isDark ? "#f5f5f5" : "#151515";
    const subtextColor = isDark ? "#a09c95" : "#6f6a61";
    const borderColor = isDark ? "#2a2825" : "#ded9cf";
    const accentColor = "#0f766e";

    // 1. Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Double archival border
    const m = Math.round(width * 0.035);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(m, m, width - m * 2, height - m * 2);

    ctx.strokeStyle = isDark ? "#1f1d1b" : "#ece7dd";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m + 8, m + 8, width - (m + 8) * 2, height - (m + 8) * 2);

    // Helper: Rounded image draw
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Helper to load image
    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });

    // 3. Header: The Work of Human Brand mark
    const headerY = Math.round(m + (ratio === "9:16" ? 80 : 50));
    ctx.fillStyle = textColor;
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("THE WORK OF HUMAN", width / 2, headerY);

    // Subtle header rule
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 60, headerY + 16);
    ctx.lineTo(width / 2 + 60, headerY + 16);
    ctx.stroke();

    // 4. Discipline & Location Pill
    const pillY = headerY + 48;
    const disciplineText = discipline.replace(/_/g, " ").toUpperCase();
    const locationText = location ? ` • 📍 ${location}` : "";
    const metaTag = `${disciplineText}${locationText}`;

    ctx.font = "600 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = subtextColor;
    ctx.textAlign = "center";
    ctx.fillText(metaTag, width / 2, pillY);

    // 5. Artwork / Thumbnail Image (Cover Box)
    let imgY = pillY + 36;
    let imgH = height * 0.55;
    let imgW = width - m * 4;
    let imgX = (width - imgW) / 2;

    if (ratio === "1:1") {
      imgH = height * 0.52;
      imgY = pillY + 30;
    } else if (ratio === "16:9") {
      imgW = width * 0.55;
      imgH = height - m * 3 - 80;
      imgX = m * 2;
      imgY = m * 2 + 40;
    }

    if (thumbnailUrl) {
      try {
        const artImg = await loadImage(thumbnailUrl);
        ctx.save();
        drawRoundedRect(imgX, imgY, imgW, imgH, 24);
        ctx.clip();

        // Object cover algorithm
        const hRatio = imgW / artImg.width;
        const vRatio = imgH / artImg.height;
        const ratioScale = Math.max(hRatio, vRatio);
        const centerShiftX = (imgW - artImg.width * ratioScale) / 2;
        const centerShiftY = (imgH - artImg.height * ratioScale) / 2;

        ctx.drawImage(
          artImg,
          0,
          0,
          artImg.width,
          artImg.height,
          imgX + centerShiftX,
          imgY + centerShiftY,
          artImg.width * ratioScale,
          artImg.height * ratioScale
        );
        ctx.restore();

        // Border around image
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        drawRoundedRect(imgX, imgY, imgW, imgH, 24);
        ctx.stroke();
      } catch {
        // Fallback placeholder box
        ctx.fillStyle = isDark ? "#1e1e1e" : "#e9e4da";
        drawRoundedRect(imgX, imgY, imgW, imgH, 24);
        ctx.fill();
        ctx.fillStyle = subtextColor;
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Artistic Creation", imgX + imgW / 2, imgY + imgH / 2);
      }
    }

    // 6. Project Title & Creator Info (Below Image or Right side in 16:9)
    const textStartX = ratio === "16:9" ? imgX + imgW + 60 : width / 2;
    let textStartY = ratio === "16:9" ? imgY + 80 : imgY + imgH + 60;
    ctx.textAlign = ratio === "16:9" ? "left" : "center";

    // Title text wrapping
    ctx.fillStyle = textColor;
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', serif";
    const maxWidth = ratio === "16:9" ? width - textStartX - m * 2 : width - m * 4;

    const words = title.split(" ");
    let line = "";
    let linesDrawn = 0;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), textStartX, textStartY);
        line = words[n] + " ";
        textStartY += 54;
        linesDrawn++;
        if (linesDrawn >= 3) {
          line += "...";
          break;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), textStartX, textStartY);

    // Creator line
    const creatorY = textStartY + 64;
    const authorName = creatorName || `@${creatorUsername}`;
    ctx.font = "600 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(`Crafted by ${authorName} ${verified ? "✓" : ""}`, textStartX, creatorY);

    // 7. Footer Brand Pill (Bottom Center)
    const footerY = height - m - 45;
    const pillW = Math.min(width - m * 6, 680);
    const pillH = 64;
    const pillX = (width - pillW) / 2;

    ctx.fillStyle = isDark ? "#1e1e1e" : "#151515";
    drawRoundedRect(pillX, footerY - 40, pillW, pillH, 32);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `${shortDomain}/@${creatorHandle}/${projectSlug}`,
      width / 2,
      footerY
    );
  }, [
    ratio,
    theme,
    title,
    creatorName,
    creatorUsername,
    discipline,
    location,
    thumbnailUrl,
    projectSlug,
    creatorHandle,
    verified,
  ]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        renderCard();
      }, 50);
    }
  }, [open, renderCard]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      const cleanSlug = projectSlug.replace(/[^a-zA-Z0-9_-]/g, "");
      link.download = `${cleanSlug}-story-card-${ratio.replace(":", "x")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          handleDownload();
        }
      }, "image/png");
    } catch {
      handleDownload();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#151515] hover:bg-[#2b2b2b] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
        title="Generate Instagram Story / Social Card"
      >
        <Sparkles size={13} className="text-teal-400" />
        <span>Export Story Card</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div
            className="surface relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-[#ded9cf] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ded9cf] px-5 py-4 bg-[#faf8f5]">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-[#0f766e]/10 text-[#0f766e]">
                  <Share2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">Creation Story Card</h3>
                  <p className="text-[11px] text-[#6f6a61]">
                    Export publication-grade social cards for Instagram, X, and Stories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-[#ded9cf]/50 text-[#6f6a61] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Controls & Canvas Preview */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Controls Column */}
              <div className="md:col-span-5 space-y-5">
                {/* Format selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] block mb-2">
                    Format &amp; Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["9:16", "1:1", "16:9"] as AspectRatio[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRatio(r)}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                          ratio === r
                            ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                            : "border-[#ded9cf] bg-white text-[#6f6a61] hover:bg-[#f6f4ef]"
                        }`}
                      >
                        <span>{r}</span>
                        <span className="text-[10px] font-normal opacity-75">
                          {r === "9:16" ? "Story" : r === "1:1" ? "Post" : "Banner"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6f6a61] block mb-2">
                    Visual Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        theme === "light"
                          ? "border-[#151515] bg-[#f4efe6] text-[#151515]"
                          : "border-[#ded9cf] bg-white text-[#6f6a61] hover:bg-[#f6f4ef]"
                      }`}
                    >
                      <Palette size={14} />
                      Archival Cream
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        theme === "dark"
                          ? "border-black bg-[#151515] text-white"
                          : "border-[#ded9cf] bg-white text-[#6f6a61] hover:bg-[#f6f4ef]"
                      }`}
                    >
                      <Palette size={14} />
                      Obsidian Noir
                    </button>
                  </div>
                </div>

                {/* Metadata Summary Pill */}
                <div className="rounded-xl border border-[#ded9cf] bg-[#f6f4ef] p-3 space-y-1 text-xs text-[#6f6a61]">
                  <p className="font-semibold text-[#151515] truncate">{title}</p>
                  <p>
                    {discipline.replace(/_/g, " ")} • by @{creatorUsername}
                  </p>
                  {location && <p className="text-[11px] text-[#0f766e]">📍 {location}</p>}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="button-primary w-full justify-center !py-3 text-xs font-bold cursor-pointer"
                  >
                    {downloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Download High-Res PNG ({ratio})
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyImage}
                    className="button-secondary w-full justify-center !py-2.5 text-xs font-bold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={15} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        Copy Image to Clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Card Preview Column */}
              <div className="md:col-span-7 flex items-center justify-center p-2 bg-[#ece7dd]/50 rounded-xl border border-[#ded9cf]/60 max-h-[580px] overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="rounded-lg shadow-xl max-h-[520px] w-auto max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
