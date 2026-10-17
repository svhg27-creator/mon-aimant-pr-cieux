import { useEffect, useRef } from "react";

export interface PrenomMagnetItem {
  prenom: string;
  fete_label: string | null;
  sexe?: string | null;
}

interface PrenomMagnetCanvasProps {
  item: PrenomMagnetItem | null;
  color?: string;
  placeholder?: string;
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function drawMagnet(canvas: HTMLCanvasElement, item: PrenomMagnetItem, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  const prenom = item.prenom;
  let fontSize = 120;
  const maxWidth = size - 80;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1a1a1a";

  do {
    ctx.font = `${fontSize}px Georgia, "Times New Roman", serif`;
    const metrics = ctx.measureText(prenom);
    if (metrics.width <= maxWidth || fontSize <= 40) break;
    fontSize -= 4;
  } while (fontSize > 40);

  ctx.fillText(prenom, size / 2, size * 0.3);

  ctx.font = '38px Georgia, "Times New Roman", serif';
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("se fête", size / 2, size * 0.58);

  if (item.fete_label) {
    ctx.font = '40px Georgia, "Times New Roman", serif';
    ctx.fillText(item.fete_label, size / 2, size * 0.74);
  }
}

export function PrenomMagnetCanvas({ item, color = "#F7B4C0", placeholder = "Tapez un prénom" }: PrenomMagnetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!item) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#faf8f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9ca3af";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '20px Georgia, "Times New Roman", serif';
      ctx.fillText(placeholder, canvas.width / 2, canvas.height / 2);
      return;
    }

    drawMagnet(canvas, item, color);
  }, [item, color, placeholder]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="w-full h-full object-contain"
      aria-label={item ? `Magnet ${item.prenom}` : "Aperçu du magnet"}
    />
  );
}

export function searchPrenom<T extends PrenomMagnetItem>(items: T[], q: string): T | null {
  const needle = normalize(q.trim());
  if (!needle) return null;
  return (
    items.find((p) => normalize(p.prenom).startsWith(needle)) ??
    items.find((p) => normalize(p.prenom).includes(needle)) ??
    null
  );
}
