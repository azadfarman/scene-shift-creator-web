import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Import the generated backgrounds
import bgStudio from '@/assets/bg-studio.jpg';
import bgNature from '@/assets/bg-nature.jpg';
import bgOffice from '@/assets/bg-office.jpg';
import bgGradient from '@/assets/bg-gradient.jpg';

interface BackgroundGeneratorProps {
  onBackgroundGenerated: (imageUrl: string) => void;
}

const PRESET_BACKGROUNDS = [
  { name: "Professional studio backdrop with soft lighting", image: bgStudio },
  { name: "Beautiful nature landscape with mountains and trees", image: bgNature },
  { name: "Modern minimalist office environment", image: bgOffice },
  { name: "Colorful gradient abstract background", image: bgGradient },
];

const ADDITIONAL_PROMPTS = [
  "Urban cityscape with skyscrapers",
  "Cozy living room interior",
];

export default function BackgroundGenerator({ onBackgroundGenerated }: BackgroundGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBackground = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a background description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check if prompt matches a preset background
      const presetMatch = PRESET_BACKGROUNDS.find(bg => 
        bg.name.toLowerCase().includes(prompt.toLowerCase()) || 
        prompt.toLowerCase().includes(bg.name.toLowerCase())
      );
      
      if (presetMatch) {
        onBackgroundGenerated(presetMatch.image);
        toast.success('Background generated successfully!');
      } else {
        // For custom prompts, use a high-quality placeholder
        const placeholderUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
        onBackgroundGenerated(placeholderUrl);
        toast.success('Background generated with placeholder!');
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast.error('Failed to generate background. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPresetBackground = (preset: typeof PRESET_BACKGROUNDS[0]) => {
    setPrompt(preset.name);
    onBackgroundGenerated(preset.image);
    toast.success('Background selected!');
  };

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Generate AI Background
          </h2>
          <p className="text-muted-foreground mt-2">
            Choose from AI-generated backgrounds or describe your own
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>AI-Generated Backgrounds</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BACKGROUNDS.map((preset, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => selectPresetBackground(preset)}>
                  <img 
                    src={preset.image} 
                    alt={preset.name}
                    className="w-full h-20 object-cover rounded border border-glass hover:border-primary transition-colors"
                  />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center p-1">
                    <p className="text-xs text-center font-medium">{preset.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Custom Background Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the background you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Prompts</Label>
            <div className="grid grid-cols-1 gap-2">
              {ADDITIONAL_PROMPTS.map((presetPrompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(presetPrompt)}
                  className="text-left justify-start h-auto py-2 px-3"
                >
                  {presetPrompt}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateBackground}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Background'}
          </Button>
        </div>
      </div>
    </Card>
  );
}