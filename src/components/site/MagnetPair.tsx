import type { ReactNode } from "react";
import { ImagePlus } from "lucide-react";

interface SideProps {
  src?: string;
  alt: string;
  label: string;
  children?: ReactNode;
}

function Side({ src, alt, label, children }: SideProps) {
  return (
    <div className="aspect-square overflow-hidden bg-white border border-border relative">
      {children ?? (
        src ? (
          <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8" strokeWidth={1.2} />
              <span className="text-[11px] uppercase tracking-wider">Photo à venir</span>
            </div>
          </div>
        )
      )}
      <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

interface MagnetPairProps {
  recto?: string;
  verso?: string;
  rectoAlt?: string;
  rectoContent?: ReactNode;
  caption: string;
}

export function MagnetPair({ recto, verso, rectoAlt = "Magnet", rectoContent, caption }: MagnetPairProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
        <Side src={recto} alt={`${rectoAlt} — recto`} label="Recto">
          {rectoContent}
        </Side>
        <Side src={verso} alt={`${rectoAlt} — verso avec QR code`} label="Verso" />
      </div>
      <p className="text-xs text-muted-foreground mt-3">{caption}</p>
    </>
  );
}
