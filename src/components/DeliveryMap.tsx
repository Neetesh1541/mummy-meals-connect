
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Truck } from 'lucide-react';

// IMPORTANT: Add your Mapbox public token here.
// You can get one from https://www.mapbox.com/
// For production, it's best to store this as an environment variable.
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hvcnRzZWFyY2giLCJhIjoiY2x4b3k0eHlwMGh2eTJrcW5uNjlua2M5aSJ9.7x_252nB1R-2QpT21gQ9qA'; // Replace with your token

interface DeliveryMapProps {
  deliveryPartnerId: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

export function DeliveryMap({ deliveryPartnerId }: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from('delivery_partner_locations')
        .select('latitude, longitude')
        .eq('partner_id', deliveryPartnerId)
        .single();
      
      if (data) {
        setLocation({ latitude: Number(data.latitude), longitude: Number(data.longitude) });
      } else if (error) {
        console.error("Error fetching initial location:", error.message);
      }
    };
    fetchInitialLocation();
  }, [deliveryPartnerId]);

  useEffect(() => {
    if (!map.current && mapContainer.current && location) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [location.longitude, location.latitude],
        zoom: 14
      });
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }
  }, [location]);

  useEffect(() => {
    if (map.current && location) {
      map.current.flyTo({ center: [location.longitude, location.latitude], zoom: 15 });
      if (marker.current) {
        marker.current.setLngLat([location.longitude, location.latitude]);
      } else {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4h-8v-4h-4V9Z"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
            </div>
          </div>
        `;

        marker.current = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current);
      }
    }
  }, [location, map.current]);

  useEffect(() => {
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
          const newLocation = payload.new as { latitude: number, longitude: number };
          if(newLocation.latitude && newLocation.longitude) {
            setLocation({ latitude: Number(newLocation.latitude), longitude: Number(newLocation.longitude) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deliveryPartnerId]);
  
  if (!mapboxgl.accessToken || mapboxgl.accessToken.includes("pk.eyJ1Ijoic2hvcnRzZWFyY2giLCJhIjoiY2x4b3k0eHlwMGh2eTJrcW5uNjlua2M5aSJ9.7x_252nB1R-2QpT21gQ9qA")) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center">
        <p>Mapbox token is not configured.</p>
        <p className="text-sm text-muted-foreground">Please ask the admin to configure it.</p>
      </div>
    );
  }

  if (!location) {
     return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center flex items-center justify-center h-64">
          <Truck className="h-6 w-6 mr-2 animate-pulse" />
          <p className="text-muted-foreground">Waiting for delivery partner's location...</p>
        </div>
      );
  }

  return <div ref={mapContainer} className="h-64 w-full rounded-lg" />;
}
