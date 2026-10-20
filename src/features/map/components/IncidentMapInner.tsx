"use client";

import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Globe2, MapPinned } from "lucide-react";
import { Priority, RequestStatus } from "@/types";
import { Button, Card } from "@/components/ui";
import { RequestDetailSheet } from "@/features/admin/components/table/RequestDetailSheet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IncidentPin = any;

interface IncidentMapInnerProps {
  incidents: IncidentPin[];
}

const KENYA_BOUNDS: L.LatLngBoundsExpression = [
  [-5.2, 33.5],
  [5.3, 42.3],
];
const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];
const KENYA_CENTER: L.LatLngExpression = [0.2, 37.9];
const WORLD_CENTER: L.LatLngExpression = [20, 0];
const KENYA_MIN_ZOOM = 5;
const WORLD_MIN_ZOOM = 2;
const MAX_ZOOM = 18;

export default function IncidentMapInner({ incidents }: IncidentMapInnerProps) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markersLayerRef = React.useRef<L.LayerGroup | null>(null);

  const [selectedIncident, setSelectedIncident] = React.useState<IncidentPin | null>(null);
  const [filterPriority, setFilterPriority] = React.useState<string>("ALL");
  const [showWorld, setShowWorld] = React.useState(false);

  const getMarkerColor = (priority: Priority, status: RequestStatus) => {
    if (status === RequestStatus.RESOLVED) return "#10b981"; 
    if (priority === Priority.URGENT) return "#ef4444";     
    if (priority === Priority.HIGH) return "#f59e0b";      
    if (priority === Priority.MEDIUM) return "#3b82f6";     
    return "#64748b";                                      
  };

  const createCustomPinIcon = (color: string) => {
    return L.divIcon({
      className: "custom-map-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 26px;
          height: 26px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  };

  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      minZoom: KENYA_MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: KENYA_BOUNDS,
      maxBoundsViscosity: 1,
    }).setView(KENYA_CENTER, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const isWorldView = showWorld;
    map.setMinZoom(isWorldView ? WORLD_MIN_ZOOM : KENYA_MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);
    map.setMaxBounds(isWorldView ? WORLD_BOUNDS : KENYA_BOUNDS);
    map.setView(isWorldView ? WORLD_CENTER : KENYA_CENTER, isWorldView ? 2 : 6);
  }, [showWorld]);

  // Update markers when incidents or filters change
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const filtered = incidents.filter((item) => {
      if (!item.latitude || !item.longitude) return false;
      if (filterPriority === "ALL") return true;
      return item.priority === filterPriority;
    });

    filtered.forEach((item) => {
      const color = getMarkerColor(item.priority, item.status);
      const icon = createCustomPinIcon(color);
      const marker = L.marker([item.latitude, item.longitude], { icon });

      const popupContainer = document.createElement("div");
      popupContainer.style.minWidth = "180px";
      popupContainer.style.fontFamily = "inherit";

      popupContainer.innerHTML = `
        <div style="font-size: 11px; font-weight: bold; color: ${color}; text-transform: uppercase;">
          ${item.priority} • ${item.status}
        </div>
        <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">
          ${item.title}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          ${item.locationAddress}
        </div>
        <div style="margin-top: 8px;">
          <button id="view-incident-${item.id}" style="
            background: #0f172a;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          ">Inspect Details</button>
        </div>
      `;

      marker.bindPopup(popupContainer);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`view-incident-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedIncident(item);
            marker.closePopup();
          };
        }
      });

      layer.addLayer(marker);
    });
  }, [incidents, filterPriority]);

  return (
    <div className="relative h-[calc(100vh-12rem)] w-full rounded-2xl overflow-hidden border border-border shadow-md">
      <Card className="absolute bottom-4 right-4 z-1000 max-w-[calc(100%-2rem)] space-y-3 border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:min-w-72">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-foreground">Map view</span>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <Button
              size="sm"
              variant={!showWorld ? "default" : "ghost"}
              aria-pressed={!showWorld}
              onClick={() => setShowWorld(false)}
              className="h-7 gap-1.5 px-2 text-[11px]"
            >
              <MapPinned className="size-3.5" />
              Kenya
            </Button>
            <Button
              size="sm"
              variant={showWorld ? "default" : "ghost"}
              aria-pressed={showWorld}
              onClick={() => setShowWorld(true)}
              className="h-7 gap-1.5 px-2 text-[11px]"
            >
              <Globe2 className="size-3.5" />
              World
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Priority
          </span>
          <div className="flex flex-wrap items-center gap-1">
          {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <Button
              key={level}
              size="sm"
              variant={filterPriority === level ? "default" : "outline"}
              onClick={() => setFilterPriority(level)}
              aria-pressed={filterPriority === level}
              className="h-7 px-2.5 text-[11px]"
            >
              {level}
            </Button>
          ))}
          </div>
        </div>
      </Card>

      <Card className="absolute bottom-4 left-4 z-1000 p-3 shadow-lg bg-background/90 backdrop-blur-md border border-border/80 hidden sm:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Urgent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Resolved</span>
        </div>
          </Card>
          
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      <RequestDetailSheet
        isOpen={!!selectedIncident}
        onOpenChange={(open) => !open && setSelectedIncident(null)}
        request={selectedIncident}
      />
    </div>
  );
}
