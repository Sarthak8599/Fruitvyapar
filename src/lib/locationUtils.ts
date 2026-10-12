export interface CleanLocation {
  cityState: string;
  fullAddress: string;
  lat: number;
  lng: number;
  accuracy: number | null;
}

/**
 * Formats full address string or nominatim response into clean "City/Town, State" format (e.g. "Pune, MH").
 */
export function formatPlaceName(displayName: string, addressObj?: any): string {
  if (addressObj) {
    const place =
      addressObj.city ||
      addressObj.town ||
      addressObj.village ||
      addressObj.suburb ||
      addressObj.county ||
      addressObj.state_district ||
      "";
    let state = addressObj.state || "";
    if (state === "Maharashtra") state = "MH";
    if (place && state) return `${place}, ${state}`;
    if (place) return place;
  }

  if (!displayName) return "Selected Location";

  // Split by comma and take key parts
  const parts = displayName.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const firstPart = parts[0] || "Location";
    let secondPart = parts.find((p) => p && (p.includes("District") || p === "Maharashtra" || p === "MH")) || parts[1] || "";
    if (secondPart) {
      secondPart = secondPart.replace(/District|Tahsil|Tehsil/gi, "").trim();
      if (secondPart === "Maharashtra") secondPart = "MH";
      return `${firstPart}, ${secondPart}`;
    }
    return firstPart;
  }

  return displayName;
}

/**
 * Reverse geocodes coordinates to a clean place name and full address.
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ cityState: string; fullAddress: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        headers: { "Accept-Language": "en" },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const cityState = formatPlaceName(data.display_name, data.address);
      return {
        cityState,
        fullAddress: data.display_name || cityState,
      };
    }
  } catch (err) {
    console.warn("Reverse geocode failed or timed out:", err);
  }

  // Fallback if network/cors error
  return {
    cityState: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
  };
}

/**
 * Detects user coordinates with high-accuracy + fallback to standard accuracy.
 */
export function getCurrentPositionWithFallback(
  onSuccess: (coords: { latitude: number; longitude: number; accuracy: number | null }) => void,
  onError: (errorMessage: string) => void
) {
  if (typeof window === "undefined" || !navigator.geolocation) {
    onError("Location service is not supported by your browser.");
    return;
  }

  // First try high accuracy with a 5s timeout
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onSuccess({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        onError("Location permission denied. Please allow location access in your browser settings.");
        return;
      }

      // Retry with standard accuracy (Wi-Fi/IP positioning)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSuccess({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err2) => {
          if (err2.code === err2.PERMISSION_DENIED) {
            onError("Location permission denied. Please allow location access in your browser settings.");
          } else {
            onError("Could not detect location. Please search your city or select on map.");
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
  );
}
