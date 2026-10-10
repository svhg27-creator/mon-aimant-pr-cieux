import { useEffect, useState } from "react";

const SUPABASE_URL = "https://fcjxacmdzhzjdiqjsbid.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjanhhY21kemh6amRpcWpzYmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Mzg3ODEsImV4cCI6MjA5MzUxNDc4MX0.d7k_MGmhLmB3dwAJYaO1vp6t6QOUNNPEgY3_6drvrQw";

export interface PrenomItem {
  id: number;
  prenom: string;
  genre: "fille" | "garcon" | "mixte";
  origine: string | null;
  signification: string | null;
  fete_date: string | null;
  fete_label: string | null;
  photo_url: string | null;
  active: boolean;
}

export function usePrenoms(genre: "fille" | "garcon" | "mixte") {
  const [items, setItems] = useState<PrenomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `${SUPABASE_URL}/rest/v1/prenoms?genre=eq.${genre}&active=eq.true&order=prenom.asc`,
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
      .then((data: PrenomItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [genre]);

  return { items, loading, error };
}
