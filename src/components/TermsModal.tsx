import React from "react";
import { X, CheckCircle2, FileText, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const TERMS_AND_CONDITIONS = [
  {
    id: 1,
    en: "Use FruitVyapar only for genuine and lawful buying and selling activities.",
    mr: "फ्रूट व्यापारचा वापर फक्त खरेदी आणि विक्रीच्या प्रामाणिक आणि कायदेशीर कामांसाठीच करा.",
    hi: "फ्रूट व्यापार का उपयोग केवल वास्तविक और कानूनी खरीद-बिक्री गतिविधियों के लिए करें।",
  },
  {
    id: 2,
    en: "Provide accurate and truthful information when creating your account, profile, or fruit listing.",
    mr: "खाते, प्रोफाईल किंवा फळांची जाहिरात तयार करताना नेहमी अचूक आणि खरी माहिती द्या.",
    hi: "अपना खाता, प्रोफाइल या फल लिस्टिंग बनाते समय हमेशा सटीक और सच जानकारी दें।",
  },
  {
    id: 3,
    en: "Do not upload fake, misleading, illegal, offensive, or inappropriate photos, videos, or other content.",
    mr: "खोट्या, दिशाभूल करणाऱ्या, बेकायदेशीर, आक्षेपार्ह किंवा अयोग्य फोटो, व्हिडिओ किंवा इतर साहित्य अपलोड करू नका.",
    hi: "नकली, भ्रामक, अवैध, आपत्तिजनक या अनुचित फोटो, वीडियो या सामग्री अपलोड न करें।",
  },
  {
    id: 4,
    en: "Do not create fake accounts, impersonate another person, or misuse another user's account.",
    mr: "बोगस खाती तयार करू नका, दुसऱ्या व्यक्तीचे नाव वापरू नका किंवा कोणाच्या खात्याचा गैरवापर करू नका.",
    hi: "फर्जी खाते न बनाएं, किसी अन्य व्यक्ति का रूप न धरें या किसी खाते का दुरुपयोग न करें।",
  },
  {
    id: 5,
    en: "Respect other users and do not use the platform for harassment, abuse, threats, spam, or fraud.",
    mr: "इतर सर्व वापरकर्त्यांचा आदर करा आणि त्रास देणे, शिवीगाळ, धमक्या, स्पॅम किंवा फसवणुकीसाठी व्यासपीठ वापरू नका.",
    hi: "अन्य उपयोगकर्ताओं का सम्मान करें और उत्पीड़न, गाली-गलौज, धमकी, स्पैम या धोखाधड़ी के लिए मंच का उपयोग न करें।",
  },
  {
    id: 6,
    en: "Do not access, modify, delete, or share another user's private information without permission.",
    mr: "परवानगीशिवाय इतर कोणत्याही वापरकर्त्याची खाजगी माहिती पाहू नका, बदलू नका किंवा शेअर करू नका.",
    hi: "अनुमति के बिना किसी अन्य उपयोगकर्ता की व्यक्तिगत जानकारी तक न पहुंचें, न बदलें और न ही साझा करें।",
  },
  {
    id: 7,
    en: "Sellers must provide genuine information about their fruits, including price, quantity, availability, location, photos, and videos.",
    mr: "विक्रेत्यांनी फळांचा दर, प्रमाण, उपलब्ध ठिकाण, फोटो आणि व्हिडिओची खरी माहिती देणे बंधनकारक आहे.",
    hi: "विक्रेताओं को अपने फलों की कीमत, मात्रा, स्थान, फोटो और वीडियो सहित वास्तविक जानकारी प्रदान करनी होगी।",
  },
  {
    id: 8,
    en: "Never share your OTP, password, UPI PIN, bank details, or other confidential information with anyone.",
    mr: "तुमचा OTP, पासवर्ड, UPI पिन, बँक खाते तपशील किंवा कोणतीही गुप्त माहिती कोणासोबतही शेअर करू नका.",
    hi: "अपना ओटीपी, पासवर्ड, यूपीआई पिन, बैंक विवरण या अन्य गोपनीय जानकारी कभी किसी के साथ साझा न करें।",
  },
  {
    id: 9,
    en: "Always communicate honestly and respectfully with other users, and do not provide false or misleading information.",
    mr: "इतर वापरकर्त्यांशी नेहमी प्रामाणिकपणे आणि आदराने संवाद साधा आणि कोणतीही चुकीची किंवा दिशाभूल करणारी माहिती देऊ नका.",
    hi: "हमेशा अन्य उपयोगकर्ताओं के साथ ईमानदारी और सम्मान से बात करें, और कोई गलत या भ्रामक जानकारी न दें।",
  },
];

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTimeView?: boolean;
  onAcceptTerms?: () => void;
  isLoading?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  isFirstTimeView = false,
  onAcceptTerms,
  isLoading = false,
}) => {
  const { lang } = useLang();
  const [isChecked, setIsChecked] = React.useState(false);

  if (!isOpen) return null;

  const titles = {
    mr: "नियम आणि अटी (Terms & Conditions)",
    hi: "नियम और शर्तें (Terms & Conditions)",
    en: "Terms & Conditions",
  };

  const checkLabels = {
    mr: "मी फ्रूट व्यापारच्या सर्व ९ नियम आणि अटींशी सहमत आहे",
    hi: "मैं फ्रूट व्यापार के सभी 9 नियमों और शर्तों से सहमत हूँ",
    en: "I agree to all 9 Terms & Conditions of FruitVyapar",
  };

  const btnLabels = {
    mr: "स्वीकारा आणि खाते उघडा",
    hi: "स्वीकार करें और खाता खोलें",
    en: "Accept & Open Account",
  };

  const subtitle = {
    mr: "कृपया फ्रूट व्यापार वापरण्यापूर्वी खालील नियम लक्षपूर्वक वाचा:",
    hi: "कृपया फ्रूट व्यापार का उपयोग करने से पहले निम्नलिखित नियम ध्यान से पढ़ें:",
    en: "Please read the following terms carefully before using FruitVyapar:",
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary-strong">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-foreground">{titles[lang]}</h3>
              <p className="text-[11px] text-muted-foreground">FruitVyapar Platform Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1 text-xs font-semibold"
            title={isFirstTimeView ? (lang === "mr" ? "मागे जा (Back)" : lang === "hi" ? "वापस जाएं (Back)" : "Back") : "Close"}
          >
            {isFirstTimeView ? (
              <>
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-xs">{lang === "mr" ? "मागे जा" : lang === "hi" ? "वापस जाएं" : "Back"}</span>
              </>
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Content Body with 9 Terms */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground mb-3">{subtitle[lang]}</p>
          {TERMS_AND_CONDITIONS.map((term) => (
            <div
              key={term.id}
              className="flex items-start gap-3 rounded-xl border border-border/80 bg-background p-3 text-xs shadow-2xs"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary-strong text-[11px]">
                {term.id}
              </span>
              <p className="flex-1 font-medium leading-relaxed text-foreground">
                {term[lang] || term.en}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card p-4 space-y-3">
          {isFirstTimeView ? (
            <>
              <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-primary/30 bg-primary-soft/50 p-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-xs font-bold text-foreground leading-snug">
                  {checkLabels[lang]}
                </span>
              </label>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-12 w-28 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{lang === "mr" ? "मागे जा" : lang === "hi" ? "वापस जाएं" : "Back"}</span>
                </button>

                <button
                  type="button"
                  disabled={!isChecked || isLoading}
                  onClick={() => {
                    if (isChecked && onAcceptTerms) {
                      onAcceptTerms();
                    }
                  }}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-strong disabled:opacity-40 disabled:pointer-events-none"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isLoading ? "Creating Account..." : btnLabels[lang]}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-secondary text-sm font-bold text-foreground hover:bg-muted"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
