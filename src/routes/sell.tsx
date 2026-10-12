import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, ImagePlus, Video, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LocationSelector, type LocationData } from "@/components/LocationSelector";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, useListings, formatMediaUrl, type Category, type Listing } from "@/lib/listings";
import { translateText } from "@/lib/translate";
import { useAuth } from "@/lib/AuthContext";
import { cleanIndianMobile, isValidIndianMobile } from "@/lib/phoneUtils";

export const Route = createFileRoute("/sell")({
  validateSearch: (search: Record<string, unknown>): { edit?: string } => {
    const edit = search["edit"];
    return typeof edit === "string" && edit ? { edit } : {};
  },
  head: () => ({
    meta: [
      { title: "Sell Your Fruit Harvest — FruitVyapar" },
      {
        name: "description",
        content:
          "Farmers: list your mango, pomegranate, grapes or banana harvest with photos and location. Buyers call you directly.",
      },
      { property: "og:title", content: "Sell Your Fruit Harvest — FruitVyapar" },
      {
        property: "og:description",
        content: "List your produce in under a minute and get direct buyers on call and WhatsApp.",
      },
    ],
  }),
  component: SellPage,
});

const FIELD =
  "h-13 w-full rounded-xl border border-input bg-background px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const LABEL = "mb-1.5 block text-sm font-semibold text-foreground";

const DRAFT_KEY = "fv_sell_form_draft";

type SellDraft = {
  category?: Category;
  otherName?: string;
  quantity?: string;
  phone?: string;
  name?: string;
  description?: string;
  photos?: string[];
  locationData?: LocationData | null;
};

