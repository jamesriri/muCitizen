"use client";

import * as React from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";

interface LocationPickerProps {
    address: string;
    onAddressChange: (val: string) => void;
    latitude: number | null;
    longitude: number | null;
    onCoordinatesChange: (lat: number | null, lng: number | null) => void;
}

export function LocationPicker({
    address,
    onAddressChange,
    latitude,
    longitude,
    onCoordinatesChange,
}: LocationPickerProps) {
    const [isLocating, setIsLocating] = React.useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                onCoordinatesChange(lat, lng);

                if (!address) {
                    onAddressChange(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
                setIsLocating(false);
            },
            () => {
                alert("Unable to retrieve GPS coordinates. Please input your landmark address manually.");
                setIsLocating(false);
            },
            { timeout: 10000 }
        );
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="locationAddress">Physical Landmark or Street Address *</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="locationAddress"
                        placeholder="e.g. Corner 4th Ave & Kenyatta Highway, near St. Jude Hospital"
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        className="pl-9"
                        required
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectLocation}
                    disabled={isLocating}
                    className="gap-2 text-xs h-9"
                >
                    {isLocating ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting GPS...
                        </>
                    ) : (
                        <>
                            <Navigation className="h-3.5 w-3.5 text-primary" /> Pin Current GPS Coordinates
                        </>
                    )}
                </Button>

                {latitude && longitude && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                        Pinned: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </span>
                )}
            </div>
        </div>
    );
}
