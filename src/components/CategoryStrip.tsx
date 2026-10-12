import { useLang } from "@/lib/i18n";
import { CATEGORIES, type Category } from "@/lib/listings";

export function CategoryStrip({
  value,
  onChange,
}: {
  value: Category | "all";
  onChange: (c: Category | "all") => void;
}) {
  const { t } = useLang();
  const items: (Category | "all")[] = ["all", ...CATEGORIES];

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {items.map((c) => {
          const active = c === value;
          const label = c === "all" ? t("allFruits") : t(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`h-12 whitespace-nowrap rounded-full border px-5 text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

