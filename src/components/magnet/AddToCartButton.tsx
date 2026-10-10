import { useMagnetStore } from "@/stores/magnetStore";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCallback } from "react";
import type { CatalogueProduct } from "@/lib/commerce";
import type { Json } from "@/integrations/supabase/types";

function generateUUID() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCurrentShapeInfo(shape: string) {
  switch (shape) {
    case "rond25":
      return { title: "Magnet Rond Ø25 mm", handle: "magnet-rond-25" };
    case "rond37":
      return { title: "Magnet Rond Ø37 mm", handle: "magnet-rond-37" };
    case "carre37":
      return { title: "Magnet Carré 37×37 mm", handle: "magnet-carre-37" };
    case "coeur70":
      return { title: "Magnet Cœur 70×65 mm", handle: "magnet-coeur-70" };
    case "rectangle37x115":
      return { title: "Magnet Rectangle 115×37 mm", handle: "magnet-rectangle-37x115" };
    default:
      return { title: "Magnet personnalisé", handle: "magnet-personnalise" };
  }
}

function buildFakeProduct(
  shapeInfo: { title: string; handle: string },
  imageUrl: string,
): CatalogueProduct {
  return {
    node: {
      id: generateUUID(),
      title: shapeInfo.title,
      description: "Magnet photo personnalisé créé sur Mémora.",
      handle: shapeInfo.handle,
      priceRange: {
        minVariantPrice: { amount: "0.00", currencyCode: "EUR" },
      },
      images: { edges: [{ node: { url: imageUrl, altText: shapeInfo.title } }] },
      variants: {
        edges: [
          {
            node: {
              id: shapeInfo.handle,
              title: "Personnalisé",
              availableForSale: true,
              price: { amount: "0.00", currencyCode: "EUR" },
              selectedOptions: [],
            },
          },
        ],
      },
      options: [],
    },
  };
}

export function AddToCartButton() {
  const imageFile = useMagnetStore((state) => state.imageFile);
  const imageUrl = useMagnetStore((state) => state.imageUrl);
  const shape = useMagnetStore((state) => state.shape);
  const quantity = useMagnetStore((state) => state.quantity);
  const totalPrice = useMagnetStore((state) => state.getTotalPrice());
  const crop = useMagnetStore((state) => state.crop);
  const zoom = useMagnetStore((state) => state.zoom);
  const rotation = useMagnetStore((state) => state.rotation);
  const flipX = useMagnetStore((state) => state.flipX);
  const flipY = useMagnetStore((state) => state.flipY);
  const croppedArea = useMagnetStore((state) => state.croppedArea);
  const customerSession = useMagnetStore((state) => state.customerSession);
  const isSaving = useMagnetStore((state) => state.isSaving);
  const setSaving = useMagnetStore((state) => state.setSaving);
  const setProjectId = useMagnetStore((state) => state.setProjectId);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = useCallback(async () => {
    if (!imageFile || !imageUrl) {
      toast.error("Veuillez importer une photo");
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const uuid = generateUUID();
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `uploads/${year}/${month}/${uuid}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(uploadData.path);
      const uploadedUrl = publicUrlData.publicUrl;

      const { data: project, error: dbError } = await supabase
        .from("magnet_projects")
        .insert({
          image_url: uploadedUrl,
          shape,
          width: 0,
          height: 0,
          quantity,
          total_price: totalPrice,
          crop_data: {
            crop: crop as unknown as Record<string, number>,
            zoom,
            rotation,
            flipX,
            flipY,
            croppedArea: croppedArea
              ? {
                  x: croppedArea.x,
                  y: croppedArea.y,
                  width: croppedArea.width,
                  height: croppedArea.height,
                }
              : null,
          } as Json,
          rotation,
          zoom,
          customer_session: customerSession,
          status: "draft",
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      setProjectId(project?.id ?? null);

      const shapeInfo = getCurrentShapeInfo(shape);
      const product = buildFakeProduct(shapeInfo, uploadedUrl);
      addItem({
        product,
        product_id: shapeInfo.handle,
        variantId: `${shapeInfo.handle}-${uuid}`,
        variantTitle: "Personnalisé",
        price: { amount: (totalPrice / quantity).toFixed(2), currencyCode: "EUR" },
        quantity,
        selectedOptions: [
          { name: "Forme", value: shapeInfo.title },
          { name: "Quantité", value: String(quantity) },
        ],
      });

      toast.success("Ajouté au panier", {
        description: `${shapeInfo.title} — ${quantity} exemplaire(s)`,
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Veuillez réessayer.";
      toast.error("Erreur lors de l'ajout au panier", {
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }, [
    imageFile,
    imageUrl,
    shape,
    quantity,
    totalPrice,
    crop,
    zoom,
    rotation,
    flipX,
    flipY,
    croppedArea,
    customerSession,
    setSaving,
    setProjectId,
    addItem,
  ]);

  return (
    <Button
      size="lg"
      className="w-full h-12 rounded-none gap-2"
      onClick={handleAddToCart}
      disabled={!imageUrl || isSaving}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {isSaving ? "Enregistrement…" : "Ajouter au panier"}
    </Button>
  );
}
