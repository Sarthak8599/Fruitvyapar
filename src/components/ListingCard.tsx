import { Phone, MessageCircle, MapPin, Navigation, ChevronLeft, ChevronRight, ExternalLink, Heart, Lock } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLang } from "@/lib/i18n";
import { useListings, formatMediaUrl, CATEGORY_FALLBACK_IMAGES, type Listing } from "@/lib/listings";
import { useAuth } from "@/lib/AuthContext";

function ListingImageItem({
  src,
  alt,
  category,
}: {
  src: string;
  alt: string;
  category: string;
}) {
  const initialUrl = formatMediaUrl(src) || src;
  const [currentSrc, setCurrentSrc] = useState(initialUrl);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(formatMediaUrl(src) || src);
    setTriedFallback(false);
  }, [src]);

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
      if (currentSrc.includes("/uploads/kisanvyapar/")) {
        setCurrentSrc(currentSrc.replace("/uploads/kisanvyapar/", "/uploads/fruitvyapar/"));
        return;
      }
      if (currentSrc.includes("/uploads/fruitvyapar/")) {
        setCurrentSrc(currentSrc.replace("/uploads/fruitvyapar/", "/uploads/kisanvyapar/"));
        return;
      }
    }
    const fallback = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES["mango"];
    setCurrentSrc(fallback);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className="h-full w-full object-cover"
    />
  );
}

export function ListingCard({ listing, distance }: { listing: Listing; distance: number }) {
  const { t, lang } = useLang();
  const { likedListingIds, toggleLike } = useListings();
  const { isLoggedIn, openAuthModal } = useAuth();
  const isLiked = likedListingIds.includes(listing.id);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  const title = listing.title[lang];
  const waText = encodeURIComponent(
    t("waMsg", { name: listing.farmer, fruit: title }),
  );

  function getRelativeTime(timestamp: number) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diffInMs = timestamp - Date.now();
    const daysDifference = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    if (Math.abs(daysDifference) >= 1) return rtf.format(daysDifference, "day");
    const hoursDifference = Math.round(diffInMs / (1000 * 60 * 60));
    if (Math.abs(hoursDifference) >= 1) return rtf.format(hoursDifference, "hour");
    const minutesDifference = Math.round(diffInMs / (1000 * 60));
    if (Math.abs(minutesDifference) >= 1) return rtf.format(minutesDifference, "minute");
    return "just now";
  }

  function maskPhone(phone: string) {
    if (!phone) return "**********";
    const clean = phone.replace(/\D/g, "");
    if (clean.length >= 10) {
      return clean.slice(0, 2) + "*****" + clean.slice(-3);
    }
    return "98*****893";
  }

  async function connectBuyerToSeller(listingId: string, phoneNumber: string) {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+91${cleanPhone.slice(-10)}`;

    // Log call event in backend
    try {
      fetch(`http://localhost:8090/api/v1/listings/${listingId}/log-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Call log error:", error);
    }

    // Trigger native dialer
    window.location.href = `tel:${formattedPhone}`;
  }

  return (
    <article className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
      <div className="p-3.5 relative">
        {listing.createdAt && (
          <span className="absolute right-3.5 top-3.5 text-[10px] font-semibold text-muted-foreground">
            {getRelativeTime(listing.createdAt)}
          </span>
        )}
        <div className="min-w-0 pr-16">
          <h3 className="truncate text-base font-bold text-foreground">
            {title} {lang !== "en" && <span className="text-muted-foreground">| {listing.title.en}</span>}
          </h3>
          {listing.description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {typeof listing.description === "string" ? listing.description : listing.description[lang]}
            </p>
          )}
        </div>
      </div>

      <div className="relative aspect-[4/3] bg-muted">
        <div className="overflow-hidden h-full w-full" ref={emblaRef}>
          <div className="flex h-full w-full touch-pan-y">
            {listing.video && (
              <div className="relative min-w-0 flex-[0_0_100%] h-full w-full">
                <video
                  src={listing.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={formatMediaUrl(listing.images?.[0]) || listing.images?.[0]}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {listing.images?.map((imgSrc, idx) => (
              <div key={idx} className="relative min-w-0 flex-[0_0_100%] h-full w-full">
                <ListingImageItem
                  src={imgSrc}
                  alt={`${title} - photo ${idx + 1}`}
                  category={listing.category}
                />
              </div>
            ))}
            {!listing.images?.length && !listing.video && (
              <div className="relative min-w-0 flex-[0_0_100%] h-full w-full">
                <img
                  src={CATEGORY_FALLBACK_IMAGES[listing.category] || CATEGORY_FALLBACK_IMAGES["mango"]}
                  alt={title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Dots & Arrows if multiple media items */}
        {((listing.images?.length || 0) + (listing.video ? 1 : 0)) > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50 z-10"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50 z-10"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-[var(--shadow-card)] pointer-events-none">
          <Navigation className="h-3 w-3 text-primary-strong" />
          {distance.toFixed(1)} {t("kmAway")}
        </span>

        <button 
          onClick={() => toggleLike(listing.id)}
          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-card/95 shadow-[var(--shadow-card)] transition-transform hover:scale-110 active:scale-95"
        >
          <Heart className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
        </button>

        {listing.soldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="rotate-[-12deg] rounded-lg border-4 border-red-600 px-4 py-2 text-3xl font-black text-red-600 shadow-sm opacity-90 tracking-widest">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-3.5 relative">
        <div className="min-w-0">
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {isLoggedIn ? (listing.farmer && listing.farmer !== "Farmer" ? listing.farmer : t("farmerLabel")) : t("farmerLabel")} · {isLoggedIn ? (listing.place && listing.place !== "Location available after login" ? listing.place : t("locationMasked")) : t("locationMasked")}
            </span>
          </p>
          {isLoggedIn ? (
            <a 
              href={`https://www.google.com/maps?q=${listing.lat},${listing.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary-strong hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View on Map
            </a>
          ) : (
            <button
              onClick={openAuthModal}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary"
            >
              <Lock className="h-3 w-3 text-amber-500" />
              <span>{t("loginToViewMap")}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
            {t("available")}: {listing.quantity} {listing.unit === "kg" ? "kg" : "quintal"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={listing.soldOut}
            onClick={() => connectBuyerToSeller(listing.id, listing.phone)}
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-primary px-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50 disabled:pointer-events-none"
          >
            <Phone className="h-4 w-4" />
            <span className="truncate">
              {isLoggedIn ? t("callFarmer") : maskPhone(listing.phone)}
            </span>
          </button>
          {listing.soldOut ? (
            <button disabled className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-whatsapp px-2 text-sm font-bold text-whatsapp-foreground opacity-50 disabled:pointer-events-none">
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">{t("whatsapp")}</span>
            </button>
          ) : isLoggedIn ? (
            <a
              href={`https://wa.me/${listing.phone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-whatsapp px-2 text-sm font-bold text-whatsapp-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">{t("whatsapp")}</span>
            </a>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-whatsapp/90 px-2 text-sm font-bold text-whatsapp-foreground transition-opacity hover:opacity-100"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="truncate">{t("whatsapp")}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
