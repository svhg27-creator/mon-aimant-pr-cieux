import { useMagnetStore, SHAPES } from "@/stores/magnetStore";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function getShapeClass(shape: string): string {
  switch (shape) {
    case "rond25":
    case "rond37":
      return "rounded-full aspect-square";
    case "carre37":
      return "rounded-[8%] aspect-square";
    case "coeur70":
      return "aspect-[70/65]";
    case "rectangle37x115":
      return "rounded-[12%] aspect-[115/37]";
    default:
      return "rounded-[8%] aspect-square";
  }
}

function HeartClip() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0.9C0.5 0.9 0.05 0.6 0.05 0.35C0.05 0.15 0.2 0.05 0.35 0.05C0.45 0.05 0.5 0.12 0.5 0.12C0.5 0.12 0.55 0.05 0.65 0.05C0.8 0.05 0.95 0.15 0.95 0.35C0.95 0.6 0.5 0.9 0.5 0.9Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function MagnetPreview() {
  const imageUrl = useMagnetStore((state) => state.imageUrl);
  const shape = useMagnetStore((state) => state.shape);
  const zoom = useMagnetStore((state) => state.zoom);
  const rotation = useMagnetStore((state) => state.rotation);
  const crop = useMagnetStore((state) => state.crop);
  const flipX = useMagnetStore((state) => state.flipX);
  const flipY = useMagnetStore((state) => state.flipY);
  const shapeInfo = SHAPES.find((s) => s.id === shape) ?? SHAPES[2];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <HeartClip />

      <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-2xl p-8 shadow-2xl">
        <div
          className={cn(
            "relative mx-auto overflow-hidden bg-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)]",
            getShapeClass(shape),
          )}
          style={{
            width: shapeInfo.id === "rectangle37x115" ? "85%" : "70%",
            maxWidth: shapeInfo.id === "rectangle37x115" ? "340px" : "280px",
            clipPath: shapeInfo.id === "coeur70" ? "url(#heart-clip)" : undefined,
          }}
        >
          {imageUrl ? (
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={imageUrl}
                alt="Aperçu du magnet"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Sparkles className="h-8 w-8 opacity-30" strokeWidth={1.25} />
              <span className="text-xs uppercase tracking-wider">Aperçu</span>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/20 via-transparent to-white/30" />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_24px_rgba(0,0,0,0.12)]" />
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 blur-xl rounded-full" />
      </div>

      <div className="mt-6 text-center space-y-1">
        <p className="font-display text-lg">{shapeInfo.name}</p>
        <p className="text-sm text-muted-foreground">{shapeInfo.dimensions}</p>
      </div>
    </div>
  );
}
