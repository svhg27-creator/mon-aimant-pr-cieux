import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ImagePlus } from "lucide-react";

export interface FamilyTeaserConfig {
  recto?: string;
  verso?: string;
  rectoLabel: string;
  versoLabel?: string;
  cardTo?: string;
  to?: string;
  cta?: string;
  children: ReactNode;
}

interface TeaserCardProps {
  img?: string;
  alt: string;
  label: string;
  to?: string;
}

function TeaserCard({ img, alt, label, to }: TeaserCardProps) {
  const inner = (
    <>
      <div className="aspect-square overflow-hidden bg-white border border-border relative">
        {img ? (
          <img
            src={img}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8" strokeWidth={1.2} />
              <span className="text-[11px] uppercase tracking-wider">Photo à venir</span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
        {label}
      </p>
    </>
  );
  if (!to) return <div className="group block">{inner}</div>;
  return (
    <Link to={to} className="group block">
      {inner}
    </Link>
  );
}

export function FamilyTeaser({
  recto,
  verso,
  rectoLabel,
  versoLabel = "QR Code",
  cardTo,
  to,
  cta,
  children,
}: FamilyTeaserConfig) {
  const encart = (
    <>
      <p className="font-display text-xl md:text-2xl leading-snug">{children}</p>
      {to && cta && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary font-medium">
          {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      )}
    </>
  );
  const encartClass =
    "group block border-2 border-primary/40 bg-primary/5 px-8 py-6 text-center hover:border-primary hover:bg-primary/10 transition-colors";

  return (
    <div className="mb-12">
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
        <TeaserCard img={recto} alt={rectoLabel} label={rectoLabel} to={cardTo} />
        <TeaserCard img={verso} alt="QR Code au verso du magnet" label={versoLabel} to={cardTo} />
      </div>
      <div className="max-w-2xl mx-auto">
        {to ? (
          <Link to={to} className={encartClass}>
            {encart}
          </Link>
        ) : (
          <div className={encartClass}>{encart}</div>
        )}
      </div>
    </div>
  );
}
