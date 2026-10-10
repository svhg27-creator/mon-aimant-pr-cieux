import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CatalogueProduct } from "@/lib/commerce";

export interface CartItem {
  lineId: string | null;
  product: CatalogueProduct;
  /** ID du produit dans la table Supabase `products` — utilisé par le checkout Stripe */
  product_id?: string;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  addLocalItem: (item: Omit<CartItem, "lineId">) => void;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

function mergeItems(items: CartItem[], item: Omit<CartItem, "lineId">): CartItem[] {
  const existing = items.find((i) => i.variantId === item.variantId);
  if (existing) {
    return items.map((i) =>
      i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
    );
  }
  return [...items, { ...item, lineId: null }];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        set({ items: mergeItems(get().items, item) });
      },

      addLocalItem: (item) => {
        set({ items: mergeItems(get().items, item) });
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },

      removeItem: async (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clearCart: () => set({ items: [] }),

      // Le panier est désormais purement local : rien à synchroniser.
      syncCart: async () => {},
    }),
    {
      name: "memora-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
