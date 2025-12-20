// Utility to retrieve product image URLs from src/assets/product_images
// Uses Vite's import.meta.glob to eagerly import URLs for all PNGs

const images = import.meta.glob('../assets/product_images/*.{png,PNG}', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

export function getProductImageUrl(name: string): string | undefined {
  const clean = name?.trim() || '';
  if (!clean) return undefined;
  const candidates = [`${clean}.png`, `${clean}.PNG`];
  const keys = Object.keys(images);
  for (const fileName of candidates) {
    const matchKey = keys.find((k) => k.endsWith(`/product_images/${fileName}`));
    if (matchKey) return images[matchKey];
  }
  return undefined;
}
