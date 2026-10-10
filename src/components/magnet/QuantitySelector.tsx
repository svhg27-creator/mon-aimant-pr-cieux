import { useMagnetStore } from "@/stores/magnetStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

const PRESETS = [1, 2, 5, 10, 20, 50, 100];

export function QuantitySelector() {
  const quantity = useMagnetStore((state) => state.quantity);
  const setQuantity = useMagnetStore((state) => state.setQuantity);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Quantité</p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min={1}
          max={1000}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          className="h-10 w-20 text-center"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setQuantity(quantity + 1)}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setQuantity(preset)}
            className={`
              px-3 py-1.5 text-xs border transition-colors
              ${quantity === preset ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}
            `}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PriceDisplay() {
  const unitPrice = useMagnetStore((state) => state.getUnitPrice());
  const totalPrice = useMagnetStore((state) => state.getTotalPrice());
  const quantity = useMagnetStore((state) => state.quantity);

  return (
    <div className="bg-secondary/50 p-4 rounded-lg space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Prix unitaire</span>
        <span>{unitPrice.toFixed(2).replace(".", ",")} €</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Quantité</span>
        <span>× {quantity}</span>
      </div>
      <div className="flex justify-between items-end pt-2 border-t border-border">
        <span className="font-medium">Total</span>
        <span className="font-display text-2xl text-primary">
          {totalPrice.toFixed(2).replace(".", ",")} €
        </span>
      </div>
    </div>
  );
}
