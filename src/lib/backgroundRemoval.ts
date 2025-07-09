import { pipeline, env } from '@huggingface/transformers';
import { resizeImageIfNeeded } from './imageUtils';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

export const removeBackground = async (imageElement: HTMLImageElement, onProgress: (progress: number) => void): Promise<Blob> => {
  try {
    onProgress(10);
    console.log('Starting background removal process...');
    
    // Use a better model for background removal
    onProgress(30);
    const segmenter = await pipeline('image-segmentation', 'Xenova/detr-resnet-50-panoptic', {
      device: 'webgpu',
    });
    
    onProgress(50);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Convert to higher quality for better segmentation
    const imageData = canvas.toDataURL('image/png', 1.0);
    
    onProgress(70);
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    onProgress(85);
    
    // Find the person/main subject mask
    let personMask = null;
    for (const segment of result) {
      if (segment.label && (
        segment.label.toLowerCase().includes('person') ||
        segment.label.toLowerCase().includes('human') ||
        segment.label.toLowerCase().includes('people')
      )) {
        personMask = segment.mask;
        break;
      }
    }
    
    // If no person found, use the largest mask
    if (!personMask && result.length > 0) {
      personMask = result.reduce((largest, current) => {
        const currentSize = current.mask ? current.mask.data.length : 0;
        const largestSize = largest.mask ? largest.mask.data.length : 0;
        return currentSize > largestSize ? current : largest;
      }).mask;
    }
    
    if (!personMask) {
      throw new Error('No suitable mask found for background removal');
    }
    
    onProgress(90);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask with improved algorithm
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply mask with smoothing
    for (let i = 0; i < personMask.data.length; i++) {
      const maskValue = personMask.data[i];
      // Keep the subject (high mask values) and remove background (low mask values)
      const alpha = Math.round(maskValue * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    onProgress(100);
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Background removal completed successfully');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};
