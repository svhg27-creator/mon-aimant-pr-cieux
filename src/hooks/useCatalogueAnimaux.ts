import { useEffect, useState } from "react";

const SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjanhhY21kemh6amRpcWpzYmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mzg3ODEsImV4cCI6MjA5MzUxNDc4MX0.d7k_MGmhLmB3dwAJYaO1vp6t6QOUNNPEgY3_6drvrQw";

export interface CatalogueItem {
  id: number;
  espece: string;
  nom: string;
  photo_url: string;
  image_name: string;
  image_index: number;
  bucket_name: string;
  active: boolean;
}

export function useCatalogueAnimaux(espece: string) {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `${SUPABASE_URL}/rest/v1/catalogue_animaux?espece=eq.${espece}&active=eq.true&order=image_index.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CatalogueItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [espece]);

  return { items, loading, error };
}
