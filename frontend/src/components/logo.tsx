'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark' | 'purple'; // light = white/gold text (for dark bg), dark = purple/gold text (for light bg)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  variant = 'light',
  size = 'md',
  showSlogan = true,
  className = '',
  href = '/',
}: LogoProps) {
  // Dimensions scale
  const sizeMap = {
    sm: { icon: 32, title: 'text-lg', slogan: 'text-[9px]' },
    md: { icon: 42, title: 'text-2xl', slogan: 'text-[10.5px]' },
    lg: { icon: 54, title: 'text-3xl', slogan: 'text-[12px]' },
    xl: { icon: 70, title: 'text-4xl', slogan: 'text-[14px]' },
  };

  const currentSize = sizeMap[size];

  // Colors based on background variant
  const outerHouseColor = variant === 'dark' ? '#3B0764' : '#FFFFFF';
  const innerGoldColor = '#F59E0B';
  const titleTextColor = variant === 'dark' ? 'text-purple-950 dark:text-white' : 'text-white';
  const sloganTextColor = variant === 'dark' ? 'text-purple-800 dark:text-amber-300' : 'text-amber-300';

  const logoContent = (
    <div className={`inline-flex items-center gap-3 group transition-transform hover:scale-[1.02] ${className}`}>
      {/* SVG Desenho da Casa (Vector Limpo com transparência) */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        {/* Telhado Exterior & Estrutura Base */}
        <path
          d="M50 8L8 42H20V88H80V42H92L50 8Z"
          fill={outerHouseColor}
        />
        {/* Chaminé */}
        <path
          d="M70 20H80V35L70 26V20Z"
          fill={outerHouseColor}
        />
        {/* Camada Interior em Arco Dourado (Chevron) */}
        <path
          d="M50 28L26 48H35V78H65V48H74L50 28Z"
          fill={innerGoldColor}
        />
        {/* Porta/Vão Central Interior */}
        <path
          d="M50 42L38 52V78H46V62C46 59.8 47.8 58 50 58C52.2 58 54 59.8 54 62V78H62V52L50 42Z"
          fill={outerHouseColor}
        />
      </svg>

      {/* Nome e Slogan Perfeitamente Alinhados */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight uppercase ${titleTextColor} ${currentSize.title}`}>
            Casa<span className="text-amber-400">Gest</span>
          </span>
        </div>
        {showSlogan && (
          <span className={`font-extrabold uppercase tracking-wider mt-1 whitespace-nowrap ${sloganTextColor} ${currentSize.slogan}`}>
            Gestão Inteligente de Imóveis
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
