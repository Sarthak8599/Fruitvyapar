import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
const mangoImg = "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80";
const pomegranateImg = "https://images.unsplash.com/photo-1615486171184-3c6c06a64010?auto=format&fit=crop&w=800&q=80";
const grapesImg = "https://images.unsplash.com/photo-1596368708356-6e1e1025ee72?auto=format&fit=crop&w=800&q=80";
const bananaImg = "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=800&q=80";
import type { Lang } from "./i18n";
import { useAuth } from "./AuthContext";
import { getCurrentPositionWithFallback, reverseGeocodeCoords } from "./locationUtils";

export const CATEGORIES = ["mango", "pomegranate", "banana", "grapes", "orange", "tomato", "onion", "potato", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Listing = {
  id: string;
  category: Category;
  title: Record<Lang, string>;
  description?: Record<Lang, string> | undefined;
  quantity: number;
  unit: "kg" | "quintal";
  images?: string[] | undefined;
  imageFile?: File | undefined;
  imageFiles?: File[] | undefined;
  video?: string | undefined;
  videoFile?: File | undefined;
  farmer: string;
  place: string;
  phone: string;
  lat: number;
  lng: number;
  soldOut?: boolean | undefined;
  createdAt?: number | undefined;
  editCount?: number | undefined;
};

export const PUNE = { lat: 18.5204, lng: 73.8567, label: "Pune, MH" };

const SEED: Listing[] = [];

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function isListingExpired(createdAt?: number) {
  if (!createdAt) return false;
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt >= TWO_DAYS_MS;
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  mango: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80",
  pomegranate: "https://images.unsplash.com/photo-1615486171184-3c6c06a64010?auto=format&fit=crop&w=800&q=80",
  grapes: "https://images.unsplash.com/photo-1596368708356-6e1e1025ee72?auto=format&fit=crop&w=800&q=80",
  banana: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=800&q=80",
  orange: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
  tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
  onion: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
  other: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
};

export const formatMediaUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `http://localhost:8090${url}`;
  }
  if (url.startsWith("uploads/")) {
    return `http://localhost:8090/${url}`;
  }
  return url;
};

type Ctx = {
  listings: Listing[];
  addListing: (l: Omit<Listing, "id" | "createdAt">) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => void;
  refreshListings: () => Promise<void>;
  toggleSoldOut: (id: string) => void;
  likedListingIds: string[];
  toggleLike: (id: string) => void;
  origin: { lat: number; lng: number; label: string };
  setOrigin: (o: { lat: number; lng: number; label: string }) => void;
};

