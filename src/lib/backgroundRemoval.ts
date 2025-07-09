const REMOVE_BG_API_KEY = 'mGNK8yHPVjvQdpCKwUVVKVcy';

export const removeBackground = async (imageElement: HTMLImageElement, onProgress: (progress: number) => void): Promise<Blob> => {
  try {
    onProgress(10);
    console.log('Starting background removal with Remove.bg API...');
    
    // Convert image to blob
    onProgress(20);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    onProgress(30);
    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image to blob'));
        },
        'image/png',
        1.0
      );
    });
    
    onProgress(50);
    console.log('Sending image to Remove.bg API...');
    
    // Prepare form data for Remove.bg API
    const formData = new FormData();
    formData.append('image_file', imageBlob);
    formData.append('size', 'auto');
    
    onProgress(60);
    
    // Call Remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData,
    });
    
    onProgress(80);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`);
    }
    
    onProgress(90);
    const resultBlob = await response.blob();
    
    onProgress(100);
    console.log('Background removal completed successfully with Remove.bg');
    return resultBlob;
    
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};
