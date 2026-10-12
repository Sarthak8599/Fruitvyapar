import React, { useState, useEffect } from "react";
import { X, Lock, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { TermsModal } from "@/components/TermsModal";
import { cleanIndianMobile, isValidIndianMobile } from "@/lib/phoneUtils";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const { t } = useLang();
  const [step, setStep] = useState<"input" | "verify" | "profile" | "terms">("input");

  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setStep("input");
      setTargetIdentifier("");
      setOtpCode("");
      setFirstName("");
      setLastName("");
      setSecondaryContact("");
      setIsLoading(false);
      setCreatedUserId(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeAuthModal();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = targetIdentifier.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error(t("required"));
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      toast.error("कृपया वैध ई-मेल आयडी टाका (Please enter a valid email address)");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8090/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || t("otpSentMsg", { target: cleanEmail }));
        setStep("verify");
      } else {
        toast.error(data.message || "OTP पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
      }
    } catch {
      toast.error("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया बॅकएंड सर्व्हर सुरू आहे का तपासा.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error(t("enterOtpLabel"));
      return;
    }

    setIsLoading(true);
    const inputClean = otpCode.trim();
    const cleanEmail = targetIdentifier.trim().toLowerCase();

    try {
      const res = await fetch("http://localhost:8090/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: inputClean,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.isFirstTimeUser) {
          setCreatedUserId(data.userId);
          setStep("profile");
          toast.success(t("completeProfileTitle"));
        } else {
          // Returning user who has already accepted terms
          toast.success("Login Successful!");
          const u = data.data;
          login({
            userId: u?.userId || data.userId || Date.now(),
            email: u?.email || cleanEmail,
            phoneNumber: u?.phoneNumber,
            firstName: u?.firstName,
            lastName: u?.lastName,
            role: u?.role || "BUYER",
          });
        }
      } else {
        toast.error(data.message || "चुकीचा OTP कोड. कृपया योग्य ६ अंकी कोड टाका.");
      }
    } catch {
      toast.error("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया बॅकएंड सर्व्हर तपासा.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error(t("required"));
      return;
    }
    const cleanPhone = cleanIndianMobile(secondaryContact);
    if (cleanPhone && !isValidIndianMobile(cleanPhone)) {
      toast.error("कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit Indian mobile number)");
      return;
    }
    // Proceed to Terms & Conditions step
    setStep("terms");
  };

  const handleFinalAcceptTerms = async () => {
    setIsLoading(true);
    const cleanEmail = targetIdentifier.trim().toLowerCase();

    try {
      if (createdUserId) {
        const res = await fetch("http://localhost:8090/api/v1/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: createdUserId,
            firstName,
            lastName,
            email: cleanEmail,
            phoneNumber: secondaryContact.trim() || undefined,
            role: "BUYER",
            termsAccepted: true,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.message || "Could not complete account setup.");
          setIsLoading(false);
          setStep("profile");
          return;
        }

        const savedUser = data.data;
        login({
          userId: savedUser?.userId || createdUserId,
          email: savedUser?.email || cleanEmail,
          phoneNumber: savedUser?.phoneNumber || secondaryContact.trim() || undefined,
          firstName: savedUser?.firstName || firstName,
          lastName: savedUser?.lastName || lastName,
          role: savedUser?.role || "BUYER",
        });
        toast.success("Account created successfully!");
      } else {
        login({
          userId: Date.now(),
          email: cleanEmail,
          phoneNumber: secondaryContact.trim() || undefined,
          firstName,
          lastName,
          role: "BUYER",
        });
        toast.success("Account created successfully!");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "terms") {
    return (
      <TermsModal
        isOpen={true}
        onClose={() => setStep("profile")}
        isFirstTimeView={true}
        onAcceptTerms={handleFinalAcceptTerms}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl bg-card p-6 sm:p-8 shadow-2xl border border-border">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("authModalTitle")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("authModalSub")}
          </p>
        </div>

        {/* STEP 1: OTP Target Entry (Email Only) */}
        {step === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t("phoneOrEmailLabel")}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={targetIdentifier}
                  onChange={(e) => setTargetIdentifier(e.target.value)}
                  placeholder={t("phoneOrEmailPlaceholder")}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-strong transition-all shadow-md active:scale-[0.99]"
            >
              {isLoading ? t("sendingOtp") : t("sendOtpBtn")}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center rounded-xl bg-primary-soft p-3 mb-2 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                {t("otpSentMsg", { target: targetIdentifier })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                तुमचा email inbox तपासा आणि OTP टाका.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 text-center">
                {t("enterOtpLabel")}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="------"
                  className="h-12 w-full text-center tracking-[0.4em] font-extrabold text-lg rounded-xl border border-input bg-background pl-9 pr-4 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-strong transition-all shadow-md"
            >
              {isLoading ? t("verifyingOtp") : t("verifyOtpBtn")}
            </button>

            <button
              type="button"
              onClick={() => setStep("input")}
              className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("changeTarget")}
            </button>
          </form>
        )}

        {/* STEP 3: Complete Profile (First Time User Only) */}
        {step === "profile" && (
          <form onSubmit={handleProfileNext} className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-primary-soft p-3 text-xs text-primary-strong font-semibold mb-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("completeProfileTitle")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("firstNameLabel")}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstNamePlaceholder")}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("lastNameLabel")}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("lastNamePlaceholder")}
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
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(cleanIndianMobile(e.target.value))}
                  placeholder="9822011223"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-20 pr-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary-strong transition-all shadow-md"
            >
              आगे बढ़ें (Next: Terms & Conditions)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
