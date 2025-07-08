import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

interface ImageComposerProps {
  foregroundBlob: Blob | null;
  backgroundUrl: string | null;
  originalFile: File | null;
}

export default function ImageComposer({ foregroundBlob, backgroundUrl, originalFile }: ImageComposerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (foregroundBlob && backgroundUrl) {
      composeImage();
    }
  }, [foregroundBlob, backgroundUrl, scale, position]);

  const composeImage = async () => {
    if (!canvasRef.current || !foregroundBlob || !backgroundUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Load background image
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
        bgImg.src = backgroundUrl;
      });

      // Load foreground image
      const fgImg = new Image();
      const fgUrl = URL.createObjectURL(foregroundBlob);
      
      await new Promise((resolve, reject) => {
        fgImg.onload = resolve;
        fgImg.onerror = reject;
        fgImg.src = fgUrl;
      });

      // Set canvas size to background size
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      // Draw background
      ctx.drawImage(bgImg, 0, 0);

      // Calculate foreground position and size
      const fgWidth = fgImg.width * scale;
      const fgHeight = fgImg.height * scale;
      const fgX = (canvas.width - fgWidth) / 2 + position.x;
      const fgY = (canvas.height - fgHeight) / 2 + position.y;

      // Draw foreground
      ctx.drawImage(fgImg, fgX, fgY, fgWidth, fgHeight);

      URL.revokeObjectURL(fgUrl);
    } catch (error) {
      console.error('Error composing image:', error);
      toast.error('Failed to compose image');
    }
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
            Download
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
}