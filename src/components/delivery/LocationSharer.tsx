
import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LocateFixed, Loader2 } from 'lucide-react';

export function LocationSharer() {
  const { user } = useAuth();
  const { position, error: geoError, startWatching, stopWatching } = useGeolocation();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isSharing) {
      startWatching();
    } else {
      stopWatching();
    }
    return () => stopWatching();
  }, [isSharing, startWatching, stopWatching]);

  const updateLocation = useCallback(async (currentPosition: { latitude: number; longitude: number; }) => {
    if (!user) return;
    setIsUpdating(true);
    const { error } = await supabase
      .from('delivery_partner_locations')
      .upsert({
        partner_id: user.id,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'partner_id' });

    if (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Location Error",
        description: "Could not share your location. Stopping sharing.",
        variant: "destructive"
      });
      setIsSharing(false);
    }
    setIsUpdating(false);
  }, [user, toast]);

  useEffect(() => {
    if (isSharing && position) {
      updateLocation(position);
    }
  }, [position, isSharing, updateLocation]);

  const handleToggleSharing = (checked: boolean) => {
    setIsSharing(checked);
    if (checked) {
        toast({
            title: "Location Sharing On",
            description: "Your location is now visible for active deliveries.",
        });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => updateLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => console.warn(`ERROR(${err.code}): ${err.message}`)
            );
        }
    } else {
        toast({
            title: "Location Sharing Off",
            description: "Your location is no longer being shared.",
        });
    }
  };
  
  if (geoError) {
    return (
        <Alert variant="destructive" className="my-4">
            <LocateFixed className="h-4 w-4" />
            <AlertTitle>Geolocation Error</AlertTitle>
            <AlertDescription>
                {geoError}. Please enable location services in your browser settings to share your location.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="flex items-center space-x-2 rounded-lg border p-4 bg-card shadow-sm">
      <Switch id="location-sharing" checked={isSharing} onCheckedChange={handleToggleSharing} disabled={isUpdating} />
      <Label htmlFor="location-sharing" className="flex-grow flex items-center cursor-pointer">
        Share My Location
        {isUpdating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
      </Label>
    </div>
  );
}
