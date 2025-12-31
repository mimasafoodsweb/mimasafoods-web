/**
 * Utility to load and convert images for PDF generation
 */

export class LogoLoader {
  /**
   * Convert image URL to base64 for jsPDF with compression
   */
  static async imageToBase64(imageUrl: string, maxWidth: number = 200, maxHeight: number = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate compressed dimensions
          let { width, height } = img;
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          // Set canvas size to compressed dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Draw compressed image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality (JPEG for smaller size)
          const base64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Get Mimasa logo as base64 with high resolution
   */
  static async getMimasaLogo(): Promise<string> {
    try {
      // Use JPG version from public folder with higher resolution
      const logoUrl = '/MimasaLogo.jpg';
      return await this.imageToBase64(logoUrl, 400, 400); // High resolution 400x400 for better quality
    } catch (error) {
      console.warn('Could not load JPG logo from public folder, trying PNG:', error);
      
      try {
        // Fallback to PNG version with high resolution
        const logoUrl = '/MimasaLogo.png';
        return await this.imageToBase64(logoUrl, 400, 400); // High resolution 400x400 for better quality
      } catch (fallbackError) {
        console.warn('Could not load any logo, using text fallback:', fallbackError);
        throw new Error('Logo not found in public folder');
      }
    }
  }

  /**
   * Create a text-based logo as fallback
   */
  static createTextLogo(): string {
    // Create a simple SVG logo as base64
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
        <rect width="120" height="40" fill="#8B4513" rx="5"/>
        <text x="60" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">
          MIMASA
        </text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }
}
