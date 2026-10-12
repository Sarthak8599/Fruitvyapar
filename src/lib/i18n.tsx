import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "mr" | "hi" | "en";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "mr", label: "मराठी", short: "MR" },
  { code: "hi", label: "हिंदी", short: "HI" },
  { code: "en", label: "English", short: "EN" },
];

type Dict = Record<string, { mr: string; hi: string; en: string }>;

export const STRINGS: Dict = {
  tagline: {
    mr: "ताजी फळे, थेट व्यापार",
    hi: "ताज़े फल, सीधा व्यापार",
    en: "Fresh Fruits, Direct Trade",
  },
  login: { mr: "प्रवेश", hi: "लॉगिन", en: "Login" },
  heroTitle: {
    mr: "थेट बांधावरून खरेदी-विक्री",
    hi: "सीधे खेत से खरीद-बिक्री",
    en: "Fresh Fruits, Direct Trade",
  },
  buyCardTitle: { mr: "ताजी फळे खरेदी करा", hi: "ताज़े फल खरीदें", en: "Buy Fruits" },
  buyCardSub: {
    mr: "आंबा, डाळिंब, द्राक्षे — तुमच्या जवळून",
    hi: "आम, अनार, अंगूर — आपके पास से",
    en: "Mango, pomegranate, grapes — near you",
  },
  sellCardTitle: { mr: "फळांची विक्री करा", hi: "फलों की बिक्री करें", en: "Sell Produce" },
  sellCardSub: {
    mr: "फोटो टाका, दर लिहा, थेट खरेदीदार मिळवा",
    hi: "फोटो डालें, दाम लिखें, सीधे खरीदार पाएं",
    en: "Add photos, set your rate, get direct buyers",
  },
  browse: { mr: "फळे पहा", hi: "फल देखें", en: "Browse fruits" },
  startSelling: { mr: "विक्री सुरू करा", hi: "बेचना शुरू करें", en: "Start selling" },
  allFruits: { mr: "सर्व फळे", hi: "सभी फल", en: "All Fruits" },
  mango: { mr: "आंबा", hi: "आम", en: "Mango" },
  pomegranate: { mr: "डाळिंब", hi: "अनार", en: "Pomegranate" },
  banana: { mr: "केळी", hi: "केला", en: "Banana" },
  grapes: { mr: "द्राक्षे", hi: "अंगूर", en: "Grapes" },
  orange: { mr: "संत्री", hi: "संतरा", en: "Orange" },
  tomato: { mr: "टोमॅटो", hi: "टमाटर", en: "Tomato" },
  onion: { mr: "कांदा", hi: "प्याज़", en: "Onion" },
  potato: { mr: "बटाटा", hi: "आलू", en: "Potato" },
  other: { mr: "इतर", hi: "अन्य", en: "Other" },
  searchLocation: {
    mr: "गाव / तालुका / शहर शोधा",
    hi: "गाँव / तालुका / शहर खोजें",
    en: "Search village / taluka / city",
  },
  useMyLocation: { mr: "माझे स्थान वापरा", hi: "मेरा स्थान इस्तेमाल करें", en: "Use My Current Location" },
  rangeLabel: { mr: "अंतर मर्यादा", hi: "दूरी सीमा", en: "Distance range" },
  showingWithin: {
    mr: "तुमच्या स्थानापासून {km} किमी अंतरातील ताजी फळे",
    hi: "आपके स्थान से {km} किमी के भीतर ताज़े फल",
    en: "Showing fresh fruits within {km} km of your location",
  },
  results: { mr: "नोंदी", hi: "सूचियाँ", en: "listings" },
  noResults: {
    mr: "या अंतरात फळे नाहीत. अंतर वाढवा.",
    hi: "इस दूरी में कोई फल नहीं. दूरी बढ़ाएँ.",
    en: "No fruit found in this range. Try increasing the distance.",
  },
  kmAway: { mr: "किमी अंतरावर", hi: "किमी दूर", en: "km away" },
  available: { mr: "उपलब्ध", hi: "उपलब्ध", en: "Available" },
  callFarmer: { mr: "शेतकऱ्याला कॉल करा", hi: "किसान को कॉल करें", en: "Call Farmer" },
  farmerLabel: { mr: "शेतकरी", hi: "किसान", en: "Farmer" },
  whatsapp: { mr: "व्हॉट्सॲप", hi: "व्हाट्सएप", en: "WhatsApp" },
  waMsg: {
    mr: "नमस्कार! मी FruitVyapar वर तुमचे {fruit} पाहिले. हे अजून विक्रीसाठी उपलब्ध आहे का?",
    hi: "नमस्ते! मैंने FruitVyapar पर आपका {fruit} देखा। क्या यह अभी बिक्री के लिए उपलब्ध है?",
    en: "Hello! I saw your listing for {fruit} on FruitVyapar. Is this still available for sale?",
  },
  sellTitle: { mr: "तुमची फळे नोंदवा", hi: "अपने फल दर्ज करें", en: "List your produce" },
  sellSub: {
    mr: "एक मिनिटात नोंद पूर्ण करा — खरेदीदार थेट कॉल करतील.",
    hi: "एक मिनट में सूची पूरी करें — खरीदार सीधे कॉल करेंगे.",
    en: "Finish in under a minute — buyers call you directly.",
  },
  description: { mr: "वर्णन (कमाल २० शब्द)", hi: "विवरण (अधिकतम 20 शब्द)", en: "Description (max 20 words)" },
  descHint: { mr: "थोडक्यात माहिती लिहा", hi: "संक्षिप्त जानकारी लिखें", en: "Write a short description" },
  fruitCategory: { mr: "फळाचा प्रकार", hi: "फल की श्रेणी", en: "Fruit category" },
  quantity: { mr: "उपलब्ध प्रमाण (किलो)", hi: "उपलब्ध मात्रा (किलो)", en: "Available quantity (KG)" },
  phone: { mr: "मोबाईल नंबर", hi: "मोबाइल नंबर", en: "Phone number" },
  farmerName: { mr: "तुमचे नाव", hi: "आपका नाम", en: "Your name" },
  photo: { mr: "फोटो अपलोड करा", hi: "फोटो अपलोड करें", en: "Upload photo" },
  photoHint: { mr: "टॅप करून फोटो निवडा", hi: "टैप करके फोटो चुनें", en: "Tap to choose a photo" },
  video: { mr: "व्हिडिओ (जास्तीत जास्त २० सेकंद)", hi: "वीडियो (अधिकतम 20 सेकंड)", en: "Video (max 20 seconds)" },
  videoHint: { mr: "टॅप करून व्हिडिओ निवडा", hi: "टैप करके वीडियो चुनें", en: "Tap to choose a video" },
  videoOk: { mr: "व्हिडिओ योग्य आहे ({s} सेकंद)", hi: "वीडियो सही है ({s} सेकंड)", en: "Video accepted ({s}s)" },
  videoTooLong: {
    mr: "व्हिडिओ {s} सेकंदांचा आहे. २० सेकंदांपेक्षा कमी हवा.",
    hi: "वीडियो {s} सेकंड का है. 20 सेकंड से कम चाहिए.",
    en: "Video is {s}s long. It must be under 20 seconds.",
  },
  locationLabel: { mr: "स्थान", hi: "स्थान", en: "Location" },
  gpsOption: { mr: "थेट GPS स्थान घ्या", hi: "लाइव GPS स्थान लें", en: "Fetch Live GPS Location" },
  manualOption: {
    mr: "गाव / तालुका / शहर लिहा",
    hi: "गाँव / तालुका / शहर लिखें",
    en: "Enter Village / Taluka / City Manually",
  },
  fetchGps: { mr: "स्थान मिळवा", hi: "स्थान लें", en: "Fetch location" },
  publish: { mr: "फळांची नोंद प्रकाशित करा", hi: "सूची प्रकाशित करें", en: "Publish Produce Listing" },
  published: { mr: "नोंद प्रकाशित झाली!", hi: "सूची प्रकाशित हुई!", en: "Listing published!" },
  navBuy: { mr: "खरेदी", hi: "खरीदें", en: "Buy Fruits" },
  navHome: { mr: "होम", hi: "होम", en: "Home" },
  navSell: { mr: "विक्री", hi: "बेचें", en: "Sell Produce" },
  locating: { mr: "स्थान शोधत आहे...", hi: "स्थान खोज रहे हैं...", en: "Locating..." },
  locationDenied: {
    mr: "स्थान मिळाले नाही. परवानगी तपासा.",
    hi: "स्थान नहीं मिला. अनुमति जांचें.",
    en: "Couldn't get location. Check permission.",
  },
  required: { mr: "कृपया सर्व माहिती भरा", hi: "कृपया सभी जानकारी भरें", en: "Please fill all required fields" },
  imageRequired: { mr: "कृपया किमान १ फोटो अपलोड करा", hi: "कृपया कम से कम 1 फोटो अपलोड करें", en: "Please upload at least 1 photo" },
  listedFruits: { mr: "नोंदवलेली फळे", hi: "दर्ज किए गए फल", en: "Listed Fruits" },
  myFruits: { mr: "माझी फळे", hi: "मेरे फल", en: "My Fruits" },
  callsMade: { mr: "केलेले कॉल्स", hi: "किए गए कॉल", en: "Calls Made" },
  inquiries: { mr: "चौकशी", hi: "पूछताछ", en: "Inquiries" },
  inquiriesSub: { mr: "आलेले कॉल्स", hi: "आए हुए कॉल", en: "Incoming Calls" },
  sellingHub: { mr: "विक्री केंद्र", hi: "बिक्री केंद्र", en: "Selling Hub" },
  buyingHub: { mr: "खरेदी केंद्र", hi: "खरीद केंद्र", en: "Buying Hub" },
  manageListingsTitle: { mr: "माझी नोंदवलेली फळे", hi: "मेरे दर्ज किए गए फल", en: "My Listed Fruits" },
  manageListingsSub: { mr: "नोंदी व्यवस्थापित करा", hi: "सूचियां प्रबंधित करें", en: "Manage listings, mark sold" },
  inboundTitle: { mr: "खरेदीदारांची चौकशी", hi: "खरीदारों की पूछताछ", en: "Inbound Buyer Enquiries" },
  inboundSub: { mr: "तुम्हाला कोणी संपर्क केला ते पहा", hi: "देखें किसने आपसे संपर्क किया", en: "See who tried reaching you" },
  outboundTitle: { mr: "केलेले कॉल्स आणि मेसेज", hi: "किए गए कॉल और संदेश", en: "Calls & Inquiries Made" },
  outboundSub: { mr: "तुमचा शेतकऱ्यांशी संपर्क", hi: "किसानों से आपका संपर्क", en: "Your contacts with farmers" },
  savedTitle: { mr: "जतन केलेल्या नोंदी", hi: "सहेजी गई सूचियां", en: "Saved / Favorite Listings" },
  savedSub: { mr: "आवडलेल्या नोंदी जलद पहा", hi: "पसंदीदा तक त्वरित पहुँच", en: "Quick access to bookmarked farms" },
  supportPrefs: { mr: "मदत आणि सेटिंग्ज", hi: "सहायता और सेटिंग्स", en: "Support & Preferences" },
  chatSupport: { mr: "व्हॉट्सॲपवर FruitVyapar मदत मिळवा", hi: "WhatsApp पर FruitVyapar सहायता लें", en: "Chat with FruitVyapar Support on WhatsApp" },
  languageText: { mr: "भाषा", hi: "भाषा", en: "Language" },
  otherNameLabel: { mr: "फळ/भाजीचे नाव", hi: "फल/सब्जी का नाम", en: "Produce Name" },
  otherNameHint: { mr: "उदा. कोबी, सफरचंद", hi: "उदा. पत्तागोभी, सेब", en: "e.g. Cabbage, Apple" },
  authModalTitle: { mr: "FruitVyapar मध्ये लॉगिन करा", hi: "FruitVyapar में लॉगिन करें", en: "Login to FruitVyapar" },
  authModalSub: { mr: "शेतकऱ्यांचे नंबर, नकाशा व संपर्क माहिती पाहण्यासाठी लॉगिन करा", hi: "किसानों के नंबर, नक्शा और संपर्क देखने के लिए लॉगिन करें", en: "Login to view farmer contact numbers, location map & details" },
  otpFastLogin: { mr: "OTP द्वारे लॉगिन", hi: "OTP से लॉगिन", en: "Login via OTP" },
  passwordLogin: { mr: "पासवर्ड द्वारे लॉगिन", hi: "पासवर्ड से लॉगिन", en: "Login via Password" },
  phoneOrEmailLabel: { mr: "ई-मेल आयडी टाका", hi: "ईमेल आईडी दर्ज करें", en: "Enter Email Address" },
  phoneOrEmailPlaceholder: { mr: "उदा. user@gmail.com", hi: "उदा. user@gmail.com", en: "e.g. user@gmail.com" },
  sendOtpBtn: { mr: "६-अंकी OTP पाठवा", hi: "6-अंकी OTP भेजें", en: "Send 6-digit OTP" },
  sendingOtp: { mr: "OTP पाठवत आहे...", hi: "OTP भेज रहे हैं...", en: "Sending OTP..." },
  otpSentMsg: { mr: "{target} वर ६-अंकी OTP पाठवला आहे.", hi: "{target} पर 6-अंकी OTP भेजा गया है।", en: "6-digit OTP code sent to {target}." },
  enterOtpLabel: { mr: "६-अंकी Verification Code टाका", hi: "6-अंकी Verification Code दर्ज करें", en: "Enter 6-digit Verification Code" },
  verifyOtpBtn: { mr: "OTP पडताळणी करा", hi: "OTP सत्यापन करें", en: "Verify OTP & Login" },
  verifyingOtp: { mr: "पडताळणी करत आहे...", hi: "सत्यापित कर रहे हैं...", en: "Verifying..." },
  changeTarget: { mr: "← ई-मेल बदला", hi: "← ईमेल बदलें", en: "← Change Email" },
  completeProfileTitle: { mr: "पडताळणी यशस्वी! कृपया नाव व माहिती भरा.", hi: "सत्यापन सफल! कृपया नाम और जानकारी भरें।", en: "Verification successful! Please enter your name." },
  firstNameLabel: { mr: "पहिले नाव", hi: "पहला नाम", en: "First Name" },
  lastNameLabel: { mr: "आडनाव / सरनेम", hi: "अटक नाम / सरनेम", en: "Surname / Last Name" },
  firstNamePlaceholder: { mr: "उदा. सतीश", hi: "उदा. सतीश", en: "e.g. Satish" },
  lastNamePlaceholder: { mr: "उदा. पवार", hi: "उदा. पवार", en: "e.g. Pawar" },
  userRoleLabel: { mr: "तुमचा रोल", hi: "आपकी भूमिका", en: "Your Role" },
  buyerRole: { mr: "खरेदीदार (Buyer)", hi: "खरीदार (Buyer)", en: "Buyer" },
  farmerRole: { mr: "शेतकरी (Farmer)", hi: "किसान (Farmer)", en: "Farmer" },
  completeBtn: { mr: "पूर्ण करा व प्रारंभ करा", hi: "पूरा करें और शुरू करें", en: "Complete & Get Started" },
  loginToViewMap: { mr: "लॉगिन करून नकाशा पहा", hi: "लॉगिन करके नक्शा देखें", en: "Login to View Map" },
  locationMasked: { mr: "माहिती सुरक्षित (पहाण्यासाठी लॉगिन करा)", hi: "जानकारी सुरक्षित (देखने के लिए लॉगिन करें)", en: "Location Masked (Login to view)" },
  sellLoginRequired: { mr: "फळांची विक्री करण्यासाठी प्रथम लॉगिन करणे आवश्यक आहे.", hi: "फल बेचने के लिए पहले लॉगिन करना आवश्यक है।", en: "You must log in first to list produce for sale." },
  loginToPublish: { mr: "विक्रीसाठी लॉगिन करा", hi: "बेचने के लिए लॉगिन करें", en: "Log in to Publish Produce" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof STRINGS, v?: Record<string, string | number>) => string };

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("mr");

  useEffect(() => {
    const saved = localStorage.getItem("fv-lang") as Lang | null;
    if (saved && LANGUAGES.some((l) => l.code === saved)) setLang(saved);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (l) => {
        setLang(l);
        localStorage.setItem("fv-lang", l);
      },
      t: (k, v) => {
        let s = STRINGS[k]?.[lang] ?? String(k);
        if (v) for (const [key, val] of Object.entries(v)) s = s.replace(`{${key}}`, String(val));
        return s;
      },
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
