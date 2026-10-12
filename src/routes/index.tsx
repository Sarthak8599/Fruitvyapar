import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBasket, Sprout, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CategoryStrip } from "@/components/CategoryStrip";
import { useLang } from "@/lib/i18n";
import type { Category } from "@/lib/listings";
const buyImg = "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80";
const sellImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FruitVyapar — Fresh Fruits, Direct Trade" },
      {
        name: "description",
        content:
          "Connect directly with fruit farmers and buyers across India. Browse mango, pomegranate, grapes, banana and more on FruitVyapar.",
      },
      { property: "og:title", content: "FruitVyapar — Fresh Fruits, Direct Trade" },
      {
        property: "og:description",
        content: "Direct farm-to-buyer fruit marketplace. Find fresh produce within your distance range.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useLang();
  const [category, setCategory] = useState<Category | "all">("all");

  return (
    <AppShell>
      <section className="mb-5">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
          {t("heroTitle")}
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
          <img
            src={buyImg}
            alt="Fresh mangoes, pomegranates and grapes"
            width={800}
            height={600}
            className="h-40 w-full object-cover sm:h-48"
          />
          <div className="space-y-3 p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-strong">
              <ShoppingBasket className="h-3.5 w-3.5" />
              {t("navBuy")}
            </span>
            <h2 className="text-lg font-bold text-foreground">{t("buyCardTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("buyCardSub")}</p>
            <Link
              to="/buy"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong"
            >
              {t("browse")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
          <div className="relative">
            <img
              src={sellImg}
              alt="Farmer holding a crate of freshly harvested mangoes"
              loading="lazy"
              width={800}
              height={600}
              className="h-40 w-full object-cover sm:h-48"
            />
            <div className="absolute bottom-2 left-2 flex gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
                <Phone className="h-4 w-4" />
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-card)]">
                <MessageCircle className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-strong">
              <Sprout className="h-3.5 w-3.5" />
              {t("navSell")}
            </span>
            <h2 className="text-lg font-bold text-foreground">{t("sellCardTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("sellCardSub")}</p>
            <Link
              to="/sell"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-strong"
            >
              {t("startSelling")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <CategoryStrip value={category} onChange={setCategory} />
        <Link
          to="/buy"
          search={{ category }}
          className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground"
        >
          {t("browse")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </AppShell>
  );
}
