import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Loader2, Wallet, MapPin } from "lucide-react";

export interface ShippingForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (form: ShippingForm, paymentMethod: "stripe" | "cod") => Promise<void>;
  loading: boolean;
  total?: number;
}

const emptyForm: ShippingForm = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
};

// Mirrors the server-side validation of the checkout function so card
// payments never fail with a cryptic backend error.
function validate(form: ShippingForm): Partial<Record<keyof ShippingForm, string>> {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter your full name";
  if (!/^[0-9]{10}$/.test(form.phone.trim()))
    errors.phone = "Phone must be exactly 10 digits";
  if (form.street.trim().length < 5)
    errors.street = "Address must be at least 5 characters";
  if (form.city.trim().length < 2) errors.city = "Enter your city";
  if (form.state.trim().length < 2) errors.state = "Enter your state";
  if (!/^[0-9]{6}$/.test(form.zip.trim()))
    errors.zip = "PIN code must be exactly 6 digits";
  return errors;
}

export function CheckoutDialog({
  isOpen,
  onClose,
  onCheckout,
  loading,
  total = 0,
}: CheckoutDialogProps) {
  const [form, setForm] = useState<ShippingForm>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingForm, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.id as keyof ShippingForm;
    const value =
      key === "phone" || key === "zip"
        ? e.target.value.replace(/\D/g, "")
        : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (paymentMethod: "stripe" | "cod") => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onCheckout(
      {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
      },
      paymentMethod
    );
  };

  const field = (
    id: keyof ShippingForm,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={form[id]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[id])}
        className={`rounded-xl ${errors[id] ? "border-destructive" : ""}`}
        {...props}
      />
      {errors[id] && (
        <p className="text-xs text-destructive">{errors[id]}</p>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            Delivery details
          </DialogTitle>
          <DialogDescription>
            Where should we bring your meal? Phone is 10 digits, PIN code is 6.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {field("fullName", "Full name", { placeholder: "Priya Sharma", autoComplete: "name" })}
          {field("phone", "Phone", {
            inputMode: "numeric",
            maxLength: 10,
            placeholder: "9876543210",
            autoComplete: "tel-national",
          })}
          {field("street", "Address", {
            placeholder: "House no, street, landmark",
            autoComplete: "street-address",
          })}
          <div className="grid grid-cols-2 gap-4">
            {field("city", "City", { placeholder: "Noida" })}
            {field("state", "State", { placeholder: "Uttar Pradesh" })}
          </div>
          {field("zip", "PIN code", {
            inputMode: "numeric",
            maxLength: 6,
            placeholder: "201301",
            autoComplete: "postal-code",
          })}
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Amount payable</span>
            <span className="text-base font-bold text-primary">
              ₹{total.toFixed(2)}
            </span>
          </div>
        )}

        <DialogFooter className="flex-col space-y-2 sm:flex-col sm:justify-center sm:space-x-0">
          <Button
            onClick={() => handleSubmit("stripe")}
            disabled={loading}
            className="btn-premium w-full rounded-xl bg-gradient-warm text-primary-foreground shadow-warm"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Pay by card
          </Button>

          <div className="relative my-1 w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => handleSubmit("cod")}
            disabled={loading}
            className="w-full rounded-xl"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Cash on delivery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
