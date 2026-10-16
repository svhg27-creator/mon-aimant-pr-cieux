import QRCode from "react-qr-code";

export function wikiUrl(nom: string) {
  return `https://fr.wikipedia.org/wiki/${encodeURIComponent(nom.replace(/ /g, "_"))}`;
}

export function wikiSearchUrl(terme: string) {
  return `https://fr.wikipedia.org/w/index.php?search=${encodeURIComponent(terme)}`;
}

interface QrPairProps {
  photoUrl: string;
  name: string;
  qrValue?: string | null;
  selected: boolean;
  onToggle: () => void;
}

export function QrPair({ photoUrl, name, qrValue, selected, onToggle }: QrPairProps) {
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
        <div className="aspect-square overflow-hidden bg-white border border-primary relative grid place-items-center p-2">
          {qrValue ? (
            <QRCode
              value={qrValue}
              size={256}
              style={{ width: "100%", height: "100%" }}
              aria-label={`QR code ${name}`}
            />
          ) : (
            <span className="text-xs text-muted-foreground">QR bientôt</span>
          )}
          <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            QR code
          </span>
        </div>
      )}
    </div>
  );
}
