import { useHommageStore, BACKGROUNDS } from "@/stores/hommageStore";
import { cn } from "@/lib/utils";

export function BackgroundSelector() {
  const { background, setBackground } = useHommageStore();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Fond du recto</p>
      <div className="grid grid-cols-7 gap-2">
        {BACKGROUNDS.map((bg, i) => (
          <button
            key={i}
            onClick={() => setBackground(bg)}
            title={bg === null ? "Blanc" : `Fond ${i}`}
            className={cn(
              "w-full aspect-square rounded-full border-2 transition-all overflow-hidden",
              background === bg
                ? "border-primary ring-2 ring-primary/40 scale-110"
                : "border-border hover:border-primary/50",
            )}
          >
            {bg === null ? (
              <div className="w-full h-full bg-white rounded-full" />
            ) : (
              <img src={bg} alt={`Fond ${i}`} className="w-full h-full object-cover rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
