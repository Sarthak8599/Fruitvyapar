import type { Lang } from "./i18n";

export async function translateText(text: string, fromLang: Lang): Promise<Record<Lang, string>> {
  if (!text || text.trim() === "") {
    return { mr: "", hi: "", en: "" };
  }
  
  const result: Record<Lang, string> = { mr: "", hi: "", en: "" };
  result[fromLang] = text;

  const langs: Lang[] = ["mr", "hi", "en"];
  
  for (const toLang of langs) {
    if (toLang !== fromLang) {
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
        const data = await res.json();
        result[toLang] = data.responseData.translatedText;
      } catch (e) {
        console.error("Translation failed", e);
        result[toLang] = text; // fallback to original
      }
    }
  }
  
  return result;
}
