import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Move, ZoomIn, ZoomOut, Eye, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedSettings } from './AdvancedControls';

interface ImageComposerProps {
  foregroundBlob: Blob | null;
  backgroundUrl: string | null;
  originalFile: File | null;
  advancedSettings?: AdvancedSettings;
}

export interface ImageComposerRef {
  getCanvas: () => HTMLCanvasElement | null;
}

const ImageComposer = forwardRef<ImageComposerRef, ImageComposerProps>(
  ({ foregroundBlob, backgroundUrl, originalFile, advancedSettings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [showEdges, setShowEdges] = useState(false);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    if (foregroundBlob && backgroundUrl) {
      composeImage();
    }
  }, [foregroundBlob, backgroundUrl, scale, position, advancedSettings, showGrid, showEdges]);

  const composeImage = async () => {
    if (!canvasRef.current || !foregroundBlob || !backgroundUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = (e) => {
          console.error('Background image load error:', e);
          reject(new Error('Failed to load background image'));
        };
        bgImg.src = backgroundUrl;
      });

      // Load foreground image
      const fgImg = new Image();
      const fgUrl = URL.createObjectURL(foregroundBlob);
      
      await new Promise<void>((resolve, reject) => {
        fgImg.onload = () => resolve();
        fgImg.onerror = (e) => {
          console.error('Foreground image load error:', e);
          reject(new Error('Failed to load foreground image'));
        };
        fgImg.src = fgUrl;
      });

      // Set canvas size to background size
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      // Draw background
      ctx.drawImage(bgImg, 0, 0);

      // Apply advanced settings to background if needed
      if (advancedSettings) {
        applyAdvancedSettings(ctx, canvas.width, canvas.height, advancedSettings);
      }

      // Calculate foreground position and size
      const fgWidth = fgImg.width * scale;
      const fgHeight = fgImg.height * scale;
      let fgX = (canvas.width - fgWidth) / 2 + position.x;
      let fgY = (canvas.height - fgHeight) / 2 + position.y;

      // Apply snap to grid if enabled
      if (advancedSettings?.snapToGrid) {
        const gridSize = 20;
        fgX = Math.round(fgX / gridSize) * gridSize;
        fgY = Math.round(fgY / gridSize) * gridSize;
      }

      // Set blend mode and opacity
      if (advancedSettings?.blendMode && advancedSettings.blendMode !== 'normal') {
        ctx.globalCompositeOperation = advancedSettings.blendMode as GlobalCompositeOperation;
      }
      if (advancedSettings?.opacity !== undefined) {
        ctx.globalAlpha = advancedSettings.opacity / 100;
      }

      // Draw foreground
      ctx.drawImage(fgImg, fgX, fgY, fgWidth, fgHeight);

      // Reset composition settings
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      // Draw grid overlay if enabled
      if (showGrid) {
        drawGrid(ctx, canvas.width, canvas.height);
      }

      // Draw edge detection overlay if enabled
      if (showEdges && advancedSettings?.edgeDetection) {
        drawEdgeOverlay(ctx, fgImg, fgX, fgY, fgWidth, fgHeight);
      }

      URL.revokeObjectURL(fgUrl);
    } catch (error) {
      console.error('Error composing image:', error);
      toast.error('Failed to compose image');
    }
  };

  const applyAdvancedSettings = (ctx: CanvasRenderingContext2D, width: number, height: number, settings: AdvancedSettings) => {
    if (settings.brightness !== 0 || settings.contrast !== 0 || settings.saturation !== 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        if (settings.brightness !== 0) {
          data[i] = Math.max(0, Math.min(255, data[i] + settings.brightness * 2.55));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + settings.brightness * 2.55));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + settings.brightness * 2.55));
        }

        // Apply contrast
        if (settings.contrast !== 0) {
          const factor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));
          data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawEdgeOverlay = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalFile?.name.split('.')[0] || 'image'}_with_background.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Image downloaded successfully!');
      }
    }, 'image/png');
  };

  if (!foregroundBlob || !backgroundUrl) {
    return (
      <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
        <div className="text-center text-muted-foreground">
          <p>Remove background and generate AI background to see the composed result</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Final Result
          </h2>
          <p className="text-muted-foreground mt-2">
            Adjust position and scale, then download your image
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={() => setScale(scale * 1.1)}
            variant="outline"
            size="sm"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setScale(scale * 0.9)}
            variant="outline"
            size="sm"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowGrid(!showGrid)}
            variant={showGrid ? "default" : "outline"}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowEdges(!showEdges)}
            variant={showEdges ? "default" : "outline"}
            size="sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            onClick={resetTransform}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={downloadImage}
            className="bg-gradient-primary hover:opacity-90"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Quick Download
          </Button>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-secondary border">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-96 object-contain cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {isDragging && (
            <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-sm">
              <Move className="w-4 h-4 inline mr-1" />
              Dragging...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

ImageComposer.displayName = 'ImageComposer';

export default ImageComposer;