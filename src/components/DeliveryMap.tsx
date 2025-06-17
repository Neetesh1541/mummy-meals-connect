
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Truck } from 'lucide-react';

interface DeliveryMapProps {
  deliveryPartnerId: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

// A component to update the map view when location changes
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const truckIcon = new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      <div class="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4h-8v-4h-4V9Z"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
      </div>
    </div>
  `,
  className: 'bg-transparent border-0',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export function DeliveryMap({ deliveryPartnerId }: DeliveryMapProps) {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      console.log('Fetching initial location for partner:', deliveryPartnerId);
      const { data, error } = await supabase
        .from('delivery_partner_locations')
        .select('latitude, longitude')
        .eq('partner_id', deliveryPartnerId)
        .single();
      
      if (data) {
        console.log('Initial location found:', data);
        setLocation({ latitude: Number(data.latitude), longitude: Number(data.longitude) });
      } else if (error) {
        console.error("Error fetching initial location:", error.message);
      }
    };
    fetchInitialLocation();
  }, [deliveryPartnerId]);

  useEffect(() => {
    console.log('Setting up location subscription for partner:', deliveryPartnerId);
    const channel = supabase
      .channel(`delivery-location-${deliveryPartnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_partner_locations',
          filter: `partner_id=eq.${deliveryPartnerId}`,
        },
        (payload) => {
          console.log('Location update received:', payload);
          const newLocation = payload.new as { latitude: number, longitude: number };
          if(newLocation.latitude && newLocation.longitude) {
            setLocation({ latitude: Number(newLocation.latitude), longitude: Number(newLocation.longitude) });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to location updates for partner ${deliveryPartnerId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Location subscription error for partner ${deliveryPartnerId}:`, err);
        }
      });

    return () => {
      console.log(`Cleaning up location subscription for partner ${deliveryPartnerId}`);
      supabase.removeChannel(channel);
    };
  }, [deliveryPartnerId]);
  
  if (!location) {
     return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center flex items-center justify-center h-64">
          <Truck className="h-6 w-6 mr-2 animate-pulse" />
          <p className="text-muted-foreground">Waiting for delivery partner's location...</p>
        </div>
      );
  }

  const position: L.LatLngExpression = [location.latitude, location.longitude];

  return (
    <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-64 w-full rounded-lg">
      <ChangeView center={position} zoom={15} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={truckIcon} />
    </MapContainer>
  );
}
