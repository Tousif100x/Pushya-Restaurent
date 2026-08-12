"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { MapPin, Navigation, Search, Map as MapIcon, Loader2, Check, X } from "lucide-react";
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
  height: "100%",
  minHeight: "260px",
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

type LocationMode = "current" | "search" | "map";

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

  const [activeMode, setActiveMode] = useState<LocationMode>("current");
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

  // Fullscreen map modal state for mobile/desktop map picker
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempMarkerPos, setTempMarkerPos] = useState(markerPosition);

  const mapRef = useRef<google.maps.Map | null>(null);
  const modalMapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onModalMapLoad = useCallback((map: google.maps.Map) => {
    modalMapRef.current = map;
  }, []);

  const updateLocationDetails = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPosition({ lat, lng });
      setTempMarkerPos({ lat, lng });

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

  const handleModalMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setTempMarkerPos({ lat, lng });
    }
  };

  const handleModalMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setTempMarkerPos({ lat, lng });
    }
  };

  const handleUseCurrentLocation = () => {
    setActiveMode("current");
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

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);
        }
        updateLocationDetails(lat, lng);
      }
    }
  };

  const handleConfirmModalLocation = () => {
    updateLocationDetails(tempMarkerPos.lat, tempMarkerPos.lng);
    setIsMapModalOpen(false);
  };

  // Initial trigger for location if none selected
  useEffect(() => {
    if (!initialLat && !initialLng && !address && isLoaded) {
      handleUseCurrentLocation();
    }
  }, [isLoaded]);

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-xs sm:text-sm">
        Map cannot be loaded. Please enter your address manually.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* ─── Exactly 3 Location Options ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          type="button"
          variant={activeMode === "current" ? "default" : "outline"}
          className={`h-11 text-xs sm:text-sm font-semibold gap-1.5 justify-center w-full px-2 ${
            activeMode === "current"
              ? "bg-forest hover:bg-forest/90 text-white shadow-sm"
              : "border-forest/30 text-forest hover:bg-forest/5"
          }`}
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Navigation className="w-4 h-4 shrink-0 text-amber-500" />
          )}
          <span className="truncate">📍 Current Location</span>
        </Button>

        <Button
          type="button"
          variant={activeMode === "search" ? "default" : "outline"}
          className={`h-11 text-xs sm:text-sm font-semibold gap-1.5 justify-center w-full px-2 ${
            activeMode === "search"
              ? "bg-forest hover:bg-forest/90 text-white shadow-sm"
              : "border-forest/30 text-forest hover:bg-forest/5"
          }`}
          onClick={() => setActiveMode("search")}
        >
          <Search className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">🔎 Search Address</span>
        </Button>

        <Button
          type="button"
          variant={activeMode === "map" ? "default" : "outline"}
          className={`h-11 text-xs sm:text-sm font-semibold gap-1.5 justify-center w-full px-2 ${
            activeMode === "map" || isMapModalOpen
              ? "bg-forest hover:bg-forest/90 text-white shadow-sm"
              : "border-forest/30 text-forest hover:bg-forest/5"
          }`}
          onClick={() => {
            setActiveMode("map");
            setTempMarkerPos(markerPosition);
            setIsMapModalOpen(true);
          }}
        >
          <MapIcon className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">🗺️ Pick on Map</span>
        </Button>
      </div>

      {/* ─── Mode 2: Google Places Autocomplete Search Input ─── */}
      {activeMode === "search" && (
        <div className="space-y-2 bg-forest/5 p-3 rounded-lg border border-forest/20">
          <label className="text-xs font-bold uppercase tracking-wider text-forest block">
            Search Place or Landmark (e.g., Medicaps University, Rau Circle)
          </label>
          {isLoaded ? (
            <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Type address or place name..."
                  className="pl-9 bg-white border-forest/30 text-sm h-11 focus:ring-forest"
                />
              </div>
            </Autocomplete>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading places search...
            </div>
          )}
        </div>
      )}

      {/* ─── Inline Preview Map ─── */}
      <div className="relative border border-border rounded-lg overflow-hidden h-[240px] sm:h-[300px] w-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={markerPosition}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              gestureHandling: "greedy", // Enables one-finger panning on mobile screens
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
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Mobile tap map overlay hint */}
        <button
          type="button"
          onClick={() => {
            setActiveMode("map");
            setTempMarkerPos(markerPosition);
            setIsMapModalOpen(true);
          }}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-forest text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-md border border-forest/20 flex items-center gap-1.5 z-10"
        >
          <MapIcon className="w-3.5 h-3.5" /> Fullscreen Map
        </button>
      </div>

      {/* ─── Delivery Radius Distance Validation Card ─── */}
      {distanceInfo && (
        <div
          className={`p-3 rounded-lg text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
            distanceInfo.isValid
              ? "bg-green-50 text-green-800 border border-green-300"
              : "bg-red-50 text-red-800 border border-red-300"
          }`}
        >
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {distanceInfo.isValid ? (
              <p className="font-semibold">
                ✓ Within our {deliveryRadiusKm}km delivery area ({distanceInfo.distance}km away)
              </p>
            ) : (
              <p className="font-semibold">
                ✗ {distanceInfo.distance}km away — We deliver up to {deliveryRadiusKm}km only.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Readable Reverse-Geocoded Address Preview ─── */}
      {address && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-forest block">
            Detected Street Address
          </label>
          <div className="p-3 bg-muted/60 rounded-lg border border-border text-xs sm:text-sm font-medium text-foreground leading-relaxed">
            {address}
          </div>
        </div>
      )}

      {/* ─── Fullscreen / Near-Fullscreen Map Picker Modal (Pick on Map) ─── */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-background rounded-t-2xl sm:rounded-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden shadow-2xl border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-forest text-white shrink-0">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base sm:text-lg">Pick Location on Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subheader hint */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 font-medium shrink-0 flex items-center justify-between">
              <span>Drag pin or tap anywhere with 1 finger to set exact building</span>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  zoom={17}
                  center={tempMarkerPos}
                  onLoad={onModalMapLoad}
                  onClick={handleModalMapClick}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    gestureHandling: "greedy", // Greedy one-finger panning
                  }}
                >
                  <Marker
                    position={tempMarkerPos}
                    draggable={true}
                    onDragEnd={handleModalMarkerDragEnd}
                    animation={google.maps.Animation.DROP}
                  />
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Modal Footer with Confirm Location Button */}
            <div className="p-4 bg-background border-t border-border shrink-0 space-y-3">
              <Button
                type="button"
                onClick={handleConfirmModalLocation}
                className="w-full h-12 text-base font-bold bg-forest hover:bg-forest/90 text-white rounded-xl shadow-lg gap-2"
              >
                <Check className="w-5 h-5 text-gold" /> Confirm Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
