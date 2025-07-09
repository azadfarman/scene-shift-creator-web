import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  FileImage,
  Zap,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground } from '@/lib/backgroundRemoval';
import { loadImage } from '@/lib/imageUtils';

interface BatchItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

interface BatchProcessorProps {
  backgroundUrl?: string;
}

export default function BatchProcessor({ backgroundUrl }: BatchProcessorProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileSelect = useCallback((files: FileList) => {
    const newItems: BatchItem[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        status: 'pending' as const,
        progress: 0
      }));

    setItems(prev => [...prev, ...newItems]);
    
    if (newItems.length > 0) {
      toast.success(`Added ${newItems.length} images to batch queue`);
    }
  }, []);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (!isProcessing) {
      setItems([]);
      setCurrentIndex(0);
    }
  };

  const processNext = async () => {
    const pendingItems = items.filter(item => item.status === 'pending');
    if (pendingItems.length === 0 || isProcessing) return;

    const item = pendingItems[0];
    setIsProcessing(true);

    // Update status to processing
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'processing' as const, progress: 0 } : i
    ));

    try {
      const imageElement = await loadImage(item.file);
      
      const result = await removeBackground(imageElement, (progress) => {
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, progress } : i
        ));
      });

      setItems(prev => prev.map(i => 
        i.id === item.id ? { 
          ...i, 
          status: 'completed' as const, 
          progress: 100, 
          result 
        } : i
      ));

      toast.success(`Processed ${item.file.name}`);
    } catch (error) {
      setItems(prev => prev.map(i => 
        i.id === item.id ? { 
          ...i, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : i
      ));

      toast.error(`Failed to process ${item.file.name}`);
    }

    setIsProcessing(false);
    setCurrentIndex(prev => prev + 1);

    // Auto-process next item
    setTimeout(() => {
      const remainingPending = items.filter(item => 
        item.status === 'pending' && item.id !== item.id
      );
      if (remainingPending.length > 0) {
        processNext();
      }
    }, 1000);
  };

  const startBatchProcessing = async () => {
    if (items.filter(item => item.status === 'pending').length === 0) return;
    
    setCurrentIndex(0);
    processNext();
  };

  const downloadAll = () => {
    const completedItems = items.filter(item => item.status === 'completed' && item.result);
    
    if (completedItems.length === 0) {
      toast.error('No completed items to download');
      return;
    }

    completedItems.forEach((item, index) => {
      if (item.result) {
        const url = URL.createObjectURL(item.result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.file.name.split('.')[0]}_no_bg.png`;
        
        // Delay downloads to avoid browser blocking
        setTimeout(() => {
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, index * 500);
      }
    });

    toast.success(`Downloading ${completedItems.length} processed images`);
  };

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const pendingCount = items.filter(item => item.status === 'pending').length;

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Zap className="w-6 h-6" />
            Batch Processor
          </h2>
          <p className="text-muted-foreground mt-2">
            Process multiple images simultaneously with AI precision
          </p>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-glass rounded-lg p-6 text-center transition-colors hover:bg-gradient-accent cursor-pointer"
          onClick={() => document.getElementById('batch-file-input')?.click()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) {
              handleFileSelect(e.dataTransfer.files);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="font-medium">Drop multiple images here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
          <input
            id="batch-file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files);
              }
            }}
          />
        </div>

        {/* Stats */}
        {items.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary">
              Total: {items.length}
            </Badge>
            <Badge variant="default">
              Pending: {pendingCount}
            </Badge>
            <Badge variant="default">
              Completed: {completedCount}
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive">
                Errors: {errorCount}
              </Badge>
            )}
          </div>
        )}

        {/* Controls */}
        {items.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              onClick={startBatchProcessing}
              disabled={isProcessing || pendingCount === 0}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isProcessing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isProcessing ? 'Processing...' : 'Start Processing'}
            </Button>
            
            <Button
              onClick={downloadAll}
              disabled={completedCount === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All ({completedCount})
            </Button>
            
            <Button
              onClick={clearAll}
              disabled={isProcessing}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Queue
            </Button>
          </div>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border"
              >
                <FileImage className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <Badge variant={getStatusColor(item.status)} className="text-xs">
                    {item.status}
                  </Badge>
                </div>

                {item.status === 'processing' && (
                  <div className="w-20">
                    <Progress value={item.progress} className="h-1" />
                  </div>
                )}

                <Button
                  onClick={() => removeItem(item.id)}
                  disabled={isProcessing && item.status === 'processing'}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <FileImage className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No images in queue</p>
            <p className="text-sm">Upload multiple images to get started</p>
          </div>
        )}
      </div>
    </Card>
  );
}