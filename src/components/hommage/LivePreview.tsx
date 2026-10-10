import { useRef, useEffect, useCallback, useState } from "react";
import { useHommageStore } from "@/stores/hommageStore";

const CANVAS_SIZE = 320; // px — display size
const MM = 37; // magnet diameter mm
const SAFE_MM = 5; // safety margin mm
const BLEED_MM = 2; // bleed mm

const SAFE_RATIO = (MM - 2 * SAFE_MM) / MM; // safe zone as fraction of diameter

export function LivePreview({ id = "live-preview-canvas" }: { id?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeTab, photo, background, textStyle } = useHommageStore();

  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const setPhotoX = useHommageStore((s) => s.setPhotoX);
  const setPhotoY = useHommageStore((s) => s.setPhotoY);
  const setPhotoScale = useHommageStore((s) => s.setPhotoScale);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = CANVAS_SIZE;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;
    const safeR = r * SAFE_RATIO;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (activeTab === "recto") {
      // Background
      if (background) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(bgImg, 0, 0, size, size);
          drawPhoto(ctx, cx, cy, r, safeR, size);
          drawOverlay(ctx, cx, cy, r, safeR, size);
        };
        bgImg.src = background;
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        drawPhoto(ctx, cx, cy, r, safeR, size);
        drawOverlay(ctx, cx, cy, r, safeR, size);
      }
    } else {
      // Verso
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
      drawVersoText(ctx, cx, cy, safeR, size);
      drawOverlay(ctx, cx, cy, r, safeR, size);
    }
    ctx.restore();
  }, [activeTab, photo, background, textStyle]);

  function drawPhoto(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, safeR: number, size: number) {
    if (!photo.url) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const scale = photo.scale;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const fit = Math.max(size / w, size / h) * scale;
      const dw = w * fit;
      const dh = h * fit;

      ctx.translate(cx + photo.x, cy + photo.y);
      ctx.rotate((photo.rotation * Math.PI) / 180);
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    };
    img.src = photo.url;
  }

  function drawOverlay(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, safeR: number, size: number) {
    // Safety zone ring
    ctx.save();
    ctx.strokeStyle = "rgba(255,80,80,0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, safeR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Outer border
    ctx.save();
    ctx.strokeStyle = "rgba(100,100,100,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawVersoText(ctx: CanvasRenderingContext2D, cx: number, cy: number, safeR: number, size: number) {
    const ts = textStyle;
    if (!ts.content) return;

    const maxW = safeR * 1.8;
    const fontStyle = `${ts.italic ? "italic " : ""}${ts.bold ? "bold " : ""}${ts.fontSize}px "${ts.fontFamily}"`;
    ctx.font = fontStyle;
    ctx.fillStyle = ts.color;
    ctx.textAlign = ts.align as CanvasTextAlign;
    ctx.textBaseline = "middle";

    const words = ts.content.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxW) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const lineH = ts.fontSize * ts.lineHeight;
    const totalH = lines.length * lineH;
    const startY = cy - totalH / 2 + lineH / 2;

    if (ts.vertical) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 2);
      lines.forEach((line, i) => {
        const yOff = i * lineH - totalH / 2 + lineH / 2;
        ctx.fillText(line, 0, yOff);
      });
      ctx.restore();
    } else {
      lines.forEach((line, i) => {
        ctx.fillText(line, cx, startY + i * lineH);
      });
    }
  }

  useEffect(() => {
    draw();
  }, [draw]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setPhotoScale(photo.scale + delta);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setPhotoX(photo.x + dx);
    setPhotoY(photo.y + dy);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          id={id}
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-full shadow-2xl cursor-move"
          style={{ touchAction: "none" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {activeTab === "recto" ? "Recto — faites glisser ou zoomez avec la molette" : "Verso — texte personnalisé"}
      </p>
    </div>
  );
}

export const CANVAS_EXPORT_SIZE = 437; // 37mm @ 300DPI ≈ 437px (actually 37*300/25.4)
