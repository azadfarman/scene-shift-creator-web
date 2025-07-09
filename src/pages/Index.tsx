import { useState } from 'react';
import BackgroundRemover from '@/components/BackgroundRemover';
import BackgroundGenerator from '@/components/BackgroundGenerator';
import ImageComposer, { ImageComposerRef } from '@/components/ImageComposer';
import AdvancedControls, { AdvancedSettings } from '@/components/AdvancedControls';
import BatchProcessor from '@/components/BatchProcessor';
import ExportStudio from '@/components/ExportStudio';
import { useRef } from 'react';

const Index = () => {
  const [processedImage, setProcessedImage] = useState<Blob | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings | undefined>();
  const canvasRef = useRef<ImageComposerRef>(null);

  const handleImageProcessed = (imageBlob: Blob, file: File) => {
    setProcessedImage(imageBlob);
    setOriginalFile(file);
  };

  const handleBackgroundGenerated = (url: string) => {
    setBackgroundUrl(url);
  };

  const handleAdvancedSettingsChange = (settings: AdvancedSettings) => {
    setAdvancedSettings(settings);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            AI Background Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Remove backgrounds and generate stunning AI-powered backgrounds for your images with professional quality results
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Background Remover */}
          <BackgroundRemover onImageProcessed={handleImageProcessed} />
          
          {/* Background Generator */}
          <BackgroundGenerator onBackgroundGenerated={handleBackgroundGenerated} />
        </div>

        {/* Advanced Controls */}
        <div className="mb-8">
          <AdvancedControls onSettingsChange={handleAdvancedSettingsChange} />
        </div>

        {/* Image Composer */}
        <div className="mb-8">
          <ImageComposer 
            ref={canvasRef}
            foregroundBlob={processedImage}
            backgroundUrl={backgroundUrl}
            originalFile={originalFile}
            advancedSettings={advancedSettings}
          />
        </div>

        {/* Professional Tools */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Batch Processor */}
          <BatchProcessor backgroundUrl={backgroundUrl} />
          
          {/* Export Studio */}
          <ExportStudio 
            canvasRef={{ current: canvasRef.current?.getCanvas() || null }}
            originalFileName={originalFile?.name}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-glass backdrop-blur-glass border-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Precise AI Removal</h3>
              <p className="text-muted-foreground">
                Advanced AI models remove backgrounds with pixel-perfect precision
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-glass backdrop-blur-glass border-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Background Generation</h3>
              <p className="text-muted-foreground">
                Create stunning backgrounds from text descriptions using AI
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-glass backdrop-blur-glass border-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Studio Tools</h3>
              <p className="text-muted-foreground">
                Professional editing with batch processing and export options
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="text-center p-6 rounded-lg bg-glass backdrop-blur-glass border-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Color Grading Studio</h3>
              <p className="text-muted-foreground">
                Professional color adjustments with real-time preview
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-glass backdrop-blur-glass border-glass">
              <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Batch Processing</h3>
              <p className="text-muted-foreground">
                Process hundreds of images simultaneously with queue management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;