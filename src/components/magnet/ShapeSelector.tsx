import { useMagnetStore, SHAPES, type MagnetShape } from "@/stores/magnetStore";
import { cn } from "@/lib/utils";
import { Circle, Square, Heart, RectangleHorizontal } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  circle: <Circle className="h-6 w-6" strokeWidth={1.5} />,
  square: <Square className="h-6 w-6" strokeWidth={1.5} />,
  heart: <Heart className="h-6 w-6" strokeWidth={1.5} />,
  rectangle: <RectangleHorizontal className="h-6 w-6" strokeWidth={1.5} />,
};

export function ShapeSelector() {
  const shape = useMagnetStore((state) => state.shape);
  const setShape = useMagnetStore((state) => state.setShape);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Forme du magnet</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s.id as MagnetShape)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 border text-sm transition-all",
              shape === s.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background hover:border-primary/50",
            )}
          >
            <span className={cn("text-foreground", shape === s.id && "text-primary")}>
              {iconMap[s.icon]}
            </span>
            <span className="font-medium">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.dimensions}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
