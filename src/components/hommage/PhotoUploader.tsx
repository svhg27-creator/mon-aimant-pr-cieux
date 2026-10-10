import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { useHommageStore } from "@/stores/hommageStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPTED = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
};

export function PhotoUploader() {
  const { photo, setPhoto, clearPhoto, setPhotoScale, setPhotoRotation, recenterPhoto } = useHommageStore();

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(file, url);
  }, [setPhoto]);

  const onDropRejected = useCallback((rejected: FileRejection[]) => {
    const f = rejected[0];
    if (f?.file?.size > MAX_SIZE) {
      toast.error("Fichier trop lourd", { description: "20 Mo maximum." });
    } else {
      toast.error("Format non supporté", { description: "JPG, PNG, WEBP, HEIC uniquement." });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      {!photo.url ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.25} />
            <p className="text-sm">Glissez votre photo ou cliquez</p>
            <p className="text-xs text-muted-foreground">JPG · PNG · WEBP · HEIC — 20 Mo max</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{photo.file?.name}</p>
            <Button variant="ghost" size="sm" onClick={clearPhoto} className="h-7 px-2 text-destructive">
              <X className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zoom</span>
              <span>{Math.round(photo.scale * 100)}%</span>
            </div>
            <Slider
              value={[photo.scale]}
              min={0.1}
              max={5}
              step={0.05}
              onValueChange={([v]) => setPhotoScale(v)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rotation</span>
              <span>{photo.rotation}°</span>
            </div>
            <Slider
              value={[photo.rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([v]) => setPhotoRotation(v)}
            />
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs" onClick={recenterPhoto}>
            Recentrer
          </Button>
        </div>
      )}
    </div>
  );
}
