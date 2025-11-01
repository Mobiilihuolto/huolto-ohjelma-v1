import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TypedSignatureProps {
  onSave: (signature: string) => void;
  existingSignature?: string;
  signatureType?: 'technician' | 'customer';
  defaultName?: string;
}

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', value: 'dancing-script' },
  { name: 'Allura', value: 'allura' },
  { name: 'Pacifico', value: 'pacifico' },
  { name: 'Great Vibes', value: 'great-vibes' },
];

export const TypedSignature: React.FC<TypedSignatureProps> = ({ 
  onSave,
  existingSignature,
  signatureType = 'technician',
  defaultName
}) => {
  const [name, setName] = useState('');
  const [selectedFont, setSelectedFont] = useState('dancing-script');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Esitäytä nimi tietokannasta - vain teknikko
  useEffect(() => {
    if (defaultName && signatureType === 'technician') {
      setName(defaultName);
    }
    // Asiakkaan allekirjoitus on aina tyhjä
  }, [defaultName, signatureType]);

  const generateSignature = async () => {
    if (!name.trim()) {
      console.error('Name is empty');
      return;
    }

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas not found');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not found');
        return;
      }

      // Set font size and style based on selected font (increased for better quality)
      const fontSize = 96;
      const fontFamily = SIGNATURE_FONTS.find(f => f.value === selectedFont)?.name || 'Dancing Script';
      
      // Wait for font to load
      try {
        await document.fonts.load(`${fontSize}px "${fontFamily}"`);
      } catch (fontError) {
        console.warn('Font loading failed, continuing anyway:', fontError);
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set font properties
      ctx.font = `${fontSize}px "${fontFamily}", cursive`;
      ctx.fillStyle = '#000000';
      ctx.textBaseline = 'middle';

      // Measure text to center it
      const metrics = ctx.measureText(name);
      const textWidth = metrics.width;
      const x = (canvas.width - textWidth) / 2;
      const y = canvas.height / 2;

      // Draw text
      ctx.fillText(name, x, y);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Verify the data URL is valid
      if (!dataURL || dataURL === 'data:,') {
        console.error('Failed to generate signature image');
        return;
      }

      // Call the onSave callback (ei tallenneta localStorage:een)
      onSave(dataURL);
    } catch (error) {
      console.error('Error generating signature:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Set canvas size with high resolution for better quality
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set large dimensions for high-quality signature (4x larger than before)
    canvas.width = 1600;
    canvas.height = 400;
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name-input">Kirjoita nimesi</Label>
        <Input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Esim. Matti Meikäläinen"
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-select">Valitse tyyli</Label>
        <Select value={selectedFont} onValueChange={setSelectedFont}>
          <SelectTrigger id="font-select">
            <SelectValue placeholder="Valitse käsialatyyli" />
          </SelectTrigger>
          <SelectContent>
            {SIGNATURE_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span className={`font-${font.value}`}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {name.trim() && (
        <div className="space-y-2">
          <Label>Esikatselu</Label>
          <div className="w-full h-32 border-2 border-border rounded-md bg-white flex items-center justify-center p-4">
            <span 
              className={`font-${selectedFont} text-4xl`}
              style={{ 
                fontFamily: `"${SIGNATURE_FONTS.find(f => f.value === selectedFont)?.name}", cursive`
              }}
            >
              {name}
            </span>
          </div>
        </div>
      )}

      {/* Hidden canvas for generating the signature image */}
      <canvas
        ref={canvasRef}
        style={{ 
          position: 'absolute',
          visibility: 'hidden',
          width: '800px', 
          height: '200px',
          pointerEvents: 'none'
        }}
      />

      <Button
        type="button"
        onClick={generateSignature}
        disabled={!name.trim() || isGenerating}
        className="w-full"
      >
        <Check className="h-4 w-4 mr-2" />
        {isGenerating ? 'Tallennetaan...' : 'Käytä tätä allekirjoitusta'}
      </Button>
    </div>
  );
};
