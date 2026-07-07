"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// Fix leaflet marker icon issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export default function LocationPicker({ onLocationSelect }: { onLocationSelect: (latlng: {lat: number, lng: number}) => void }) {
  // Default to Indore coordinates roughly near Rau
  const defaultPosition = new L.LatLng(22.6391, 75.8048);
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const handleConfirm = () => {
    if (position) {
      onLocationSelect({ lat: position.lat, lng: position.lng });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
        },
        (err) => {
          console.error("Error getting location", err);
          alert("Could not get your location. Please click on the map.");
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Tap on the map to set delivery location</p>
        <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation}>
          <MapPin className="mr-2 h-4 w-4" /> Use Current Location
        </Button>
      </div>
      
      <div className="h-[300px] w-full rounded-md overflow-hidden border border-border relative z-0">
        <MapContainer 
          center={defaultPosition} 
          zoom={14} 
          scrollWheelZoom={false} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {position && (
        <div className="bg-forest/10 p-3 rounded-md border border-forest/20 flex justify-between items-center">
          <div className="text-sm font-medium text-forest">
            Location Selected
          </div>
          <Button type="button" onClick={handleConfirm} size="sm" className="bg-forest text-background hover:bg-forest/90">
            Confirm Location
          </Button>
        </div>
      )}
    </div>
  );
}
