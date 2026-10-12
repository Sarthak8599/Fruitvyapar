import { Link, useRouterState } from "@tanstack/react-router";
import { Sprout, MapPin, ChevronDown, User, ShoppingCart, Plus, Home } from "lucide-react";
import type { ReactNode } from "react";
import { LANGUAGES, useLang } from "@/lib/i18n";
import { useListings } from "@/lib/listings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { AuthModal } from "@/components/AuthModal";

function TopNav() {
  const { lang, setLang, t } = useLang();
  const { origin } = useListings();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();
  const current = LANGUAGES.find((l) => l.code === lang)!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong shadow-xs">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold tracking-tight text-foreground">
              FruitVyapar
            </span>
            <span className="hidden truncate text-[11px] text-muted-foreground sm:block">{t("tagline")}</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex">
          <Link
            to="/"
            className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              pathname === "/"
                ? "bg-primary-soft text-primary-strong font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>{t("navHome")}</span>
          </Link>
          <Link
            to="/buy"
            className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              pathname === "/buy"
                ? "bg-primary-soft text-primary-strong font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t("navBuy")}</span>
          </Link>
          <Link
            to="/sell"
            className={`inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              pathname === "/sell"
                ? "bg-primary-soft text-primary-strong font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{t("navSell")}</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-strong lg:inline-flex">
            <MapPin className="h-3.5 w-3.5" />
            {origin.label}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              {current.short}
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="text-sm">
                  {l.label} ({l.short})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn ? (
            <Link
              to="/profile"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3.5 text-xs font-bold text-primary-strong hover:bg-primary-soft/80 transition-colors shadow-xs"
            >
              <User className="h-4 w-4" />
              <span className="max-w-[130px] truncate">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`.trim()
                  : user?.email || "Profile"}
              </span>
            </Link>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition-all shadow-sm"
            >
              <User className="h-4 w-4" />
              <span>लॉगिन (Login)</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-2 sm:px-6 lg:hidden">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
          <MapPin className="h-3.5 w-3.5" />
          {origin.label}
        </span>
      </div>
    </header>
  );
}

function BottomNav() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/buy", label: t("navBuy"), icon: ShoppingCart },
    { to: "/", label: t("navHome"), icon: Home },
    { to: "/sell", label: t("navSell"), icon: Plus },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex h-[62px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                active ? "text-primary-strong" : "text-muted-foreground"
              }`}
            >
              <span
                className={`grid h-8 w-14 place-items-center rounded-full ${active ? "bg-primary-soft" : ""}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-10">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      <BottomNav />
      <AuthModal />
    </div>
  );
}
