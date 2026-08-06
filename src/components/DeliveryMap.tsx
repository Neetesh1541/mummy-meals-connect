import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Navigation, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LiveIndicator, LiveStatus } from '@/components/LiveIndicator';


interface DeliveryMapProps {
  deliveryPartnerId: string;
  destinationAddress?: string;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp?: string | null;
}

// Component to update the map view when location changes
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

// Custom delivery truck icon with animation
const createTruckIcon = () => new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-primary/30 rounded-full animate-ping"></div>
      <div class="absolute w-10 h-10 bg-primary/50 rounded-full animate-pulse"></div>
      <div class="relative w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-3 border-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    </div>
  `,
  className: 'bg-transparent border-0',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Destination marker
const createDestinationIcon = () => new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-secondary/40 rounded-full animate-pulse"></div>
      <div class="relative w-8 h-8 bg-gradient-to-br from-secondary to-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="white"/>
        </svg>
      </div>
    </div>
  `,
  className: 'bg-transparent border-0',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export function DeliveryMap({ deliveryPartnerId, destinationAddress }: DeliveryMapProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('connecting');
  const [tick, setTick] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const truckIcon = useMemo(() => createTruckIcon(), []);
  const destinationIcon = useMemo(() => createDestinationIcon(), []);

  const applyLocation = useCallback((lat: number, lng: number, updatedAt?: string | null) => {
    const loc = { latitude: Number(lat), longitude: Number(lng), timestamp: updatedAt ?? null };
    setLocation((prev) =>
      prev && prev.latitude === loc.latitude && prev.longitude === loc.longitude ? prev : loc
    );
    setLocationHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.latitude === loc.latitude && last.longitude === loc.longitude) return prev;
      return [...prev, loc].slice(-20);
    });
    setLastUpdate(updatedAt ? new Date(updatedAt) : new Date());
  }, []);

  const fetchLocation = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_partner_locations')
        .select('latitude, longitude, updated_at')
        .eq('partner_id', deliveryPartnerId)
        .maybeSingle();

      if (error) throw error;

      setFetchError(null);
      if (data) {
        applyLocation(data.latitude as number, data.longitude as number, data.updated_at);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      console.error('DeliveryMap: Error fetching location:', message);
      setFetchError(message);
    }
  }, [deliveryPartnerId, applyLocation]);


  // Keep the "updated Xs ago" label accurate.
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 5000);
    return () => clearInterval(t);
  }, []);

  // Realtime with polling fallback. While the tab is active we validate the
  // location frequently (4s fallback / 15s freshness check) and pause entirely
  // when the tab is hidden so we don't burn battery or quota.
  useEffect(() => {
    fetchLocation();

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let freshnessTimer: ReturnType<typeof setInterval> | null = null;

    const clear = (t: ReturnType<typeof setInterval> | null) => {
      if (t) clearInterval(t);
      return null;
    };

    const startPolling = () => {
      if (pollTimer) return;
      setLiveStatus('polling');
      pollTimer = setInterval(() => {
        if (document.visibilityState === 'visible') fetchLocation();
      }, 4000);
    };
    const stopPolling = () => {
      pollTimer = clear(pollTimer);
    };

    // Even on a healthy realtime channel, re-read periodically so a dropped
    // event never leaves a stale pin on the map.
    const startFreshnessChecks = () => {
      if (freshnessTimer) return;
      freshnessTimer = setInterval(() => {
        if (document.visibilityState === 'visible') fetchLocation();
      }, 15000);
    };

    const fallbackTimer = setTimeout(startPolling, 6000);

    const channel = supabase
      .channel(`live-delivery-${deliveryPartnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_partner_locations',
          filter: `partner_id=eq.${deliveryPartnerId}`,
        },
        (payload) => {
          const newData = payload.new as { latitude: number; longitude: number; updated_at: string };
          if (newData?.latitude && newData?.longitude) {
            applyLocation(newData.latitude, newData.longitude, newData.updated_at);
            setFetchError(null);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(fallbackTimer);
          stopPolling();
          setLiveStatus('live');
          startFreshnessChecks();
          fetchLocation();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          startPolling();
        }
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchLocation();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);

    return () => {
      clearTimeout(fallbackTimer);
      stopPolling();
      freshnessTimer = clear(freshnessTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
      supabase.removeChannel(channel);
    };
  }, [deliveryPartnerId, fetchLocation, applyLocation]);


  const secondsSinceUpdate = useMemo(() => {
    void tick;
    if (!lastUpdate) return null;
    return Math.max(0, Math.round((Date.now() - lastUpdate.getTime()) / 1000));
  }, [lastUpdate, tick]);

  const updatedAgo = useMemo(() => {
    if (secondsSinceUpdate === null) return undefined;
    return secondsSinceUpdate < 60
      ? `${secondsSinceUpdate}s ago`
      : `${Math.round(secondsSinceUpdate / 60)}m ago`;
  }, [secondsSinceUpdate]);

  const isStale = secondsSinceUpdate !== null && secondsSinceUpdate > 90;



  // Generate trail path from location history
  const trailPath = useMemo(() => {
    return locationHistory.map(loc => [loc.latitude, loc.longitude] as L.LatLngTuple);
  }, [locationHistory]);

  if (!location) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-card/50 p-8 text-center h-72 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative p-4 bg-primary/10 rounded-full">
            <Truck className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <p className="font-medium text-foreground">Locating delivery partner...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Live tracking will appear once location is shared
          </p>
        </div>
      </div>
    );
  }

  const position: L.LatLngExpression = [location.latitude, location.longitude];

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <LiveIndicator status={liveStatus} />
        {updatedAgo && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Updated {updatedAgo}</span>
          </div>
        )}
      </div>


      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          className="h-72 w-full"
          style={{ borderRadius: 'inherit' }}
        >
          <ChangeView center={position} zoom={16} />
          
          {/* Map tiles with better styling */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Trail path */}
          {trailPath.length > 1 && (
            <Polyline
              positions={trailPath}
              pathOptions={{
                color: 'hsl(24, 94%, 50%)',
                weight: 4,
                opacity: 0.6,
                dashArray: '10, 10',
              }}
            />
          )}

          {/* Accuracy circle */}
          <Circle
            center={position}
            radius={50}
            pathOptions={{
              color: 'hsl(24, 94%, 50%)',
              fillColor: 'hsl(24, 94%, 50%)',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />

          {/* Delivery truck marker */}
          <Marker position={position} icon={truckIcon} />
        </MapContainer>

        {/* Map overlay with info */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <Badge className="bg-background/90 backdrop-blur text-foreground border shadow-sm">
            <Navigation className="h-3 w-3 mr-1 text-primary" />
            Live Location
          </Badge>
        </div>
      </div>

      {/* Info footer */}
      <p className="text-xs text-center text-muted-foreground">
        📍 Your delivery partner's location updates in real-time
      </p>
    </div>
  );
}
