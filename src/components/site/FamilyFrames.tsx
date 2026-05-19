import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { FAMILIES } from "./FamilyChips";
import { supabase } from "@/integrations/supabase/client";

export function FamilyFrames() {
  const items = FAMILIES.filter((f) => f.id !== "all");

  const { data: photos } = useQuery({
    queryKey: ["family_photos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("family_photos").select("family_id, photo_url");
      if (error) return [];
      return data ?? [];
    },
  });

  const photoMap = new Map((photos ?? []).map((p) => [p.family_id, p.photo_url]));

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="eyebrow">Univers Mémora</p>
        <h2 className="font-display text-4xl mt-2">Explorez par famille</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Une photo pour chaque univers — cliquez pour découvrir la collection.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((f) => {
          const photo = photoMap.get(f.id);
          const Icon = f.icon;
          return (
            <Link
              key={f.id}
              to="/collections"
              search={{ famille: f.id }}
              className="group block"
            >
              <div className="bg-background border border-border p-3 pb-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  {photo ? (
                    <img
                      src={photo}
                      alt={f.label}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ImagePlus className="h-8 w-8" strokeWidth={1.2} />
                        <span className="text-[11px] uppercase tracking-wider">Bientôt</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-4 flex items-center gap-2 justify-center text-center">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} />
                  <h3 className="font-display text-sm leading-tight group-hover:text-primary transition-colors">
                    {f.label}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
