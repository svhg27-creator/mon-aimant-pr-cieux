import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useMagnetStore, SHAPES, type MagnetShape } from "@/stores/magnetStore";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCcw } from "lucide-react";
import type { Area } from "react-easy-crop";

function getAspectRatio(shape: MagnetShape): number {
  const s = SHAPES.find((x) => x.id === shape);
  if (!s) return 1;
  return s.width / s.height;
}

export function PhotoEditor() {
  const imageUrl = useMagnetStore((state) => state.imageUrl);
  const shape = useMagnetStore((state) => state.shape);
  const zoom = useMagnetStore((state) => state.zoom);
  const rotation = useMagnetStore((state) => state.rotation);
  const crop = useMagnetStore((state) => state.crop);
  const flipX = useMagnetStore((state) => state.flipX);
  const flipY = useMagnetStore((state) => state.flipY);

  const setZoom = useMagnetStore((state) => state.setZoom);
  const setRotation = useMagnetStore((state) => state.setRotation);
  const setCrop = useMagnetStore((state) => state.setCrop);
  const setCroppedArea = useMagnetStore((state) => state.setCroppedArea);
  const setFlipX = useMagnetStore((state) => state.setFlipX);
  const setFlipY = useMagnetStore((state) => state.setFlipY);
  const rotateLeft = useMagnetStore((state) => state.rotateLeft);
  const rotateRight = useMagnetStore((state) => state.rotateRight);
  const resetTransform = useMagnetStore((state) => state.resetTransform);

  const [localZoom, setLocalZoom] = useState(zoom);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedArea({
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });
    },
    [setCroppedArea],
  );

  if (!imageUrl) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-border">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={getAspectRatio(shape)}
          onCropChange={setCrop}
          onZoomChange={(z) => {
            setLocalZoom(z);
            setZoom(z);
          }}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          restrictPosition={true}
          style={{
            containerStyle: { background: "#f8f8f8" },
            cropAreaStyle: {
              border: "2px solid rgba(255,255,255,0.8)",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
            },
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
          }}
        />
      </div>

      <div className="space-y-4 bg-secondary/30 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Zoom</span>
            <span className="text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[localZoom]}
            min={0.5}
            max={5}
            step={0.05}
            onValueChange={([v]) => {
              setLocalZoom(v);
              setZoom(v);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={rotateLeft}
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" /> -90°
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={rotateRight}
            className="gap-1.5"
          >
            <RotateCw className="h-4 w-4" /> +90°
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFlipX(!flipX)}
            className={flipX ? "border-primary text-primary" : ""}
          >
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFlipY(!flipY)}
            className={flipY ? "border-primary text-primary" : ""}
          >
            <FlipVertical className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetTransform}
            className="gap-1.5"
          >
            <RefreshCcw className="h-4 w-4" /> Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}
