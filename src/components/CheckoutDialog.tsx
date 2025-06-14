
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (address: any, paymentMethod: 'stripe' | 'cod') => Promise<void>;
  loading: boolean;
}

export function CheckoutDialog({ isOpen, onClose, onCheckout, loading }: CheckoutDialogProps) {
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };

  const handleSubmit = (paymentMethod: 'stripe' | 'cod') => {
    for (const key in address) {
      if (!address[key as keyof typeof address]) {
        toast({
          title: "Missing Information",
          description: "Please fill out all address fields.",
          variant: "destructive",
        });
        return;
      }
    }
    onCheckout(address, paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shipping Details</DialogTitle>
          <DialogDescription>
            Please provide your shipping address to proceed with the checkout.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">Full Name</Label>
            <Input id="fullName" value={address.fullName} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" type="tel" value={address.phone} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="street" className="text-right">Street</Label>
            <Input id="street" value={address.street} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">City</Label>
            <Input id="city" value={address.city} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">State</Label>
            <Input id="state" value={address.state} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zip" className="text-right">ZIP Code</Label>
            <Input id="zip" type="text" value={address.zip} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0 sm:justify-center">
            <Button onClick={() => handleSubmit('stripe')} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Proceed to Payment (Card)"}
            </Button>
            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    OR
                    </span>
                </div>
            </div>
            <Button variant="secondary" onClick={() => handleSubmit('cod')} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Place Order (Cash on Delivery)"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

