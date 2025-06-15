
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

interface MenuItem {
  id: string;
  title: string;
}

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem;
}

export function SubscriptionDialog({ isOpen, onClose, menuItem }: SubscriptionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [deliveryDay, setDeliveryDay] = useState('monday');
  const [deliveryTime, setDeliveryTime] = useState('lunch');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };
  
  const handleSubscribe = async () => {
    if (!user || !startDate) {
        toast({ title: "Error", description: "You must be logged in and select a start date.", variant: "destructive" });
        return;
    }
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

    setLoading(true);
    try {
        const shipping_details = {
            address: {
                line1: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.zip,
                country: 'IN',
            },
        };

        const { error } = await supabase.from('subscriptions').insert({
            customer_id: user.id,
            menu_id: menuItem.id,
            quantity: 1,
            frequency,
            delivery_day: frequency === 'weekly' ? deliveryDay : null,
            delivery_time: deliveryTime,
            start_date: format(startDate, 'yyyy-MM-dd'),
            shipping_details,
        });

        if (error) throw error;

        toast({
            title: "Subscribed!",
            description: `You have successfully subscribed to ${menuItem.title}.`,
        });
        onClose();
    } catch (error: any) {
        console.error('Error creating subscription:', error);
        toast({
            title: "Subscription Failed",
            description: error.message || "Could not create subscription.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {menuItem.title}</DialogTitle>
          <DialogDescription>
            Set up your weekly or daily meal plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {frequency === 'weekly' && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deliveryDay" className="text-right">Day</Label>
                <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryTime" className="text-right">Time</Label>
            <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("col-span-3 justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-4"><h3 className="font-semibold mt-4">Shipping Address</h3></div>
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
        <DialogFooter>
          <Button onClick={handleSubscribe} disabled={loading} className="w-full">
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
