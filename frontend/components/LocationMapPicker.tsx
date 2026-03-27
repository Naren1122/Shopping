"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface LocationMapPickerProps {
  initialCoordinates?: LocationCoordinates;
  onLocationSelect: (
    location: LocationCoordinates & { address: string },
  ) => void;
}

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export function LocationMapPicker({
  initialCoordinates,
  onLocationSelect,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<LocationCoordinates>(
    initialCoordinates || { lat: 27.7172, lng: 85.324 },
  );
  const [address, setAddress] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "BazarEcommerce/1.0",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }

      const data = await response.json();

      const parts = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb) parts.push(data.address.suburb);
      if (data.address?.city || data.address?.town || data.address?.village) {
        parts.push(
          data.address.city || data.address.town || data.address.village,
        );
      }
      if (data.address?.district) parts.push(data.address.district);

      return parts.length > 0
        ? parts.join(", ")
        : data.display_name || "Unknown location";
    },
    [],
  );

  const updateMapLocation = useCallback(
    async (lat: number, lng: number) => {
      if (mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16);

        try {
          const newAddress = await reverseGeocode(lat, lng);
          setAddress(newAddress);
          onLocationSelect({ lat, lng, address: newAddress });
        } catch (error) {
          console.error("Failed to reverse geocode:", error);
        }
      }
    },
    [reverseGeocode, onLocationSelect],
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import("leaflet");

        // Fix marker icons
        delete (
          L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
        )._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        if (!isMounted || !mapContainerRef.current) return;

        // Create map with zoom control at bottom right
        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([coordinates.lat, coordinates.lng], 16);

        // Position controls properly
        map.zoomControl.setPosition("bottomright");
        map.attributionControl.setPosition("bottomleft");

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "",
          maxZoom: 19,
        }).addTo(map);

        // Red marker at center
        const marker = L.marker([coordinates.lat, coordinates.lng], {
          draggable: true,
        }).addTo(map);

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;

        // Get initial address
        const initialAddress = await reverseGeocode(
          coordinates.lat,
          coordinates.lng,
        );
        setAddress(initialAddress);
        onLocationSelect({
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: initialAddress,
        });

        // Handle marker drag
        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          setCoordinates({ lat: pos.lat, lng: pos.lng });
          setIsLocating(true);

          try {
            const newAddress = await reverseGeocode(pos.lat, pos.lng);
            setAddress(newAddress);
            onLocationSelect({
              lat: pos.lat,
              lng: pos.lng,
              address: newAddress,
            });
          } catch (error) {
            console.error("Failed to reverse geocode:", error);
          } finally {
            setIsLocating(false);
          }
        });

        // Handle map click
        map.on("click", async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setCoordinates({ lat, lng });
          marker.setLatLng([lat, lng]);
          setIsLocating(true);

          try {
            const newAddress = await reverseGeocode(lat, lng);
            setAddress(newAddress);
            onLocationSelect({ lat, lng, address: newAddress });
          } catch (error) {
            console.error("Failed to reverse geocode:", error);
          } finally {
            setIsLocating(false);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        await updateMapLocation(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enable location access.");
        setIsLocating(false);
      },
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-rose-500" />
          <span className="font-medium text-sm">Select Delivery Location</span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span>Current</span>
        </button>
      </div>

      {/* Map Container */}
      <div
        className="relative w-full h-64 rounded-lg overflow-hidden"
        style={{ overflow: "hidden" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Address Display */}
      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
        <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
        <span className="text-sm text-gray-700">
          {address || "Click on map to select location"}
        </span>
      </div>

      <input type="hidden" name="latitude" value={coordinates.lat} />
      <input type="hidden" name="longitude" value={coordinates.lng} />
    </div>
  );
}
