import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Palette, 
  Sparkles, 
  Eye, 
  Grid3X3, 
  Layers,
  Wand2,
  Cpu,
  Settings2
} from 'lucide-react';

interface AdvancedControlsProps {
  onSettingsChange: (settings: AdvancedSettings) => void;
}

export interface AdvancedSettings {
  edgeDetection: boolean;
  snapToGrid: boolean;
  blendMode: string;
  opacity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  shadows: number;
  highlights: number;
  temperature: number;
  aiEnhancement: boolean;
  qualityMode: string;
}

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' }
];

const QUALITY_MODES = [
  { value: 'draft', label: 'Draft (Fast)', icon: '⚡' },
  { value: 'standard', label: 'Standard', icon: '⚖️' },
  { value: 'high', label: 'High Quality', icon: '💎' },
  { value: 'ultra', label: 'Ultra (AI Enhanced)', icon: '🚀' }
];

export default function AdvancedControls({ onSettingsChange }: AdvancedControlsProps) {
  const [settings, setSettings] = useState<AdvancedSettings>({
    edgeDetection: false,
    snapToGrid: false,
    blendMode: 'normal',
    opacity: 100,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    shadows: 0,
    highlights: 0,
    temperature: 0,
    aiEnhancement: false,
    qualityMode: 'standard'
  });

  const updateSetting = (key: keyof AdvancedSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="p-6 bg-glass backdrop-blur-glass border-glass">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Settings2 className="w-6 h-6" />
            Advanced Studio Controls
          </h2>
          <p className="text-muted-foreground mt-2">
            Professional-grade editing tools powered by AI
          </p>
        </div>

        {/* Smart Features */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Smart Features
          </Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Label>Edge Detection</Label>
              </div>
              <Switch
                checked={settings.edgeDetection}
                onCheckedChange={(checked) => updateSetting('edgeDetection', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                <Label>Snap to Grid</Label>
              </div>
              <Switch
                checked={settings.snapToGrid}
                onCheckedChange={(checked) => updateSetting('snapToGrid', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <Label>AI Enhancement</Label>
                <Badge variant="secondary" className="text-xs">Pro</Badge>
              </div>
              <Switch
                checked={settings.aiEnhancement}
                onCheckedChange={(checked) => updateSetting('aiEnhancement', checked)}
              />
            </div>
          </div>
        </div>

        {/* Quality Mode */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Processing Quality
          </Label>
          <Select value={settings.qualityMode} onValueChange={(value) => updateSetting('qualityMode', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <span className="flex items-center gap-2">
                    <span>{mode.icon}</span>
                    {mode.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Blend Mode */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Composition
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Blend Mode</Label>
              <Select value={settings.blendMode} onValueChange={(value) => updateSetting('blendMode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLEND_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Opacity: {settings.opacity}%</Label>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => updateSetting('opacity', value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Color Adjustments */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Grading
          </Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}</Label>
              <Slider
                value={[settings.brightness]}
                onValueChange={([value]) => updateSetting('brightness', value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}</Label>
              <Slider
                value={[settings.contrast]}
                onValueChange={([value]) => updateSetting('contrast', value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}</Label>
              <Slider
                value={[settings.saturation]}
                onValueChange={([value]) => updateSetting('saturation', value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Hue: {settings.hue > 0 ? '+' : ''}{settings.hue}°</Label>
              <Slider
                value={[settings.hue]}
                onValueChange={([value]) => updateSetting('hue', value)}
                min={-180}
                max={180}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Shadows: {settings.shadows > 0 ? '+' : ''}{settings.shadows}</Label>
              <Slider
                value={[settings.shadows]}
                onValueChange={([value]) => updateSetting('shadows', value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Highlights: {settings.highlights > 0 ? '+' : ''}{settings.highlights}</Label>
              <Slider
                value={[settings.highlights]}
                onValueChange={([value]) => updateSetting('highlights', value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={() => {
            const defaultSettings: AdvancedSettings = {
              edgeDetection: false,
              snapToGrid: false,
              blendMode: 'normal',
              opacity: 100,
              brightness: 0,
              contrast: 0,
              saturation: 0,
              hue: 0,
              shadows: 0,
              highlights: 0,
              temperature: 0,
              aiEnhancement: false,
              qualityMode: 'standard'
            };
            setSettings(defaultSettings);
            onSettingsChange(defaultSettings);
          }}
          className="w-full"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
}