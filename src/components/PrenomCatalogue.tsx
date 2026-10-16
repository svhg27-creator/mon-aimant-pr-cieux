import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PrenomMagnetCanvas,
  searchPrenom,
  type PrenomMagnetItem,
} from "@/components/PrenomMagnetCanvas";
import { MagnetPair } from "@/components/site/MagnetPair";
import { QrWithLabel, wikiSearchUrl } from "@/components/site/QrPair";

const MAX_SUGGESTIONS = 12;

const SEXE_COLORS: Record<string, string> = {
  Fille: "#F7B4C0",
  "Garçon": "#9FC5E8",
  Garcon: "#9FC5E8",
  Mixte: "#C9A7EB",
};

function SexeBadge({ sexe }: { sexe?: string | null }) {
  if (!sexe) return null;
  const color = SEXE_COLORS[sexe] ?? "#e5e7eb";
  return (
    <span
      className="inline-block shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${color}55`, color: "#1a1a1a" }}
    >
      {sexe}
    </span>
  );
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface PrenomCatalogueProps {
  items: PrenomMagnetItem[];
  color: string;
  breadcrumb: string;
}

export function PrenomCatalogue({ items, color, breadcrumb }: PrenomCatalogueProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [selected, setSelected] = useState<PrenomMagnetItem | null>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const needle = normalize(q.trim());
    if (!needle) return [];
    const starts = items.filter((p) => normalize(p.prenom).startsWith(needle));
    const contains = items.filter(
      (p) => !normalize(p.prenom).startsWith(needle) && normalize(p.prenom).includes(needle),
    );
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [items, q]);

  const matched = selected ?? searchPrenom(items, q);

  const pick = (item: PrenomMagnetItem) => {
    setSelected(item);
    setQ(item.prenom);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && open && highlight >= 0 && suggestions[highlight]) {
      e.preventDefault();
      pick(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "prenoms" }} className="hover:text-primary">
          Fête des prénoms
        </Link>
        <span>/</span>
        <span className="text-foreground">{breadcrumb}</span>
      </nav>

      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Fête des prénoms
        </p>
        <h1 className="font-display text-5xl mt-3">Prénoms {breadcrumb}</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Saisissez un prénom pour visualiser le magnet personnalisé.
        </p>
        <MagnetPair
          rectoContent={
            <PrenomMagnetCanvas item={matched} color={color} placeholder="Tapez un prénom" />
          }
          versoContent={
            matched ? (
              <QrWithLabel
                value={wikiSearchUrl(matched.prenom)}
                label={matched.prenom}
                icon={Sparkles}
              />
            ) : undefined
          }
          caption="Chaque magnet porte un QR code au dos — à scanner pour retrouver la fête du prénom."
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm mx-auto w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSelected(null);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              blurTimeout.current = setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un prénom…"
            className="pl-9 h-11"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-autocomplete="list"
          />
          {open && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-auto bg-background border border-border shadow-lg z-20"
              role="listbox"
            >
              {suggestions.map((p, i) => (
                <li key={`${p.prenom}-${i}`} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm flex items-baseline justify-between gap-3 hover:bg-primary/5",
                      i === highlight && "bg-primary/5",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(p);
                    }}
                    onMouseEnter={() => setHighlight(i)}
                  >
                    <span className="font-medium">{p.prenom}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {p.fete_label && (
                        <span className="text-xs text-muted-foreground">{p.fete_label}</span>
                      )}
                      <SexeBadge sexe={p.sexe} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {matched ? (
        <div className="text-center">
          <p className="font-display text-2xl inline-flex items-center gap-2">
            {matched.prenom}
            <SexeBadge sexe={matched.sexe} />
          </p>
          {matched.fete_label && (
            <p className="text-muted-foreground mt-1">{matched.fete_label}</p>
          )}
        </div>
      ) : q.trim() ? (
        <p className="text-center text-muted-foreground">Aucun prénom trouvé.</p>
      ) : null}
    </div>
  );
}
