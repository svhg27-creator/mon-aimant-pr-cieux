import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MagnetShape = "rond25" | "rond37" | "carre37" | "coeur70" | "rectangle37x115";

export interface ShapeOption {
  id: MagnetShape;
  name: string;
  dimensions: string;
  width: number;
  height: number;
  unitPrice: number;
  icon: string;
}

export const SHAPES: ShapeOption[] = [
  {
    id: "rond25",
    name: "Rond",
    dimensions: "Ø 25 mm",
    width: 25,
    height: 25,
    unitPrice: 2.5,
    icon: "circle",
  },
  {
    id: "rond37",
    name: "Rond",
    dimensions: "Ø 37 mm",
    width: 37,
    height: 37,
    unitPrice: 3.5,
    icon: "circle",
  },
  {
    id: "carre37",
    name: "Carré",
    dimensions: "37 × 37 mm",
    width: 37,
    height: 37,
    unitPrice: 4.5,
    icon: "square",
  },
  {
    id: "coeur70",
    name: "Cœur",
    dimensions: "70 × 65 mm",
    width: 70,
    height: 65,
    unitPrice: 5.0,
    icon: "heart",
  },
  {
    id: "rectangle37x115",
    name: "Rectangle",
    dimensions: "115 × 37 mm",
    width: 115,
    height: 37,
    unitPrice: 6.5,
    icon: "rectangle",
  },
];

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MagnetState {
  imageUrl: string | null;
  imageFile: File | null;
  shape: MagnetShape;
  quantity: number;
  zoom: number;
  rotation: number;
  crop: { x: number; y: number };
  flipX: boolean;
  flipY: boolean;
  croppedArea: CropData | null;
  projectId: string | null;
  customerSession: string;
  isUploading: boolean;
  isSaving: boolean;
  resolutionWarning: string | null;

  setImage: (file: File, url: string) => void;
  clearImage: () => void;
  setShape: (shape: MagnetShape) => void;
  setQuantity: (quantity: number) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  setCrop: (crop: { x: number; y: number }) => void;
  setFlipX: (flip: boolean) => void;
  setFlipY: (flip: boolean) => void;
  setCroppedArea: (area: CropData) => void;
  setProjectId: (id: string | null) => void;
  setUploading: (uploading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setResolutionWarning: (warning: string | null) => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  resetTransform: () => void;
  getUnitPrice: () => number;
  getTotalPrice: () => number;
  getShape: () => ShapeOption;
}

const generateSession = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useMagnetStore = create<MagnetState>()(
  persist(
    (set, get) => ({
      imageUrl: null,
      imageFile: null,
      shape: "carre37",
      quantity: 1,
      zoom: 1,
      rotation: 0,
      crop: { x: 0, y: 0 },
      flipX: false,
      flipY: false,
      croppedArea: null,
      projectId: null,
      customerSession: generateSession(),
      isUploading: false,
      isSaving: false,
      resolutionWarning: null,

      setImage: (file, url) =>
        set({
          imageFile: file,
          imageUrl: url,
          zoom: 1,
          rotation: 0,
          crop: { x: 0, y: 0 },
          croppedArea: null,
        }),
      clearImage: () =>
        set({
          imageFile: null,
          imageUrl: null,
          zoom: 1,
          rotation: 0,
          crop: { x: 0, y: 0 },
          croppedArea: null,
        }),
      setShape: (shape) => set({ shape }),
      setQuantity: (quantity) => set({ quantity: Math.max(1, Math.min(1000, quantity)) }),
      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(5, zoom)) }),
      setRotation: (rotation) => set({ rotation }),
      setCrop: (crop) => set({ crop }),
      setFlipX: (flipX) => set({ flipX }),
      setFlipY: (flipY) => set({ flipY }),
      setCroppedArea: (croppedArea) => set({ croppedArea }),
      setProjectId: (projectId) => set({ projectId }),
      setUploading: (isUploading) => set({ isUploading }),
      setSaving: (isSaving) => set({ isSaving }),
      setResolutionWarning: (resolutionWarning) => set({ resolutionWarning }),
      rotateLeft: () => set((state) => ({ rotation: state.rotation - 90 })),
      rotateRight: () => set((state) => ({ rotation: state.rotation + 90 })),
      resetTransform: () =>
        set({ zoom: 1, rotation: 0, crop: { x: 0, y: 0 }, flipX: false, flipY: false }),
      getUnitPrice: () => SHAPES.find((s) => s.id === get().shape)?.unitPrice ?? 4.5,
      getTotalPrice: () => {
        const state = get();
        return state.getUnitPrice() * state.quantity;
      },
      getShape: () => SHAPES.find((s) => s.id === get().shape) ?? SHAPES[2],
    }),
    {
      name: "magnet-configurator",
      partialize: (state) => ({
        shape: state.shape,
        quantity: state.quantity,
        customerSession: state.customerSession,
        projectId: state.projectId,
      }),
    },
  ),
);
