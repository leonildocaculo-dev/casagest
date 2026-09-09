import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/*
 * Hosts autorizados para o next/image.
 *
 * O host da API nao pode ser fixo aqui: em producao e o Render, em
 * desenvolvimento e o localhost. Deriva-se de NEXT_PUBLIC_API_URL, a mesma
 * variavel que resolveImageUrl() usa para montar os URLs /storage/..., para que
 * as duas nunca fiquem dessincronizadas. Um host em falta nesta lista faz o
 * next/image responder 400 e a imagem nao aparece.
 */
function hostPattern(rawUrl: string | undefined, pathname: string): RemotePattern[] {
  if (!rawUrl) return [];
  try {
    const url = new URL(rawUrl.replace(/\/api\/?$/, ''));
    return [{
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
      pathname,
    }];
  } catch {
    console.warn(`[next.config] URL invalido ignorado em remotePatterns: ${rawUrl}`);
    return [];
  }
}

const remotePatterns: RemotePattern[] = [
  // Host da API — Render em producao, localhost em desenvolvimento.
  ...hostPattern(process.env.NEXT_PUBLIC_API_URL, '/storage/**'),

  // Storage do Supabase, quando os ficheiros sao servidos de la em vez do disco
  // do contentor (que e efemero no Render).
  ...hostPattern(process.env.NEXT_PUBLIC_SUPABASE_URL, '/storage/v1/object/public/**'),

  // Fallback de resolveImageUrl() em src/lib/utils.ts.
  { protocol: 'https', hostname: 'images.unsplash.com' },

  // Desenvolvimento local, mesmo quando NEXT_PUBLIC_API_URL aponta noutra direccao.
  { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns },
};

export default nextConfig;
