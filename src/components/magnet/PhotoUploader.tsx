import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, ImageIcon, X, AlertCircle } from "lucide-react";
import { useMagnetStore } from "@/stores/magnetStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
};

export function PhotoUploader() {
  const imageUrl = useMagnetStore((state) => state.imageUrl);
  const setImage = useMagnetStore((state) => state.setImage);
  const clearImage = useMagnetStore((state) => state.clearImage);
  const setUploading = useMagnetStore((state) => state.setUploading);
  const setResolutionWarning = useMagnetStore((state) => state.setResolutionWarning);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setUploading(true);
      setResolutionWarning(null);

      const url = URL.createObjectURL(file);
      setImage(file, url);

      const img = new Image();
      img.onload = () => {
        const minDim = Math.min(img.naturalWidth, img.naturalHeight);
        if (minDim < 600) {
          setResolutionWarning(
            "La résolution de l'image est faible. Le rendu final pourrait être flou.",
          );
        }
        URL.revokeObjectURL(img.src);
        setUploading(false);
      };
      img.src = url;
    },
    [setImage, setUploading, setResolutionWarning],
  );

  const onDropRejected = useCallback((rejected: FileRejection[]) => {
    const first = rejected[0];
    if (first?.file?.size > MAX_SIZE) {
      toast.error("Fichier trop lourd", { description: "La taille maximale est de 20 Mo." });
    } else {
      toast.error("Format non supporté", { description: "JPG, JPEG, PNG, WEBP, HEIC uniquement." });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  if (imageUrl) {
    return (
      <div className="relative aspect-video bg-muted border border-border rounded-lg overflow-hidden">
        <img src={imageUrl} alt="Photo importée" className="w-full h-full object-contain" />
        <button
          onClick={clearImage}
          className="absolute top-2 right-2 p-1.5 bg-background/90 hover:bg-background border border-border shadow-sm transition-colors"
          aria-label="Remplacer la photo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 bg-background",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-secondary rounded-full">
          <Upload className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Glissez-déposez votre photo ici</p>
          <p className="text-sm text-muted-foreground">
            ou cliquez pour importer depuis votre appareil
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>JPG · PNG · WEBP · HEIC — max 20 Mo</span>
        </div>
      </div>
    </div>
  );
}

export function ResolutionWarning() {
  const warning = useMagnetStore((state) => state.resolutionWarning);
  if (!warning) return null;
  return (
    <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{warning}</span>
    </div>
  );
}
