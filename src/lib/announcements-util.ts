/**
 * Utility functions for announcements image parsing and formatting
 */

export function extractAnnouncementImage(content: string = ""): { imageUrl: string; cleanContent: string } {
  const match = content.match(/<!--\s*image:\s*([^\s>]+)\s*-->/);
  if (match) {
    const imageUrl = match[1];
    const cleanContent = content.replace(/<!--\s*image:\s*[^\s>]+\s*-->\n*/, "").trim();
    return { imageUrl, cleanContent };
  }
  return { imageUrl: "", cleanContent: content };
}

export function formatAnnouncementContent(content: string, imageUrl?: string): string {
  const clean = content.replace(/<!--\s*image:\s*[^\s>]+\s*-->\n*/, "").trim();
  if (imageUrl && imageUrl.trim()) {
    return `<!-- image: ${imageUrl.trim()} -->\n\n${clean}`;
  }
  return clean;
}