function getInitialDraft(): SellDraft {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function SellPage() {
  const { edit } = Route.useSearch();
  const { t, lang } = useLang();
  const { listings, addListing, updateListing } = useListings();
  const { isLoggedIn, user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const editingListing = edit ? listings.find((l) => l.id === edit) : null;
  const [loadedListing, setLoadedListing] = useState<Listing | null>(editingListing || null);
  const isEditing = Boolean(edit);
  const draft = getInitialDraft();

  const [category, setCategory] = useState<Category>(() => {
    if (editingListing) return editingListing.category;
    return draft.category || "mango";
  });

  const [otherName, setOtherName] = useState<string>(() => {
    if (editingListing) return editingListing.category === "other" ? (editingListing.title?.[lang] || "") : "";
    return draft.otherName || "";
  });

  const [quantity, setQuantity] = useState<string>(() => {
    if (editingListing) return String(editingListing.quantity);
    return draft.quantity || "";
  });

  const [phone, setPhone] = useState<string>(() => {
    if (editingListing) return editingListing.phone || "";
    if (user?.phoneNumber) return user.phoneNumber;
    return "";
  });

  const [name, setName] = useState<string>(() => {
    if (editingListing) return editingListing.farmer || "";
    if (user) return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return "";
  });

  const [description, setDescription] = useState<string>(() => {
    if (editingListing) {
      return editingListing.description
        ? (editingListing.description[lang] || editingListing.description.en || "")
        : "";
    }
    return draft.description || "";
  });

  const [photos, setPhotos] = useState<string[]>(() => {
    if (editingListing) return editingListing.images || [];
    return draft.photos || [];
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const [video, setVideo] = useState<string | null>(editingListing?.video || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoState, setVideoState] = useState<{ ok: boolean; seconds: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [locationData, setLocationData] = useState<LocationData | null>(() => {
    if (editingListing) {
      return {
        latitude: editingListing.lat,
        longitude: editingListing.lng,
        accuracy: null,
        source: "manual",
        address: editingListing.place,
      };
    }
    return draft.locationData || null;
  });

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // Pre-fill form fields when in edit mode
  useEffect(() => {
    if (!edit) return;

    const applyData = (l: Listing) => {
      setLoadedListing(l);
      setCategory(l.category);
      if (l.category === "other") {
        setOtherName(l.title?.[lang] || l.title?.en || l.title?.mr || "");
      }
      setQuantity(String(l.quantity || ""));
      setPhone(l.phone || user?.phoneNumber || "");
      setName(l.farmer || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : ""));
      if (l.description) {
        setDescription(l.description[lang] || l.description.en || l.description.mr || l.description.hi || "");
      }
      if (l.images && l.images.length > 0) {
        setPhotos(l.images.map((img) => formatMediaUrl(img) || img));
      }
      if (l.video) {
        setVideo(formatMediaUrl(l.video) || l.video);
      }
      setLocationData({
        latitude: l.lat,
        longitude: l.lng,
        accuracy: null,
        source: "manual",
        address: l.place,
      });

      if ((l.editCount || 0) >= 2) {
        alert("Maximum edit limit (2 edits) reached for this fruit listing! Further edits are not allowed.");
        navigate({ to: "/profile", search: { tab: "listings" } });
      }
    };

    if (editingListing) {
      applyData(editingListing);
    } else if (edit.startsWith("db_") || !isNaN(Number(edit))) {
      const dbId = edit.replace("db_", "");
      fetch(`http://localhost:8090/api/v1/listings/${dbId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            const item = data.data;
            const l: Listing = {
              id: edit,
              category: (item.fruitName ? item.fruitName.toLowerCase() : "mango") as Category,
              title: {
                mr: item.fruitName || "फळ",
                hi: item.fruitName || "फल",
                en: item.fruitName || "Fruit",
              },
              quantity: item.quantityKg || 100,
              unit: "kg",
              images: item.imageUrl
                ? [formatMediaUrl(item.imageUrl) || item.imageUrl]
                : [],
              video: formatMediaUrl(item.videoUrl) || item.videoUrl,
              farmer: item.farmerName || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Farmer"),
              place: item.address || "Pune, Maharashtra",
              phone: item.farmerPhoneNumber || user?.phoneNumber || "",
              lat: item.latitude || 18.5204,
              lng: item.longitude || 73.8567,
              createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
              editCount: item.editCount || 0,
            };
            applyData(l);
          }
        })
        .catch(() => {});
    }
  }, [edit, editingListing, user, lang, navigate]);

  // Sync user details strictly based on active login state (only when creating new listing)
  useEffect(() => {
    if (isEditing) return;
    if (user) {
      setName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setPhone(user.phoneNumber || "");
    } else {
      setName("");
      setPhone("");
    }
  }, [user, isEditing]);

  // Persist non-personal form draft to localStorage (only when creating new listing)
  useEffect(() => {
    if (isEditing) return;
    const currentDraft: SellDraft = {
      category,
      otherName,
      quantity,
      phone: user ? phone : "",
      name: user ? name : "",
      description,
      photos,
      locationData,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(currentDraft));
    } catch {}
  }, [category, otherName, quantity, phone, name, description, photos, locationData, isEditing, user]);

  function onPhotos(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    setPhotoFiles((prev) => [...prev, ...incoming]);
    incoming.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function onVideo(file?: File) {
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const seconds = Math.round(el.duration * 10) / 10;
      const ok = seconds > 0 && seconds <= 20;
      setVideoState({ ok, seconds });
      setVideo(ok ? url : null);
    };
    el.src = url;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    const newErrors: string[] = [];
    if (!quantity) newErrors.push("qty");
    if (!name) newErrors.push("name");
    if (!phone) newErrors.push("phone");
    if (category === "other" && !otherName) newErrors.push("otherName");

    setErrors(newErrors);

    const cleanPhone = cleanIndianMobile(phone);
    if (!cleanPhone || !isValidIndianMobile(cleanPhone)) {
      newErrors.push("phone");
      setErrors(newErrors);
      toast.error("कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit Indian mobile number)");
      const phoneInput = document.getElementById("phone");
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (newErrors.length > 0) {
      toast.error(t("required"));
      const firstErrorId = newErrors[0];
      if (firstErrorId) {
        const firstError = document.getElementById(firstErrorId);
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const loc: LocationData = locationData || {
      latitude: 18.5204,
      longitude: 73.8567,
      accuracy: null,
      source: "manual",
      address: "Pune, Maharashtra",
    };

    const finalPhotos = photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"];

    setIsSubmitting(true);

    const label = category === "other" ? otherName : t(category);
    let titleToSave = {
      mr: lang === "mr" ? label : category === "other" ? otherName : t(category),
      hi: lang === "hi" ? label : category === "other" ? otherName : t(category),
      en:
        lang === "en"
          ? label
          : category === "other"
          ? otherName
          : category.charAt(0).toUpperCase() + category.slice(1),
    };

    if (category === "other" && otherName.trim()) {
      titleToSave = await translateText(otherName.trim(), lang);
    }

    let descriptionToSave: Record<"mr" | "hi" | "en", string> | undefined = undefined;
    if (description.trim()) {
      descriptionToSave = await translateText(description.trim(), lang);
    }

    if (isEditing && edit) {
      const activeListing = loadedListing || editingListing;
      if (activeListing && (activeListing.editCount || 0) >= 2) {
        alert("Maximum edit limit (2 edits) reached for this fruit listing! Further edits are not allowed.");
        setIsSubmitting(false);
        return;
      }

      const success = await updateListing(edit, {
        category,
        title: titleToSave,
        quantity: Number(quantity),
        images: finalPhotos,
        imageFile: photoFiles[0] || undefined,
        imageFiles: photoFiles,
        video: video ?? undefined,
        videoFile: videoFile ?? undefined,
        description: descriptionToSave,
        farmer: name,
        place:
          loc.address ||
          (loc.source === "gps"
            ? "Current Location"
            : `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`),
        phone: cleanPhone,
        lat: loc.latitude,
        lng: loc.longitude,
      });

      if (success) {
        toast.success("Listing updated successfully!");
        setIsSubmitting(false);
        navigate({ to: "/profile", search: { tab: "listings" } });
        return;
      } else {
        setIsSubmitting(false);
        return;
      }
    } else {
      const success = await addListing({
        category,
        title: titleToSave,
        quantity: Number(quantity),
        unit: "kg",
        images: finalPhotos,
        imageFile: photoFiles[0] || undefined,
        imageFiles: photoFiles,
        video: video ?? undefined,
        videoFile: videoFile ?? undefined,
        description: descriptionToSave,
        farmer: name,
        place:
          loc.address ||
          (loc.source === "gps"
            ? "Current Location"
            : `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`),
        phone: cleanPhone,
        lat: loc.latitude,
        lng: loc.longitude,
      });

      if (success) {
        toast.success(t("published"));
      } else {
        setIsSubmitting(false);
        return;
      }
    }

    // Clear draft on successful publication
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    setIsSubmitting(false);
    if (isEditing) {
      navigate({ to: "/profile", search: { tab: "listings" } });
    } else {
      navigate({ to: "/buy" });
    }
  }

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {isEditing ? "फळे माहिती अपडेट करा (Update Produce Listing)" : t("sellTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? `नोंदणी कमाल २ वेळा अपडेट करता येते. (${loadedListing?.editCount || editingListing?.editCount || 0}/2 Edits used)`
              : t("sellSub")}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={() => navigate({ to: "/profile", search: { tab: "listings" } })}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            रद्द करा (Cancel)
          </button>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-5 rounded-xl bg-card p-4 shadow-[var(--shadow-card)]">
        <div>
          <span className={LABEL}>{t("fruitCategory")}</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`h-12 rounded-full border px-4 text-sm font-semibold ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {t(c)}
              </button>
            ))}
          </div>
          {category === "other" && (
            <div className="mt-4">
              <label className={LABEL} htmlFor="otherName">
                {t("otherNameLabel")}
              </label>
              <input
                id="otherName"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder={t("otherNamePlaceholder")}
                className={FIELD}
              />
            </div>
          )}
        </div>

        <div>
          <label className={LABEL} htmlFor="qty">
            {t("quantity")} ({t("unitKg")})
          </label>
          <input
            id="qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="उदा. 500"
            className={FIELD}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="name">
              {t("farmerName")}
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="phone">
              {t("phone")} <span className="text-muted-foreground font-normal">(१० अंकी)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 flex items-center justify-center rounded bg-muted px-2 py-0.5 text-xs font-bold text-foreground pointer-events-none">
                🇮🇳 +91
              </span>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(cleanIndianMobile(e.target.value))}
                placeholder="9822011223"
                className={`${FIELD} pl-20`}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="desc">
            {t("desc")}
          </label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= 20 || e.target.value.length < description.length) {
                setDescription(e.target.value);
              }
            }}
            placeholder={t("descHint")}
            className="w-full rounded-xl border border-input bg-background px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary min-h-[80px]"
          />
        </div>

        <div>
          <span className={LABEL}>{t("photo")} (Select multiple if needed)</span>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {photos.map((src, i) => (
              <div key={i} className="relative h-24 w-full rounded-xl overflow-hidden border">
                <img src={src} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/50 rounded-full text-white w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background p-6 text-sm font-medium text-muted-foreground"
          >
            <ImagePlus className="h-6 w-6 text-primary-strong" />
            Add Photos
          </button>

          <input
            ref={photoRef}
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => onPhotos(e.target.files)}
          />
        </div>

        <div>
          <span className={LABEL}>{t("video")}</span>
          {video ? (
            <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black">
              <video
                key={video}
                src={video}
                controls
                playsInline
                preload="metadata"
                className="h-48 w-full rounded-lg object-contain bg-black"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideo(null);
                  setVideoFile(null);
                  setVideoState(null);
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shadow-md z-10"
              >
                ✕ Remove / Change Video
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background p-6 text-sm font-medium text-muted-foreground"
            >
              <Video className="h-6 w-6 text-primary-strong" />
              {t("videoHint")}
            </button>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => onVideo(e.target.files?.[0])}
          />
          {videoState &&
            (videoState.ok ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary-strong">
                <CheckCircle2 className="h-4 w-4" />
                {t("videoOk", { s: videoState.seconds })}
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-destructive">
                <AlertCircle className="h-4 w-4" />
                {t("videoTooLong", { s: videoState.seconds })}
              </p>
            ))}
        </div>

        <div>
          <span className={LABEL}>{t("locationLabel")}</span>
          <LocationSelector value={locationData} onChange={setLocationData} />
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate({ to: "/profile", search: { tab: "listings" } })}
              className="h-14 flex-1 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:bg-muted transition-colors"
            >
              रद्द करा (Cancel)
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex h-14 ${isEditing ? "flex-[2]" : "w-full"} items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">
                {isEditing ? "Updating Listing..." : "Translating & Publishing..."}
              </span>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {isEditing ? "माहिती अपडेट करा (Save & Update Produce)" : t("publish")}
              </>
            )}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
