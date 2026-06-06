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

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const paymentStepIndex = 9;
const fixedPaymentValue = 149;
const fixedPaymentCurrency = "AED";

type PaymentCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: "main_hero" | "registration_form";
  onError?: (message: string) => void;
  onInteraction?: () => void;
};

function pushDataLayerEvent(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function amountToValue(amount: unknown) {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;

  if (!Number.isFinite(numericAmount)) return fixedPaymentValue;
  return numericAmount > 1000 ? numericAmount / 100 : numericAmount;
}

export default function PaymentCheckoutDialog({
  open,
  onOpenChange,
  source,
  onError,
  onInteraction,
}: PaymentCheckoutDialogProps) {
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

  const trackInteraction = () => {
    onInteraction?.();
  };

  const startPayment = async () => {
    if (!contactFormIsValid) {
      setContactError("عبّي معلوماتك وتأكد إنها صحيحة قبل المتابعة للدفع.");
      return;
    }

    trackInteraction();
    pushDataLayerEvent({
      event: "registration_form_submit",
      coach_name: "tarek_alghafeer",
      challenge_name: "tarek_alghafeer_challenge",
      cta_location: source,
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

      const response = await fetch("/api/ziina/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: contactInfo.name.trim(),
            email: contactInfo.email.trim(),
            whatsapp: contactInfo.whatsapp.trim(),
          },
          coachSlug: "coach-tarek",
          challengeSlug: "coach-tarek-challenge",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.redirectUrl) {
        throw new Error(data?.error || data?.message || "تعذر إنشاء رابط الدفع.");
      }

      pushDataLayerEvent({
        event: "payment_started",
        coach_name: "tarek_alghafeer",
        challenge_name: "tarek_alghafeer_challenge",
        cta_location: source,
        value: amountToValue(data.amount),
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
        error instanceof Error ? error.message : "تعذر إنشاء رابط الدفع.";
      setContactError(message);
      onError?.(message);
      setPaymentLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto rounded-3xl border-white/10 bg-[#0b0f0d] p-5 text-white shadow-[0_26px_90px_rgba(0,0,0,0.55)] sm:max-w-md sm:p-6"
      >
        <DialogHeader className="space-y-3 text-right">
          <DialogTitle className="text-2xl font-extrabold text-white">
            خلّينا نجهّز كود دخولك
          </DialogTitle>
          <DialogDescription className="text-base font-semibold leading-relaxed text-white/65">
            أضف اسمك، إيميلك، ورقم الواتساب حتى نقدر نرسل لك كود دخول
            التحدي وتفاصيل البداية بعد إتمام الدفع.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-white/80">الاسم الكامل</span>
            <Input
              value={contactInfo.name}
              onFocus={trackInteraction}
              onChange={(event) =>
                setContactInfo((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="مثال: طارق الغفير"
              className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-extrabold text-white/80">الإيميل</span>
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
            <span className="text-sm font-extrabold text-white/80">رقم واتساب</span>
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
              أؤكد أن الاسم والإيميل ورقم الواتساب صحيحين، حتى يوصلني كود
              دخول التحدي بدون تأخير.
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
            {paymentLoading ? "جاري تجهيز الدفع..." : "متابعة للدفع"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={paymentLoading}
            className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
          >
            رجوع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
