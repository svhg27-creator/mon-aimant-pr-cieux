import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles, PawPrint, Heart, Flower2, PartyPopper, Image as ImageIcon,
  Feather, Crown, HeartHandshake, Gift, Baby, Truck, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const FAMILIES = [
  { id: "all", label: "Tout", icon: Sparkles, tags: [] as string[] },
  { id: "prenoms", label: "Fête des prénoms", icon: Sparkles, tags: ["prenom", "prénom", "fete-prenom"] },
  { id: "animaux", label: "Animaux", icon: PawPrint, tags: ["animal", "animaux", "pet"] },
  { id: "drapeau-coeur", label: "Drapeau cœur", icon: Heart, tags: ["drapeau", "coeur", "flag"] },
  { id: "message", label: "Message fleur / Bouteille / Cadeau", icon: Flower2, tags: ["message", "fleur", "bouteille", "cadeau"] },
  { id: "evenements", label: "Mariage · Baptême · Anniversaire", icon: PartyPopper, tags: ["mariage", "bapteme", "baptême", "anniversaire", "marque-table"] },
  { id: "souvenir-photo", label: "Souvenir photo", icon: ImageIcon, tags: ["photo", "souvenir"] },
  { id: "hommage", label: "Hommage", icon: Feather, tags: ["hommage", "memoriam"] },
  { id: "fete-meres", label: "Fête des mères & grand-mères", icon: Crown, tags: ["fete-meres", "fête-mères", "grand-mere"] },
  { id: "saint-valentin", label: "Saint-Valentin", icon: HeartHandshake, tags: ["saint-valentin", "valentin", "amour"] },
  { id: "fin-annee", label: "Fêtes de fin d'année", icon: Gift, tags: ["noel", "noël", "nouvel-an", "fetes"] },
  { id: "premiere-main", label: "1ère main", icon: Baby, tags: ["premiere-main", "naissance", "bebe"] },
  { id: "logistique", label: "Logistique", icon: Truck, tags: ["logistique", "livraison", "frais-port"] },
  { id: "calendrier", label: "Calendrier organisateur", icon: CalendarDays, tags: ["calendrier", "organisateur", "planner"] },
];

interface Props {
  active?: string;
  onSelect?: (id: string) => void;
  linkMode?: boolean;
}

export function FamilyChips({ active, onSelect, linkMode = false }: Props) {
  const navigate = useNavigate();
  return (
    <div className="-mx-6 px-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-2">
        {FAMILIES.map((f) => {
          const Icon = f.icon;
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                if (linkMode) {
                  navigate({ to: "/collections", search: { famille: f.id } });
                } else {
                  onSelect?.(f.id);
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 px-4 h-10 border text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground/80 border-border hover:border-primary/50 hover:text-primary font-extrabold",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
