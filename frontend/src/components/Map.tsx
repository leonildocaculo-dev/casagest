"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Correção para ícones do Leaflet no Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  latitude: number | null;
  longitude: number | null;
  tipo: string;
}

interface MapProps {
  imoveis: Imovel[];
  center?: [number, number];
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({ imoveis, center = [38.7223, -9.1393], zoom = 12 }: MapProps) {
  // Filtrar imóveis que têm coordenadas válidas
  const imoveisNoMapa = imoveis.filter((i) => i.latitude !== null && i.longitude !== null);

  return (
    <div className="h-125 w-full rounded-md border overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {imoveisNoMapa.map((imovel) => (
          <Marker 
            key={imovel.id} 
            position={[imovel.latitude as number, imovel.longitude as number]}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm">{imovel.titulo}</span>
                <span className="text-muted-foreground text-xs">{imovel.tipo}</span>
                <span className="font-bold text-primary mt-1">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(imovel.preco))}
                </span>
                <Link href={`/imoveis/${imovel.id}`} className="text-xs text-blue-600 hover:underline mt-2">
                  Ver detalhes
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
