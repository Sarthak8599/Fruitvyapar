import { useAuth } from "@/lib/AuthContext";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pencil,
  Star,
  BadgeCheck,
  Sprout,
  Apple,
  PhoneCall,
  PhoneIncoming,
  Heart,
  MessageCircle,
  ChevronRight,
  User,
  Languages,
  Trash2,
  FileText,
  Mail,
  Phone,
  LogOut,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LANGUAGES, useLang } from "@/lib/i18n";
import { useListings, distanceKm, isListingExpired } from "@/lib/listings";
import { ListingCard } from "@/components/ListingCard";
import { TermsModal } from "@/components/TermsModal";
import { toast } from "sonner";
import { cleanIndianMobile, isValidIndianMobile } from "@/lib/phoneUtils";

type Tab = "listings" | "calls" | "inquiries" | "saved";

export const Route = createFileRoute("/profile")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search["tab"];
    return tab === "listings" || tab === "calls" || tab === "inquiries" || tab === "saved" ? { tab } : {};
  },
  head: () => ({
    meta: [
      { title: "My Profile — FruitVyapar" },
      {
        name: "description",
        content:
          "Manage your FruitVyapar profile: listed fruits, buyer enquiries, calls made, saved listings and language settings.",
      },
      { property: "og:title", content: "My Profile — FruitVyapar" },
      {
        property: "og:description",
        content: "Manage your fruit listings, buyer enquiries and preferences on FruitVyapar.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function MetricCard({
  icon: Icon,
  value,
  label,
  sub,
  active,
  tab,
}: {
  icon: any;
  value: number;
  label: string;
  sub: string;
  active: boolean;
  tab: Tab;
}) {
  return (
    <Link
      to="/profile"
      search={{ tab }}
      className={`flex flex-col justify-between rounded-2xl border p-3 transition-all ${
        active
          ? "border-primary bg-primary-soft/50 ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-soft text-primary-strong">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs font-bold text-foreground truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
      </div>
    </Link>
  );
}

function ActionRow({
  icon: Icon,
  title,
  desc,
  badge,
  tone = "primary",
  to,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  badge?: number;
  tone?: "primary" | "amber" | "blue";
  to?: { to: string; search?: Record<string, unknown> };
  onClick?: () => void;
}) {
  const content = (
    <div className="flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs transition-all hover:bg-muted/50">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            tone === "amber"
              ? "bg-amber-100 text-amber-700"
              : tone === "blue"
              ? "bg-blue-100 text-blue-700"
              : "bg-primary-soft text-primary-strong"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge !== undefined && badge > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
            {badge}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );

  if (to) {
    if (to.search) {
      return <Link to={to.to} search={to.search}>{content}</Link>;
    }
    return <Link to={to.to}>{content}</Link>;
  }
  return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>;
}

function ProfilePage() {
  const { tab } = Route.useSearch();
  const { lang, setLang, t } = useLang();
  const { listings, toggleSoldOut, deleteListing, likedListingIds, origin } = useListings();
  const { user, isLoggedIn, openAuthModal, logout, login } = useAuth();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = () => {
    if (!user) return;
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditPhone(user.phoneNumber || "");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!editFirstName.trim()) {
      toast.error("First name is required");
      return;
    }
    const cleanPhone = cleanIndianMobile(editPhone);
    if (cleanPhone && !isValidIndianMobile(cleanPhone)) {
      toast.error("कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit Indian mobile number)");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8090/api/v1/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          phoneNumber: cleanPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed to update profile");
        setIsSaving(false);
        return;
      }
      const updated = data.data;
      login({
        userId: updated?.userId || user.userId,
        email: updated?.email || user.email,
        phoneNumber: updated?.phoneNumber || cleanPhone || undefined,
        firstName: updated?.firstName || editFirstName.trim(),
        lastName: updated?.lastName || editLastName.trim(),
        role: updated?.role || user.role,
      });
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = useMemo(() => {
    if (!user) return "Guest User";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email || user.phoneNumber || "Kisan User";
  }, [user]);

  const myListings = useMemo(() => {
    if (!user) return [];
    const userPhone = user.phoneNumber?.trim();
    const userEmail = user.email?.trim().toLowerCase();
    return listings.filter((l) => {
      if (isListingExpired(l.createdAt)) return false;
      const lPhone = l.phone?.trim();
      if (!lPhone) return false;
      if (userPhone && (lPhone === userPhone || lPhone.includes(userPhone.slice(-10)))) return true;
      if (userEmail && lPhone.toLowerCase() === userEmail) return true;
      return false;
    });
  }, [listings, user]);

  const savedListings = listings.filter((l) => likedListingIds.includes(l.id));

  const empty: Record<Tab, { title: string; hint: string }> = {
    listings: { title: "No fruits listed yet", hint: "Add your first harvest from Sell Produce." },
    calls: { title: "No calls made yet", hint: "Call or WhatsApp a farmer from Buy Fruits." },
    inquiries: { title: "No enquiries yet", hint: "Buyers will call you once you list produce." },
    saved: { title: "No saved items", hint: "Heart a listing to save it for later." },
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Hero card */}
        <section className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong ring-4 ring-primary/20">
              <User className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="truncate text-xl font-extrabold text-foreground">{displayName}</h1>
                  {user && (
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary-strong hover:bg-primary/20 transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>बदला (Edit)</span>
                    </button>
                  )}
                </div>
                {user && (
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>लॉगआउट</span>
                  </button>
                )}
              </div>

              {user ? (
                <div className="mt-1 space-y-1">
                  {user.phoneNumber && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary-strong shrink-0" />
                      <span>{user.phoneNumber}</span>
                    </p>
                  )}
                  {user.email && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-strong">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      5.0
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified Grower/Trader
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      <Sprout className="h-3.5 w-3.5" />
                      FruitVyapar Member
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mt-0.5">Please log in with your email address</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-strong transition-all"
                    >
                      <User className="h-4 w-4" />
                      <span>लॉगिन करा (Log In to Your Account)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={Apple}
            value={myListings.length}
            label={t("listedFruits")}
            sub={t("myFruits")}
            active={tab === "listings"}
            tab="listings"
          />
          <MetricCard
            icon={PhoneCall}
            value={0}
            label={t("callsMade")}
            sub={t("callsMade")}
            active={tab === "calls"}
            tab="calls"
          />
          <MetricCard
            icon={PhoneIncoming}
            value={0}
            label={t("inquiries")}
            sub={t("inquiriesSub")}
            active={tab === "inquiries"}
            tab="inquiries"
          />
        </section>

        {/* Filtered list */}
        {tab && (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            {tab === "listings" && myListings.length > 0 ? (
              <ul className="divide-y divide-border">
                {myListings.map((l) => (
                  <li key={l.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                        <Apple className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-foreground">
                          {l.title[lang]} {l.soldOut && <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">Sold Out</span>}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          Available: {l.quantity} {l.unit} • {l.place}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => toggleSoldOut(l.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                          l.soldOut 
                            ? "border-primary bg-primary-soft text-primary-strong" 
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {l.soldOut ? "Mark Available" : "Mark Sold Out"}
                      </button>
                      <Link
                        to="/sell"
                        search={{ edit: l.id }}
                        onClick={(e) => {
                          if ((l.editCount || 0) >= 2) {
                            e.preventDefault();
                            alert("Edit limit reached: This fruit listing has already been edited 2 times and cannot be edited again.");
                          }
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                          (l.editCount || 0) >= 2
                            ? "border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        Edit {(l.editCount || 0) > 0 ? `(${l.editCount}/2)` : ""}
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this listing?")) {
                            deleteListing(l.id);
                          }
                        }}
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : tab === "saved" && savedListings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedListings.map((l) => (
                  <ListingCard key={l.id} listing={l} distance={distanceKm(origin, l)} />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-bold text-foreground">{empty[tab as Tab].title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{empty[tab as Tab].hint}</p>
              </div>
            )}
          </section>
        )}

        {/* Hubs */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary-strong">
                <Sprout className="h-4 w-4" />
              </span>
              {t("sellingHub")}
            </h2>
            <div className="space-y-3">
              <ActionRow
                icon={Apple}
                title={t("manageListingsTitle")}
                desc={t("manageListingsSub")}
                badge={myListings.length}
                to={{ to: "/profile", search: { tab: "listings" } }}
              />
              <ActionRow
                icon={PhoneIncoming}
                title={t("inboundTitle")}
                desc={t("inboundSub")}
                badge={0}
                to={{ to: "/profile", search: { tab: "inquiries" } }}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-accent bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                <PhoneCall className="h-4 w-4" />
              </span>
              {t("buyingHub")}
            </h2>
            <div className="space-y-3">
              <ActionRow
                icon={PhoneCall}
                title={t("outboundTitle")}
                desc={t("outboundSub")}
                tone="amber"
                to={{ to: "/profile", search: { tab: "calls" } }}
              />
              <ActionRow
                icon={Heart}
                title={t("savedTitle")}
                desc={t("savedSub")}
                badge={savedListings.length}
                tone="amber"
                to={{ to: "/profile", search: { tab: "saved" } }}
              />
            </div>
          </section>
        </div>

        {/* Support & preferences */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">
              <MessageCircle className="h-4 w-4" />
            </span>
            {t("supportPrefs")}
          </h2>

          <a
            href="https://wa.me/917620067248"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-whatsapp px-4 text-sm font-bold text-whatsapp-foreground shadow-sm transition-all hover:shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            {t("chatSupport")}
          </a>

          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="flex min-h-[50px] w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-strong" />
              <span>नियम आणि अटी (Terms & Conditions)</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="rounded-2xl border border-border p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Languages className="h-4 w-4" />
              {t("languageText")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`h-[52px] rounded-xl text-sm font-bold transition-all ${
                    lang === l.code
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-primary-soft"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Logout Section at the bottom */}
        {isLoggedIn && (
          <section className="pt-2 pb-8">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("तुम्हाला खात्री आहे की तुम्ही लॉगआउट करू इच्छिता? (Are you sure you want to log out?)")) {
                  logout();
                  toast.success("यशस्वीरित्या लॉगआउट झाले (Logged out successfully)");
                }
              }}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 px-4 text-sm font-extrabold text-red-600 shadow-xs transition-all hover:bg-red-100 hover:border-red-300 active:scale-[0.99]"
            >
              <LogOut className="h-5 w-5 text-red-600" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </section>
        )}
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card p-6 shadow-2xl border border-border">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-5">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                <Pencil className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                प्रोफाईल संपादित करा (Edit Profile)
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                तुमचे नाव आणि मोबाईल नंबर अपडेट करा
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    First Name / नाव
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="उदा. Sarthak"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Surname / आडनाव
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="उदा. Galande"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mobile Number / मोबाईल नंबर <span className="text-muted-foreground font-normal">(१० अंकी)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center justify-center rounded bg-muted px-2 py-0.5 text-xs font-bold text-foreground pointer-events-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(cleanIndianMobile(e.target.value))}
                    placeholder="9822011223"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-20 pr-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 h-11 rounded-xl border border-border bg-background text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-strong transition-all shadow-md"
                >
                  {isSaving ? "सेव्ह करत आहे..." : "बदल सेव्ह करा (Save)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
