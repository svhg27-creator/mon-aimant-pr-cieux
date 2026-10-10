import { useHommageStore, FONTS } from "@/stores/hommageStore";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackEditor() {
  const { textStyle, setTextContent, setTextStyle } = useHommageStore();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Texte du verso</Label>
        <Textarea
          placeholder="Votre texte… (300 caractères max)"
          maxLength={300}
          value={textStyle.content}
          onChange={(e) => setTextContent(e.target.value)}
          className="resize-none h-28 text-sm"
        />
        <p className="text-xs text-right text-muted-foreground">{textStyle.content.length}/300</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Police</Label>
        <select
          value={textStyle.fontFamily}
          onChange={(e) => setTextStyle({ fontFamily: e.target.value })}
          className="w-full h-9 border border-input bg-background px-3 text-sm rounded-md"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Taille</span><span>{textStyle.fontSize}px</span>
        </div>
        <Slider
          value={[textStyle.fontSize]}
          min={8}
          max={72}
          step={1}
          onValueChange={([v]) => setTextStyle({ fontSize: v })}
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Interligne</span><span>{textStyle.lineHeight}</span>
        </div>
        <Slider
          value={[textStyle.lineHeight]}
          min={1}
          max={3}
          step={0.1}
          onValueChange={([v]) => setTextStyle({ lineHeight: v })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button" size="sm" variant="outline"
          className={cn("gap-1", textStyle.bold && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ bold: !textStyle.bold })}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className={cn("gap-1", textStyle.italic && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ italic: !textStyle.italic })}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className={cn(textStyle.align === "left" && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ align: "left" })}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className={cn(textStyle.align === "center" && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ align: "center" })}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className={cn(textStyle.align === "right" && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ align: "right" })}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className={cn("gap-1", textStyle.vertical && "border-primary bg-primary/5")}
          onClick={() => setTextStyle({ vertical: !textStyle.vertical })}
          title="Texte vertical"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-xs whitespace-nowrap">Couleur</Label>
        <input
          type="color"
          value={textStyle.color}
          onChange={(e) => setTextStyle({ color: e.target.value })}
          className="h-9 w-20 cursor-pointer rounded border border-input"
        />
        <span className="text-xs text-muted-foreground">{textStyle.color}</span>
      </div>
    </div>
  );
}
