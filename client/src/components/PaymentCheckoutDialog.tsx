import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getChallengePackages, type PackageId } from "@/lib/packages";
import { useCoach } from "@/lib/coach";
import { pushDataLayerEvent } from "@/lib/tracking";

const paymentStepIndex = 9;
const fixedPaymentCurrency = "AED";

type PaymentCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: "main_hero" | "pricing_section" | "registration_form";
  packageId: PackageId;
  isArabic: boolean;
  onError?: (message: string) => void;
  onInteraction?: () => void;
};

function amountToValue(amount: unknown, fallback: number) {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;

  if (!Number.isFinite(numericAmount)) return fallback;
  return numericAmount > 1000 ? numericAmount / 100 : numericAmount;
}

export default function PaymentCheckoutDialog({
  open,
  onOpenChange,
  source,
  packageId,
  isArabic,
  onError,
  onInteraction,
}: PaymentCheckoutDialogProps) {
  const coach = useCoach();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const contactFormIsValid =
    contactInfo.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(contactInfo.email.trim()) &&
    contactInfo.whatsapp.trim().length >= 7 &&
    contactConfirmed;
  const selectedPackage = getChallengePackages(coach)[packageId];
  const pageType = source === "registration_form" ? "registration_form" : "home_page";
  const text = isArabic
    ? {
        invalid: "عبّي معلوماتك وتأكد إنها صحيحة قبل المتابعة.",
        paymentError: "تعذر إنشاء رابط الدفع.",
        freeError: "تعذر إكمال التسجيل المجاني.",
        title: packageId === "free" ? "خلّينا نثبت تسجيلك المجاني" : "خلّينا نجهّز اشتراكك",
        description:
          packageId === "free"
            ? "أضف بياناتك حتى نثبت مكانك ونرسل لك كود دخول التحدي."
            : `أضف بياناتك للانتقال إلى دفع آمن بقيمة ${selectedPackage.price} درهم عبر Ziina.`,
        name: "الاسم الكامل",
        namePlaceholder: `مثال: ${coach.arabicFirstName}`,
        email: "الإيميل",
        whatsapp: "رقم واتساب",
        confirm: "أؤكد أن الاسم والإيميل ورقم الواتساب صحيحين.",
        loading: packageId === "free" ? "جاري تثبيت تسجيلك..." : "جاري تجهيز الدفع...",
        submit: packageId === "free" ? "تأكيد التسجيل المجاني" : "المتابعة للدفع",
        back: "رجوع",
      }
    : {
        invalid: "Please complete your information and confirm it is correct.",
        paymentError: "Could not create the payment link.",
        freeError: "Could not complete the free registration.",
        title: packageId === "free" ? "Complete your free registration" : "Complete your registration",
        description:
          packageId === "free"
            ? "Add your details to reserve your place and receive the challenge access code."
            : `Add your details to continue to a secure AED ${selectedPackage.price} payment through Ziina.`,
        name: "Full name",
        namePlaceholder: `Example: ${coach.name}`,
        email: "Email",
        whatsapp: "WhatsApp number",
        confirm: "I confirm that my name, email, and WhatsApp number are correct.",
        loading: packageId === "free" ? "Confirming registration..." : "Preparing payment...",
        submit: packageId === "free" ? "Confirm free registration" : "Continue to payment",
        back: "Back",
      };

  const trackInteraction = () => {
    onInteraction?.();
  };

  const startPayment = async () => {
    if (!contactFormIsValid) {
      setContactError(text.invalid);
      return;
    }

    trackInteraction();
    pushDataLayerEvent("registration_form_submit", packageId, {
      cta_location: source,
      page_type: pageType,
      payment_method: packageId === "free" ? "free" : "ziina",
      payment_path: packageId === "free" ? "free" : "online",
    });
    setPaymentLoading(true);
    setContactError(null);

    try {
      window.localStorage.setItem(
        "registration-contact-info",
        JSON.stringify({
          name: contactInfo.name.trim(),
          email: contactInfo.email.trim(),
          whatsapp: contactInfo.whatsapp.trim(),
        }),
      );

      const response = await fetch(
        packageId === "free"
          ? "/api/registrations/free"
          : "/api/ziina/payment-intent",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: contactInfo.name.trim(),
            email: contactInfo.email.trim(),
            whatsapp: contactInfo.whatsapp.trim(),
          },
          coachSlug: coach.coachSlug,
          challengeSlug: coach.challengeSlug,
          packageId,
        }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || (packageId !== "free" && !data?.redirectUrl)) {
        throw new Error(
          data?.error ||
            data?.message ||
            (packageId === "free" ? text.freeError : text.paymentError),
        );
      }

      if (packageId === "free") {
        window.localStorage.removeItem("registration-form-step");
        window.location.href = `/registration-success?registration_id=${encodeURIComponent(
          data.registrationId,
        )}&free=1`;
        return;
      }

      pushDataLayerEvent("payment_started", packageId, {
        cta_location: source,
        page_type: pageType,
        payment_method: "ziina",
        payment_path: "online",
        value: amountToValue(data.amount, selectedPackage.price),
        currency:
          typeof data.currencyCode === "string"
            ? data.currencyCode
            : fixedPaymentCurrency,
      });
      window.localStorage.setItem("registration-form-step", String(paymentStepIndex));
      if (data.registrationId) {
        window.localStorage.setItem("registration-id", data.registrationId);
      }
      window.location.href = data.redirectUrl;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : packageId === "free"
            ? text.freeError
            : text.paymentError;
      setContactError(message);
      onError?.(message);
      setPaymentLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isArabic ? "rtl" : "ltr"}
        className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto rounded-3xl border-white/10 bg-[#0b0f0d] p-5 text-white shadow-[0_26px_90px_rgba(0,0,0,0.55)] sm:max-w-md sm:p-6"
      >
        <DialogHeader className={`space-y-3 ${isArabic ? "text-right" : "text-left"}`}>
          <DialogTitle className="text-2xl font-extrabold text-white">
            {text.title}
          </DialogTitle>
          <DialogDescription className="text-base font-semibold leading-relaxed text-white/65">
            {text.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-white/80">{text.name}</span>
            <Input
              value={contactInfo.name}
              onFocus={trackInteraction}
              onChange={(event) =>
                setContactInfo((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder={text.namePlaceholder}
              className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-white/80">{text.email}</span>
            <Input
              type="email"
              value={contactInfo.email}
              onFocus={trackInteraction}
              onChange={(event) =>
                setContactInfo((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="name@example.com"
              dir="ltr"
              className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-left text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-white/80">{text.whatsapp}</span>
            <Input
              type="tel"
              value={contactInfo.whatsapp}
              onFocus={trackInteraction}
              onChange={(event) =>
                setContactInfo((current) => ({
                  ...current,
                  whatsapp: event.target.value,
                }))
              }
              placeholder="+971 50 000 0000"
              dir="ltr"
              className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-left text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <Checkbox
              checked={contactConfirmed}
              onCheckedChange={(checked) => {
                trackInteraction();
                setContactConfirmed(checked === true);
              }}
              className="mt-1 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-black"
            />
            <span className="text-sm font-bold leading-relaxed text-white/80">
              {text.confirm}
            </span>
          </label>

          {contactError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {contactError}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3">
          <Button
            type="button"
            onClick={startPayment}
            disabled={paymentLoading || !contactFormIsValid}
            className="h-14 rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground shadow-[0_0_28px_rgba(0,191,107,0.26)] hover:bg-primary/90 disabled:opacity-45"
          >
            {paymentLoading ? text.loading : text.submit}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paymentLoading}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
          >
            {text.back}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
