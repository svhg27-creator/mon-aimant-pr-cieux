import { useHommageStore } from "@/stores/hommageStore";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const DPI = 300;
const MM = 37;
const BLEED_MM = 2;
const SAFE_MM = 5;

function mmToPx(mm: number) {
  return Math.round((mm / 25.4) * DPI);
}

const EXPORT_PX = mmToPx(MM + 2 * BLEED_MM); // 37 + 4mm bleed
const SAFE_PX = mmToPx(MM - 2 * SAFE_MM);
const BLEED_PX = mmToPx(BLEED_MM);

async function drawSide(
  ctx: CanvasRenderingContext2D,
  size: number,
  cx: number,
  cy: number,
  r: number,
  safeR: number,
  side: "recto" | "verso",
  state: ReturnType<typeof useHommageStore.getState>,
) {
  const { photo, background, textStyle } = state;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (side === "recto") {
    if (background) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = background;
      });
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
    }

    if (photo.url) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const s = photo.scale;
          const fit = Math.max(size / img.naturalWidth, size / img.naturalHeight) * s;
          const dw = img.naturalWidth * fit;
          const dh = img.naturalHeight * fit;
          ctx.save();
          ctx.translate(cx + photo.x, cy + photo.y);
          ctx.rotate((photo.rotation * Math.PI) / 180);
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = photo.url!;
      });
    }
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.restore();

    const ts = textStyle;
    if (ts.content) {
      const maxW = safeR * 1.8;
      const fontStyle = `${ts.italic ? "italic " : ""}${ts.bold ? "bold " : ""}${ts.fontSize * (EXPORT_PX / 320)}px "${ts.fontFamily}"`;
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

      const lineH = ts.fontSize * ts.lineHeight * (EXPORT_PX / 320);
      const totalH = lines.length * lineH;
      const startY = cy - totalH / 2 + lineH / 2;

      if (ts.vertical) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 2);
        lines.forEach((line, i) => {
          ctx.fillText(line, 0, i * lineH - totalH / 2 + lineH / 2);
        });
        ctx.restore();
      } else {
        lines.forEach((line, i) => ctx.fillText(line, cx, startY + i * lineH));
      }
      return;
    }
  }
  ctx.restore();
}

async function buildExportCanvas(side: "recto" | "verso", state: ReturnType<typeof useHommageStore.getState>) {
  const size = EXPORT_PX;
  const cx = size / 2;
  const cy = size / 2;
  const r = mmToPx(MM / 2 + BLEED_MM);
  const safeR = mmToPx((MM - 2 * SAFE_MM) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, size, size);

  await drawSide(ctx, size, cx, cy, r, safeR, side, state);

  // Bleed ring
  ctx.save();
  ctx.strokeStyle = "rgba(255,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, mmToPx(MM / 2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Safe zone ring
  ctx.save();
  ctx.strokeStyle = "rgba(0,120,255,0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, safeR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  return canvas;
}

export function ExportManager() {
  const state = useHommageStore.getState();

  const exportPNG = async () => {
    toast.info("Export en cours…");
    try {
      const rectoCanvas = await buildExportCanvas("recto", useHommageStore.getState());
      const versoCanvas = await buildExportCanvas("verso", useHommageStore.getState());

      const combined = document.createElement("canvas");
      combined.width = rectoCanvas.width * 2 + 40;
      combined.height = rectoCanvas.height;
      const ctx = combined.getContext("2d")!;
      ctx.fillStyle = "#f8f8f8";
      ctx.fillRect(0, 0, combined.width, combined.height);
      ctx.drawImage(rectoCanvas, 0, 0);
      ctx.drawImage(versoCanvas, rectoCanvas.width + 40, 0);

      const link = document.createElement("a");
      link.download = "magnet-hommage-37mm.png";
      link.href = combined.toDataURL("image/png");
      link.click();
      toast.success("PNG exporté !");
    } catch (e) {
      toast.error("Erreur lors de l'export PNG");
    }
  };

  const exportPDF = async () => {
    toast.info("Génération du PDF…");
    try {
      const { jsPDF } = await import("jspdf");
      const rectoCanvas = await buildExportCanvas("recto", useHommageStore.getState());
      const versoCanvas = await buildExportCanvas("verso", useHommageStore.getState());

      const mmTotal = MM + 2 * BLEED_MM;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [mmTotal * 2 + 10, mmTotal],
      });

      const rectoData = rectoCanvas.toDataURL("image/png");
      const versoData = versoCanvas.toDataURL("image/png");

      pdf.addImage(rectoData, "PNG", 0, 0, mmTotal, mmTotal);
      pdf.addImage(versoData, "PNG", mmTotal + 10, 0, mmTotal, mmTotal);

      pdf.save("magnet-hommage-37mm.pdf");
      toast.success("PDF exporté !");
    } catch (e) {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Export haute définition</p>
      <p className="text-xs text-muted-foreground">
        {MM} mm + 2 mm fond perdu · 300 DPI · Recto + Verso
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" onClick={exportPNG}>
          <Download className="h-4 w-4" /> PNG
        </Button>
        <Button className="flex-1 gap-2 rounded-none" onClick={exportPDF}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>
    </div>
  );
}
