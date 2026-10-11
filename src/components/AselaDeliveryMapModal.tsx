import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, X, Navigation, Check, Clock, AlertTriangle, Building2, Layers } from 'lucide-react';
import { TimeCafeLogo } from './TimeCafeLogo';

interface AselaDeliveryMapModalProps {
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (location: { address: string; lat: number; lng: number; distanceKm: number }) => void;
  onClose: () => void;
}

// User-specified exact coordinates
export const TIME_CAFE_COORDS: [number, number] = [7.954428, 39.132322]; // 7°57'15.94"N 39°07'56.36"E
export const ASSELA_RAS_HOTEL_COORDS: [number, number] = [7.964356, 39.132628]; // 7°57'51.68"N 39°07'57.46"E
export const ARSI_UNIVERSITY_MAIN_CAMPUS_COORDS: [number, number] = [7.988200, 39.143894]; // 7°59'17.52"N 39°08'38.02"E

// Strict bounds restricting map ONLY to Assela town (comfortably covering Arsi Univ Main Campus to the north)
const ASSELA_SOUTH_WEST: [number, number] = [7.9300, 39.1000];
const ASSELA_NORTH_EAST: [number, number] = [8.0100, 39.1700];

const ASELA_LANDMARKS = [
  {
    name: 'Arsi University Main Campus',
    lat: ARSI_UNIVERSITY_MAIN_CAMPUS_COORDS[0],
    lng: ARSI_UNIVERSITY_MAIN_CAMPUS_COORDS[1],
    desc: 'Main Campus (7°59\'17.52"N 39°08\'38.02"E), Student Dorms & Faculty Gates',
  },
  {
    name: 'Assela Ras Hotel',
    lat: ASSELA_RAS_HOTEL_COORDS[0],
    lng: ASSELA_RAS_HOTEL_COORDS[1],
    desc: 'Main road, central hotel & landmark',
  },
  {
    name: 'Time Cafe & Pizzeria HQ',
    lat: TIME_CAFE_COORDS[0],
    lng: TIME_CAFE_COORDS[1],
    desc: 'Our kitchen & counter location',
  },
  {
    name: 'Asela Stadium & Youth Center',
    lat: 7.9535,
    lng: 39.1255,
    desc: 'Stadium zone & sport complex',
  },
  {
    name: 'Arsi Referral Hospital',
    lat: 7.9592,
    lng: 39.1205,
    desc: 'Hospital main gate & emergency',
  },
  {
    name: 'Piazza / Commercial Center',
    lat: 7.9555,
    lng: 39.1310,
    desc: 'Town center, banks & shops',
  },
  {
    name: 'Robe Bus Station Gate',
    lat: 7.9660,
    lng: 39.1310,
    desc: 'Northern terminal exit',
  },
  {
    name: 'Chilalo / Gonde Road',
    lat: 7.9490,
    lng: 39.1180,
    desc: 'South Asela residential area',
  },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function isWithinAssela(lat: number, lng: number): boolean {
  return (
    lat >= ASSELA_SOUTH_WEST[0] &&
    lat <= ASSELA_NORTH_EAST[0] &&
    lng >= ASSELA_SOUTH_WEST[1] &&
    lng <= ASSELA_NORTH_EAST[1]
  );
}

export const AselaDeliveryMapModal: React.FC<AselaDeliveryMapModalProps> = ({
  initialLat,
  initialLng,
  onSelectLocation,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Satellite view toggle state
  const [isSatellite, setIsSatellite] = useState<boolean>(true);

  // Default to Assela Ras Hotel or passed coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || ASSELA_RAS_HOTEL_COORDS[0],
    lng: initialLng || ASSELA_RAS_HOTEL_COORDS[1],
  });
  const [selectedLandmark, setSelectedLandmark] = useState<string>('Assela Ras Hotel');
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState<boolean>(false);

  const distance = calculateDistanceKm(
    TIME_CAFE_COORDS[0],
    TIME_CAFE_COORDS[1],
    currentCoords.lat,
    currentCoords.lng
  );
  const estMins = Math.max(10, Math.round(10 + distance * 6));

  const submitLocation = (name: string, lat: number, lng: number, dist: number) => {
    const formattedAddress = `${name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    onSelectLocation({
      address: formattedAddress,
      lat,
      lng,
      distanceKm: dist,
    });
    onClose();
  };

  // Toggle map layer between Satellite and Streets
  const setMapTileLayer = (map: L.Map, satellite: boolean) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (satellite) {
      // High-resolution Esri Satellite Tiles
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Imagery &copy; Esri &mdash; Assela High Resolution Satellite',
          maxZoom: 18,
        }
      );
      satLayer.addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      // Clean OpenStreetMap Street Tiles
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors (Assela, Ethiopia)',
          maxZoom: 18,
        }
      );
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const asselaBounds = L.latLngBounds(
      [ASSELA_SOUTH_WEST[0], ASSELA_SOUTH_WEST[1]],
      [ASSELA_NORTH_EAST[0], ASSELA_NORTH_EAST[1]]
    );

    // Custom pins for Time Cafe and Customer delivery drop-off
    const cafePin = L.divIcon({
      className: 'custom-cafe-pin',
      html: `<div style="background-color: #ea580c; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.7); font-size: 18px;">🍕</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const rasHotelPin = L.divIcon({
      className: 'custom-hotel-pin',
      html: `<div style="background-color: #8b5cf6; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.7); font-size: 16px;">🏨</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const userDeliveryPin = L.divIcon({
      className: 'custom-user-pin',
      html: `<div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.8); font-size: 18px;">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Initialize Map strictly constrained to Assela
    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 15,
      minZoom: 13.5, // Strict restriction: cannot zoom out of Assela
      maxZoom: 18,
      maxBounds: asselaBounds, // Strict restriction: cannot pan outside Assela
      maxBoundsViscosity: 1.0, // 100% hard wall bounding
    });
    mapInstanceRef.current = map;

    // Apply default Satellite tiles
    setMapTileLayer(map, true);

    // Visual Assela Delivery Zone circle/boundary
    L.circle([7.9580, 39.1290], {
      radius: 3200,
      color: '#ea580c',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#ea580c',
      fillOpacity: 0.08,
    }).addTo(map);

    // Marker for Time Cafe HQ
    L.marker(TIME_CAFE_COORDS, { icon: cafePin })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <b style="color: #ea580c;">🍕 Time Cafe & Pizzeria</b><br/>
          <span style="font-size: 11px; color: #334155;">7°57'15.94"N 39°07'56.36"E</span><br/>
          <span style="font-size: 12px; font-weight: 600;">Main Kitchen & Dispatch</span>
        </div>`
      );

    // Marker for Assela Ras Hotel
    L.marker(ASSELA_RAS_HOTEL_COORDS, { icon: rasHotelPin })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <b style="color: #8b5cf6;">🏨 Assela Ras Hotel</b><br/>
          <span style="font-size: 11px; color: #334155;">7°57'51.68"N 39°07'57.46"E</span><br/>
          <span style="font-size: 12px; font-weight: 600;">Central Landmark (~1.1 km)</span>
        </div>`
      );

    // Draggable delivery marker
    const deliveryMarker = L.marker([currentCoords.lat, currentCoords.lng], {
      icon: userDeliveryPin,
      draggable: true,
    }).addTo(map);
    markerRef.current = deliveryMarker;

    const updateMarkerPosition = (lat: number, lng: number, landmarkName?: string) => {
      if (!isWithinAssela(lat, lng)) {
        setOutOfBoundsWarning(true);
        setTimeout(() => setOutOfBoundsWarning(false), 3500);
        return;
      }
      setOutOfBoundsWarning(false);
      setCurrentCoords({ lat, lng });
      setSelectedLandmark(landmarkName || `Assela Delivery Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      deliveryMarker.setLatLng([lat, lng]);
    };

    deliveryMarker.on('dragend', () => {
      const pos = deliveryMarker.getLatLng();
      updateMarkerPosition(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      updateMarkerPosition(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleToggleSatellite = () => {
    if (!mapInstanceRef.current) return;
    const nextState = !isSatellite;
    setIsSatellite(nextState);
    setMapTileLayer(mapInstanceRef.current, nextState);
  };

  const handleSelectLandmark = (lm: typeof ASELA_LANDMARKS[0]) => {
    setSelectedLandmark(lm.name);
    setCurrentCoords({ lat: lm.lat, lng: lm.lng });
    setOutOfBoundsWarning(false);

    if (markerRef.current) {
      markerRef.current.setLatLng([lm.lat, lm.lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lm.lat, lm.lng], 16);
    }
  };

  const handleConfirm = () => {
    submitLocation(selectedLandmark, currentCoords.lat, currentCoords.lng, distance);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[720px]">
        {/* Header - Always visible at top */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <TimeCafeLogo size={38} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Assela Delivery Map</h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  Assela Only
                </span>
                {isSatellite && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span>🛰️ Satellite Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Select your area in Assela or click directly on satellite buildings &amp; roads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Satellite / Street Switcher */}
            <button
              type="button"
              onClick={handleToggleSatellite}
              className={`text-xs px-2.5 sm:px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                isSatellite
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle between Satellite Imagery and Street Map"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isSatellite ? '🛰️ Satellite' : '🗺️ Street'}</span>
            </button>

            {/* Top Direct Submit Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Submit Location</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Out of Bounds Warning Notification */}
        {outOfBoundsWarning && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-xs text-amber-300 font-semibold shrink-0 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Delivery is strictly limited to Assela town limits. Pin kept within Assela!</span>
          </div>
        )}

        {/* Quick Landmark Preset Selector */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              <span>Popular Areas in Assela (Click to select):</span>
            </span>
            <span className="text-[11px] text-orange-400 font-semibold">
              Tap area &amp; click Submit below
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1.5">
            {ASELA_LANDMARKS.map((lm) => {
              const isSelected = selectedLandmark === lm.name;
              return (
                <button
                  key={lm.name}
                  type="button"
                  onClick={() => handleSelectLandmark(lm)}
                  className={`text-xs px-3 py-1.5 rounded-xl shrink-0 font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-orange-500 border-orange-500 text-white font-bold shadow-md shadow-orange-500/30 ring-2 ring-orange-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {lm.name.includes('Hotel') ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : lm.name.includes('Cafe') ? (
                    <span>🍕</span>
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  <span>{lm.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Leaflet Map Container */}
        <div className="flex-1 min-h-[220px] relative w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full min-h-[220px]" />

          {/* Floating Live Coordinates & ETA Pill */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-2xl shadow-xl text-xs space-y-0.5 pointer-events-none">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>{selectedLandmark}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-orange-400 font-semibold">~{distance} km</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-emerald-400" /> ~{estMins} min delivery
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Submission Bar - Guaranteed to be visible with shrink-0 */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto text-xs space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-sm">{selectedLandmark}</span>
            </div>
            <div className="text-slate-400 text-xs flex items-center gap-2">
              <span className="font-mono text-slate-300">
                {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
              </span>
              <span>•</span>
              <span className="text-orange-400 font-semibold">
                Distance: {distance} km from Time Cafe
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Use This Delivery Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
