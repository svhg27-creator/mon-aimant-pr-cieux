import QRCode from "react-qr-code";
import type { LucideIcon } from "lucide-react";

export function wikiUrl(nom: string) {
  return `https://fr.wikipedia.org/wiki/${encodeURIComponent(nom.replace(/ /g, "_"))}`;
}

export function wikiSearchUrl(terme: string) {
  return `https://fr.wikipedia.org/w/index.php?search=${encodeURIComponent(terme)}`;
}

interface QrWithLabelProps {
  value: string;
  label?: string;
  icon?: LucideIcon;
}

/** QR code façon verso de magnet : pictogramme au centre, nom en dessous. */
export function QrWithLabel({ value, label, icon: Icon }: QrWithLabelProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-3">
      <div className="relative flex-1 min-h-0 w-full grid place-items-center">
        <QRCode
          value={value}
          level="H"
          size={256}
          style={{ width: "100%", height: "auto", maxHeight: "100%" }}
          aria-label={label ? `QR code ${label}` : "QR code"}
        />
        {Icon && (
          <span className="absolute inset-0 m-auto h-7 w-7 grid place-items-center bg-white rounded-sm shadow-sm">
            <Icon className="h-5 w-5 text-foreground" strokeWidth={2} />
          </span>
        )}
      </div>
      {label && (
        <span className="mt-2 text-[11px] font-medium uppercase tracking-wide text-foreground/80">
          {label}
        </span>
      )}
    </div>
  );
}

interface QrPairProps {
  photoUrl: string;
  name: string;
  qrValue?: string | null;
  qrIcon?: LucideIcon;
  selected: boolean;
  onToggle: () => void;
}

export function QrPair({ photoUrl, name, qrValue, qrIcon, selected, onToggle }: QrPairProps) {
  return (
    <div className={selected ? "grid grid-cols-2 gap-4" : ""}>
      <button
        type="button"
        onClick={onToggle}
        title={selected ? "Masquer le QR code" : `Voir le QR code ${name}`}
        className={`aspect-square overflow-hidden bg-white border relative block w-full ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        <img
          src={photoUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          Recto
        </span>
      </button>
      {selected && (
        <div className="aspect-square overflow-hidden bg-white border border-primary relative">
          {qrValue ? (
            <QrWithLabel value={qrValue} label={name} icon={qrIcon} />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
              QR bientôt
            </span>
          )}
          <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            QR code
          </span>
        </div>
      )}
    </div>
  );
}
