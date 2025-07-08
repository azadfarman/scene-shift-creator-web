import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Wand2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground } from '@/lib/backgroundRemoval';
import { loadImage } from '@/lib/imageUtils';

interface BackgroundRemoverProps {
  onImageProcessed: (imageBlob: Blob, originalFile: File) => void;
}

export default function BackgroundRemover({ onImageProcessed }: BackgroundRemoverProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const imageElement = await loadImage(selectedFile);
      const processedBlob = await removeBackground(imageElement, setProgress);
      
      onImageProcessed(processedBlob, selectedFile);
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Remove Background
          </h2>
          <p className="text-muted-foreground mt-2">
            Upload an image and let AI remove the background
          </p>
        </div>

        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-glass rounded-lg p-8 text-center transition-colors hover:bg-gradient-accent cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drag & drop an image here</p>
            <p className="text-muted-foreground">or click to browse</p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-secondary">
              <img
                src={previewUrl || ''}
                alt="Selected"
                className="w-full h-64 object-contain"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                variant="outline"
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Different Image
              </Button>
              
              <Button
                onClick={processImage}
                disabled={isProcessing}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Remove Background'}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}