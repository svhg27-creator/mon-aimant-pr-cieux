import { create } from "zustand";

export type TabSide = "recto" | "verso";

export interface TextStyle {
  content: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  vertical: boolean;
}

export interface PhotoState {
  url: string | null;
  file: File | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const FONTS = [
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Palatino",
  "Arial",
  "Helvetica",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Brush Script MT",
];

export const BACKGROUNDS: (string | null)[] = [
  null,
  ...Array.from({ length: 20 }, (_, i) => `/assets/backgrounds/background-${String(i + 1).padStart(2, "0")}.png`),
  "/assets/backgrounds/background-21.jpg",
  "/assets/backgrounds/background-22.jpg",
  "/assets/backgrounds/background-23.jpg",
  "/assets/backgrounds/background-24.jpg",
];

interface HommageState {
  activeTab: TabSide;
  photo: PhotoState;
  background: string | null;
  textStyle: TextStyle;
  isDragging: boolean;

  setActiveTab: (tab: TabSide) => void;
  setPhoto: (file: File, url: string) => void;
  clearPhoto: () => void;
  setPhotoX: (x: number) => void;
  setPhotoY: (y: number) => void;
  setPhotoScale: (scale: number) => void;
  setPhotoRotation: (rotation: number) => void;
  recenterPhoto: () => void;
  setBackground: (bg: string | null) => void;
  setTextContent: (content: string) => void;
  setTextStyle: (partial: Partial<TextStyle>) => void;
  setIsDragging: (v: boolean) => void;
}

export const useHommageStore = create<HommageState>((set) => ({
  activeTab: "recto",
  photo: { url: null, file: null, x: 0, y: 0, scale: 1, rotation: 0 },
  background: null,
  textStyle: {
    content: "",
    fontFamily: "Georgia",
    fontSize: 18,
    bold: false,
    italic: false,
    color: "#1a1a1a",
    align: "center",
    lineHeight: 1.5,
    vertical: false,
  },
  isDragging: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setPhoto: (file, url) =>
    set({ photo: { file, url, x: 0, y: 0, scale: 1, rotation: 0 } }),
  clearPhoto: () =>
    set({ photo: { file: null, url: null, x: 0, y: 0, scale: 1, rotation: 0 } }),
  setPhotoX: (x) => set((s) => ({ photo: { ...s.photo, x } })),
  setPhotoY: (y) => set((s) => ({ photo: { ...s.photo, y } })),
  setPhotoScale: (scale) => set((s) => ({ photo: { ...s.photo, scale: Math.max(0.1, Math.min(5, scale)) } })),
  setPhotoRotation: (rotation) => set((s) => ({ photo: { ...s.photo, rotation } })),
  recenterPhoto: () => set((s) => ({ photo: { ...s.photo, x: 0, y: 0, scale: 1, rotation: 0 } })),
  setBackground: (background) => set({ background }),
  setTextContent: (content) =>
    set((s) => ({ textStyle: { ...s.textStyle, content: content.slice(0, 300) } })),
  setTextStyle: (partial) => set((s) => ({ textStyle: { ...s.textStyle, ...partial } })),
  setIsDragging: (isDragging) => set({ isDragging }),
}));
