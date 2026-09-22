import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BACKEND_BASE_URL } from "@/lib/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(caminho: string | null | undefined): string {
  if (!caminho) return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  if (caminho.startsWith('http://') || caminho.startsWith('https://')) return caminho;
  return `${BACKEND_BASE_URL}/storage/${caminho}`;
}