const ListingsContext = createContext<Ctx | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [likedListingIds, setLikedListingIds] = useState<string[]>([]);
  const [origin, setOrigin] = useState(PUNE);

  const fetchBackendListings = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8090/api/v1/listings/nearby?buyerLat=${origin.lat}&buyerLng=${origin.lng}&radiusKm=500&isLoggedIn=${isLoggedIn}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const apiListings: Listing[] = data.data
          .map((item: any) => ({
            id: `db_${item.listingId}`,
            category: (item.fruitName ? item.fruitName.toLowerCase() : "mango") as Category,
            title: {
              mr: item.fruitName || "फळ",
              hi: item.fruitName || "फल",
              en: item.fruitName || "Fruit",
            },
            quantity: item.quantityKg || 100,
            unit: "kg" as const,
            images: item.imageUrl ? [formatMediaUrl(item.imageUrl)!] : undefined,
            video: formatMediaUrl(item.videoUrl),
            farmer: item.farmerName || "Farmer",
            place: item.address || "Pune, Maharashtra",
            phone: item.farmerPhoneNumber || "9822011223",
            lat: item.latitude || origin.lat,
            lng: item.longitude || origin.lng,
            createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            editCount: item.editCount || 0,
          }))
          .filter((l: Listing) => !isListingExpired(l.createdAt));

        setListings(apiListings);
        try {
          localStorage.setItem("fv-listings", JSON.stringify(apiListings));
        } catch {}
      }
    } catch {
      /* ignore */
    }
  }, [origin.lat, origin.lng, isLoggedIn]);

  useEffect(() => {
    try {
      const rawLikes = localStorage.getItem("fv-likes");
      if (rawLikes) setLikedListingIds(JSON.parse(rawLikes) as string[]);
    } catch {
      /* ignore */
    }
    fetchBackendListings();
  }, [fetchBackendListings, isLoggedIn, user]);

  // Automatically fetch user's exact current location when logged in
  useEffect(() => {
    if (isLoggedIn) {
      getCurrentPositionWithFallback(
        async (coords) => {
          const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
          setOrigin({
            lat: coords.latitude,
            lng: coords.longitude,
            label: geocoded.cityState,
          });
        },
        () => {
          /* ignore if geolocation not allowed */
        }
      );
    }
  }, [isLoggedIn, user?.userId]);

  const value = useMemo<Ctx>(
    () => ({
      listings: listings.filter((l) => !isListingExpired(l.createdAt)),
      likedListingIds,
      origin,
      setOrigin,
      refreshListings: fetchBackendListings,
      addListing: async (l) => {
        const now = Date.now();
        const recent24hCount = listings.filter(
          (item) => item.phone === l.phone && now - (item.createdAt || 0) < 24 * 60 * 60 * 1000
        ).length;

        if (recent24hCount >= 2) {
          alert("Daily limit reached: You can only upload a maximum of 2 fruit listings per day.");
          return false;
        }

        try {
          const formData = new FormData();
          formData.append("fruitName", l.title.en || l.category);
          formData.append("quantityKg", String(l.quantity));
          formData.append("farmerPhoneNumber", l.phone);
          formData.append("latitude", String(l.lat));
          formData.append("longitude", String(l.lng));
          formData.append("address", l.place || "Pune, Maharashtra");
          let savedUserEmail: string | undefined;
          let savedUserId: number | undefined;
          try {
            const rawUser = localStorage.getItem("fruitvyapar_user") || localStorage.getItem("kisanvyapar_user");
            if (rawUser) {
              const u = JSON.parse(rawUser);
              if (u?.email) savedUserEmail = u.email;
              if (u?.userId) savedUserId = u.userId;
            }
          } catch {}

          if (savedUserId) formData.append("farmerId", String(savedUserId));
          if (savedUserEmail) formData.append("farmerEmail", savedUserEmail);
          if (l.imageFile) {
            formData.append("image", l.imageFile);
          } else if (l.imageFiles?.[0]) {
            formData.append("image", l.imageFiles[0]);
          }
          if (l.images?.[0]) formData.append("imageUrl", l.images[0]);
          if (l.video) formData.append("videoUrl", l.video);
          if (l.videoFile) formData.append("video", l.videoFile);

          const res = await fetch("http://localhost:8090/api/v1/listings/sell", {
            method: "POST",
            body: formData,
          });
          const result = await res.json();
          if (!result.success) {
            alert(result.message || "Failed to publish listing.");
            return false;
          } else if (result.data) {
            const serverVideo = formatMediaUrl(result.data.videoUrl);
            const serverImage = formatMediaUrl(result.data.imageUrl);
            const newDbListing: Listing = {
              ...l,
              id: `db_${result.data.listingId}`,
              createdAt: result.data.createdAt ? new Date(result.data.createdAt).getTime() : now,
              editCount: result.data.editCount || 0,
              video: serverVideo || l.video,
              images: serverImage ? [serverImage] : l.images,
            };

            setListings((prev) => {
              const next = [newDbListing, ...prev.filter((item) => item.id !== newDbListing.id)];
              try {
                localStorage.setItem("fv-listings", JSON.stringify(next));
              } catch {}
              return next;
            });
            setTimeout(() => {
              fetchBackendListings();
            }, 300);
            return true;
          }
        } catch (err: any) {
          alert("Network error or backend unreachable. Please ensure the server is active.");
          return false;
        }
        return true;
      },
      updateListing: async (id, updates) => {
        const existing = listings.find((l) => l.id === id);
        if (existing && (existing.editCount || 0) >= 2) {
          alert("Maximum edit limit reached! You can only edit a fruit listing up to 2 times.");
          return false;
        }

        const newEditCount = (existing?.editCount || 0) + 1;
        setListings((prev) => {
          const next = prev.map((l) => (l.id === id ? { ...l, ...updates, editCount: newEditCount } : l));
          try {
            localStorage.setItem("fv-listings", JSON.stringify(next));
          } catch { /* ignore */ }
          return next;
        });

        // Persist update to Spring Boot backend database
        if (id.startsWith("db_")) {
          const dbId = id.replace("db_", "");
          try {
            const formData = new FormData();
            if (updates.title?.en || updates.category) {
              formData.append("fruitName", updates.title?.en || updates.category || "Fruit");
            }
            if (updates.quantity) formData.append("quantityKg", String(updates.quantity));
            if (updates.phone) formData.append("farmerPhoneNumber", updates.phone);
            if (updates.lat) formData.append("latitude", String(updates.lat));
            if (updates.lng) formData.append("longitude", String(updates.lng));
            if (updates.place) formData.append("address", updates.place);
            if (updates.imageFile) {
              formData.append("image", updates.imageFile);
            } else if (updates.imageFiles?.[0]) {
              formData.append("image", updates.imageFiles[0]);
            }
            if (updates.images?.[0]) formData.append("imageUrl", updates.images[0]);
            if (updates.video) formData.append("videoUrl", updates.video);
            if (updates.videoFile) formData.append("video", updates.videoFile);

            const res = await fetch(`http://localhost:8090/api/v1/listings/${dbId}/update`, {
              method: "POST",
              body: formData,
            });
            const result = await res.json();
            if (!result.success) {
              if (result.message) {
                alert(result.message);
                return false;
              }
            } else if (result.data) {
              const serverVideo = formatMediaUrl(result.data.videoUrl);
              const serverImage = formatMediaUrl(result.data.imageUrl);
              setListings((prev) => {
                const next = prev.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        ...updates,
                        editCount: result.data.editCount ?? newEditCount,
                        video: serverVideo || updates.video || item.video,
                        images: serverImage ? [serverImage] : (updates.images || item.images),
                      }
                    : item
                );
                try {
                  localStorage.setItem("fv-listings", JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          } catch { /* ignore */ }
        }
        return true;
      },
      deleteListing: async (id) => {
        setListings((prev) => {
          const next = prev.filter((l) => l.id !== id);
          try {
            localStorage.setItem("fv-listings", JSON.stringify(next));
          } catch { /* ignore */ }
          return next;
        });

        if (id.startsWith("db_")) {
          const dbId = id.replace("db_", "");
          try {
            await fetch(`http://localhost:8090/api/v1/listings/${dbId}/delete`, {
              method: "POST",
            });
          } catch {}
        }
      },
      toggleSoldOut: (id) => {
        setListings((prev) => {
          const next = prev.map((l) => (l.id === id ? { ...l, soldOut: !l.soldOut } : l));
          try {
            localStorage.setItem("fv-listings", JSON.stringify(next));
          } catch { /* ignore */ }
          return next;
        });
      },
      toggleLike: (id) => {
        setLikedListingIds((prev) => {
          const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
          try {
            localStorage.setItem("fv-likes", JSON.stringify(next));
          } catch { /* ignore */ }
          return next;
        });
      },
    }),
    [listings, likedListingIds, origin],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used inside ListingsProvider");
  return ctx;
}
