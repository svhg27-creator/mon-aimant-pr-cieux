import { useMemo } from "react";
import { DRAPEAUX_COEUR } from "@/data/drapeaux-coeur";

export interface DrapeauItem {
  id: number;
  pays: string;
  photo_url: string;
  qr_url: string | null;
  image_index: number;
  active: boolean;
}

export function useCatalogueDrapeaux() {
  return useMemo(() => ({ items: DRAPEAUX_COEUR, loading: false, error: null }), []);
}
