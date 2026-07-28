"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reverseGeocode,
  checkDeliveryAvailability,
  calculateDistance,
  getRestaurantCoordinates,
} from "@/lib/locationUtils";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem",
};

interface RestaurantSettings {
  latitude?: number;
  longitude?: number;
  deliveryRadiusKm?: number;
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    distanceKm: number;
    isValid: boolean;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  settings?: RestaurantSettings;
}

export function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  settings,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const restaurantCoords = getRestaurantCoordinates(settings);
  const deliveryRadiusKm = settings?.deliveryRadiusKm ?? 4;

  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng }
      : restaurantCoords
  );
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    isValid: boolean;
  } | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const updateLocationDetails = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPosition({ lat, lng });

      const distanceKm = calculateDistance(
        lat,
        lng,
        restaurantCoords.lat,
        restaurantCoords.lng
      );
      const isValid = checkDeliveryAvailability(distanceKm, deliveryRadiusKm);
      setDistanceInfo({ distance: distanceKm, isValid });

      const formattedAddress = await reverseGeocode(lat, lng);
      setAddress(formattedAddress);

      onLocationSelect({ lat, lng, address: formattedAddress, distanceKm, isValid });
    },
    [restaurantCoords, deliveryRadiusKm, onLocationSelect]
  );

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) updateLocationDetails(e.latLng.lat(), e.latLng.lng());
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) updateLocationDetails(e.latLng.lat(), e.latLng.lng());
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
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        Map cannot be loaded. Please enter your address manually.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 border-forest text-forest hover:bg-forest-soft"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        Use Current Location
      </Button>

      <div className="relative border border-border rounded-lg overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={markerPosition}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{ disableDefaultUI: true, zoomControl: true }}
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
        <div
          className={`p-3 rounded-lg text-sm font-medium flex items-start gap-2 ${
            distanceInfo.isValid
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {distanceInfo.isValid ? (
              <p>
                ✓ Within our {deliveryRadiusKm}km delivery area (
                {distanceInfo.distance}km away)
              </p>
            ) : (
              <p>
                ✗ {distanceInfo.distance}km away — We deliver up to {deliveryRadiusKm}
                km only.
              </p>
            )}
          </div>
        </div>
      )}

      {address && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Detected Address</label>
          <Input value={address} className="bg-muted" readOnly />
        </div>
      )}
    </div>
  );
}
