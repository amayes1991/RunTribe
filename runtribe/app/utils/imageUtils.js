/**
 * Constructs the full URL for an image stored on the API server
 * @param {string} imageUrl - The relative image URL from the API (e.g., "/uploads/groups/filename.jpg")
 * @returns {string} - The full URL to the image
 */
export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // If the URL is already absolute, return it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Construct the full URL using the API base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
  return `${apiUrl}${imageUrl}`;
}
