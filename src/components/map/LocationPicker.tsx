"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reverseGeocode, checkDeliveryAvailability, calculateDistance } from "@/lib/locationUtils";
import { restaurantDetails } from "@/data/menu";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem"
};

const center = {
  lat: restaurantDetails.latitude,
  lng: restaurantDetails.longitude
};

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number, lng: number, address: string, distanceKm: number, isValid: boolean }) => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  });

  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : center
  );
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{ distance: number, isValid: boolean } | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const updateLocationDetails = async (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    
    // Calculate distance from restaurant
    const distanceKm = calculateDistance(lat, lng, restaurantDetails.latitude, restaurantDetails.longitude);
    const isValid = checkDeliveryAvailability(distanceKm);
    
    setDistanceInfo({ distance: distanceKm, isValid });
    
    // Reverse Geocode
    const formattedAddress = await reverseGeocode(lat, lng);
    setAddress(formattedAddress);
    
    onLocationSelect({ lat, lng, address: formattedAddress, distanceKm, isValid });
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocationDetails(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocationDetails(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          mapRef.current.setZoom(16);
        }
        updateLocationDetails(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error fetching location", error);
        alert("Unable to fetch your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (loadError) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Map cannot be loaded right now. Please enter your address manually.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-forest text-forest hover:bg-forest-soft"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          Use Current Location
        </Button>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={markerPosition}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <Marker 
              position={markerPosition} 
              draggable={true} 
              onDragEnd={handleMarkerDragEnd}
              animation={google.maps.Animation.DROP}
            />
          </GoogleMap>
        ) : (
          <div className="w-full h-[300px] bg-muted flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {distanceInfo && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-start gap-2 ${distanceInfo.isValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {distanceInfo.isValid ? (
              <p>Location is within our {restaurantDetails.deliveryRadiusKm}km delivery radius (Distance: {distanceInfo.distance}km).</p>
            ) : (
              <p>Sorry, this location is {distanceInfo.distance}km away. We currently only deliver up to {restaurantDetails.deliveryRadiusKm}km.</p>
            )}
          </div>
        </div>
      )}

      {address && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Detected Address</label>
          <Input 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            className="bg-muted"
            readOnly
          />
        </div>
      )}
    </div>
  );
}
