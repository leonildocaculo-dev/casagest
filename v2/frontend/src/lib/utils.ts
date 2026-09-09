import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(caminho: string | null | undefined): string {
  if (!caminho) return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  if (caminho.startsWith('http://') || caminho.startsWith('https://')) return caminho;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
  return `${baseUrl}/storage/${caminho}`;
}
