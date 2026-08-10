import { BillRecord } from '../types';

/**
 * Compresses a base64 image data URL to a lightweight JPEG data URL
 * to avoid exceeding browser localStorage limits (5MB total limit).
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 600,
  maxHeight = 800,
  quality = 0.6
): Promise<string> {
  if (!dataUrl) return dataUrl;

  // If it's a PDF, generate a lightweight SVG document representation
  if (dataUrl.startsWith('data:application/pdf')) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="460" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%230284c7" font-family="sans-serif" font-size="20" font-weight="bold">PDF Bill Document</text><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="13">Verified Statement</text></svg>';
  }

  // If already under 40KB or an SVG, return as is
  if (dataUrl.length < 40000 || dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Safely saves bill records array to localStorage with quota protection fallback.
 */
export function safeSaveBillsToLocalStorage(storageKey: string, bills: BillRecord[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(bills));
  } catch (primaryErr) {
    console.warn('Primary localStorage.setItem failed due to quota limit. Sanitizing large image data...', primaryErr);
    try {
      // Sanitize bills by replacing any massive image data URLs with compact SVG placeholders
      const sanitized = bills.map((b) => {
        if (b.imageUrl && b.imageUrl.length > 25000) {
          const isWater = b.utilityType === 'water';
          const title = isWater ? 'Water Bill (NWC)' : 'Electricity Bill (SEC)';
          const color = isWater ? '%230891b2' : '%23d97706';
          const bg = isWater ? '%23ecfeff' : '%23fffbeb';
          return {
            ...b,
            imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="${bg}"/><rect x="20" y="20" width="360" height="460" rx="12" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><text x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-family="sans-serif" font-size="18" font-weight="bold">${title}</text><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="12">Saved Record #${b.id}</text></svg>`,
          };
        }
        return b;
      });
      localStorage.setItem(storageKey, JSON.stringify(sanitized));
    } catch (fallbackErr) {
      console.error('Failed to save sanitized bills to localStorage:', fallbackErr);
    }
  }
}
