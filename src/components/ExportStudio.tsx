import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Cloud, 
  FileImage, 
  Settings, 
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportStudioProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  originalFileName?: string;
}

const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG (Transparent)', icon: '🖼️', quality: true },
  { value: 'jpg', label: 'JPEG (Small Size)', icon: '📷', quality: true },
  { value: 'webp', label: 'WebP (Modern)', icon: '🌐', quality: true },
  { value: 'svg', label: 'SVG (Vector)', icon: '📐', quality: false },
  { value: 'pdf', label: 'PDF (Print)', icon: '📄', quality: false }
];

const PRESET_SIZES = [
  { name: 'Original Size', width: 0, height: 0, icon: <FileImage className="w-4 h-4" /> },
  { name: 'HD (1920×1080)', width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" /> },
  { name: 'Instagram Post (1080×1080)', width: 1080, height: 1080, icon: <Instagram className="w-4 h-4" /> },
  { name: 'Instagram Story (1080×1920)', width: 1080, height: 1920, icon: <Smartphone className="w-4 h-4" /> },
  { name: 'Facebook Cover (1200×630)', width: 1200, height: 630, icon: <Facebook className="w-4 h-4" /> },
  { name: 'Twitter Header (1500×500)', width: 1500, height: 500, icon: <Twitter className="w-4 h-4" /> },
  { name: 'Tablet (1024×768)', width: 1024, height: 768, icon: <Tablet className="w-4 h-4" /> }
];

const WATERMARK_POSITIONS = [
  { value: 'none', label: 'No Watermark' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'center', label: 'Center' }
];

export default function ExportStudio({ canvasRef, originalFileName }: ExportStudioProps) {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [selectedSize, setSelectedSize] = useState(PRESET_SIZES[0]);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [addWatermark, setAddWatermark] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [compressionLevel, setCompressionLevel] = useState(75);
  const [preserveMetadata, setPreserveMetadata] = useState(false);

  const formatSupportsQuality = EXPORT_FORMATS.find(f => f.value === format)?.quality || false;

  const resizeCanvas = (canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
    const resizedCanvas = document.createElement('canvas');
    const ctx = resizedCanvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    
    // Calculate aspect ratio preservation
    const scale = Math.min(targetWidth / canvas.width, targetHeight / canvas.height);
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = (targetWidth - scaledWidth) / 2;
    const offsetY = (targetHeight - scaledHeight) / 2;
    
    // Fill background (transparent for PNG, white for others)
    if (format !== 'png') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);
    
    return resizedCanvas;
  };

  const addWatermarkToCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    if (!addWatermark || watermarkPosition === 'none') return canvas;
    
    const watermarkedCanvas = document.createElement('canvas');
    const ctx = watermarkedCanvas.getContext('2d');
    
    if (!ctx) return canvas;
    
    watermarkedCanvas.width = canvas.width;
    watermarkedCanvas.height = canvas.height;
    
    // Draw original image
    ctx.drawImage(canvas, 0, 0);
    
    // Add watermark
    const fontSize = Math.max(12, canvas.width * 0.02);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacity / 100})`;
    ctx.lineWidth = 1;
    
    const text = 'AI Background Studio';
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    let x = 0, y = 0;
    const padding = 20;
    
    switch (watermarkPosition) {
      case 'bottom-right':
        x = canvas.width - textWidth - padding;
        y = canvas.height - padding;
        break;
      case 'bottom-left':
        x = padding;
        y = canvas.height - padding;
        break;
      case 'top-right':
        x = canvas.width - textWidth - padding;
        y = textHeight + padding;
        break;
      case 'top-left':
        x = padding;
        y = textHeight + padding;
        break;
      case 'center':
        x = (canvas.width - textWidth) / 2;
        y = canvas.height / 2;
        break;
    }
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    
    return watermarkedCanvas;
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('No image to export');
      return;
    }

    try {
      let exportCanvas = canvasRef.current;
      
      // Resize if needed
      if (useCustomSize) {
        exportCanvas = resizeCanvas(exportCanvas, customWidth, customHeight);
      } else if (selectedSize.width > 0 && selectedSize.height > 0) {
        exportCanvas = resizeCanvas(exportCanvas, selectedSize.width, selectedSize.height);
      }
      
      // Add watermark
      exportCanvas = addWatermarkToCanvas(exportCanvas);
      
      // Export with format-specific options
      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      const qualityValue = formatSupportsQuality ? quality / 100 : 1;
      
      exportCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          
          const baseName = originalFileName?.split('.')[0] || 'image';
          const sizePostfix = useCustomSize ? `_${customWidth}x${customHeight}` : 
                             selectedSize.width > 0 ? `_${selectedSize.width}x${selectedSize.height}` : '';
          
          a.download = `${baseName}_studio${sizePostfix}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success(`Image exported as ${format.toUpperCase()}!`);
        }
      }, mimeType, qualityValue);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) {
      toast.error('No image to share');
      return;
    }

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `ai-background-studio.${format}`, { type: blob.type });
          
          await navigator.share({
            title: 'AI Background Studio Creation',
            text: 'Check out this image I created with AI Background Studio!',
            files: [file]
          });
          
          toast.success('Image shared successfully!');
        } else {
          // Fallback to copying blob URL
          const url = URL.createObjectURL(blob!);
          await navigator.clipboard.writeText(url);
          toast.success('Image URL copied to clipboard!');
        }
      }, `image/${format}`, quality / 100);
    } catch (error) {
      toast.error('Failed to share image');
    }
  };

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Download className="w-6 h-6" />
            Export Studio
          </h2>
          <p className="text-muted-foreground mt-2">
            Professional export options with custom sizing and watermarks
          </p>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Format & Quality
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      <span className="flex items-center gap-2">
                        <span>{fmt.icon}</span>
                        {fmt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {formatSupportsQuality && (
              <div className="space-y-2">
                <Label>Quality: {quality}%</Label>
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => setQuality(value)}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Size Presets */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Output Size
          </Label>
          
          <div className="grid grid-cols-1 gap-2">
            {PRESET_SIZES.map((size, index) => (
              <Button
                key={index}
                variant={selectedSize === size ? "default" : "outline"}
                onClick={() => {
                  setSelectedSize(size);
                  setUseCustomSize(false);
                }}
                className="justify-start h-auto py-3"
              >
                <div className="flex items-center gap-3">
                  {size.icon}
                  <div className="text-left">
                    <div className="font-medium">{size.name}</div>
                    {size.width > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {size.width} × {size.height}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Switch
              checked={useCustomSize}
              onCheckedChange={setUseCustomSize}
            />
            <Label>Custom Size</Label>
          </div>
          
          {useCustomSize && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  min="1"
                  max="4096"
                />
              </div>
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  min="1"
                  max="4096"
                />
              </div>
            </div>
          )}
        </div>

        {/* Watermark Options */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Watermark
            <Badge variant="secondary" className="text-xs">Pro Feature</Badge>
          </Label>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Switch
              checked={addWatermark}
              onCheckedChange={setAddWatermark}
            />
            <Label>Add Watermark</Label>
          </div>
          
          {addWatermark && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WATERMARK_POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Opacity: {watermarkOpacity}%</Label>
                <Slider
                  value={[watermarkOpacity]}
                  onValueChange={([value]) => setWatermarkOpacity(value)}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={handleExport}
            className="bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Image
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            disabled
          >
            <Cloud className="w-4 h-4 mr-2" />
            Save to Cloud
            <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
          </Button>
        </div>
      </div>
    </Card>
  );
}