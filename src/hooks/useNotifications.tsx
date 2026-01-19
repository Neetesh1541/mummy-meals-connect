import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
}

export function useNotifications() {
  const { toast } = useToast();
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
  });

  useEffect(() => {
    const isSupported = 'Notification' in window;
    setPermissionState({
      permission: isSupported ? Notification.permission : 'denied',
      isSupported,
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!permissionState.isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll receive updates about your orders.",
        });
        return true;
      } else {
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in browser settings to receive order updates.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [permissionState.isSupported, toast]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permissionState.permission !== 'granted') {
      console.log('Notifications not permitted, showing toast instead');
      toast({
        title,
        description: options?.body,
      });
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error sending notification:', error);
      // Fallback to toast
      toast({
        title,
        description: options?.body,
      });
    }
  }, [permissionState.permission, toast]);

  const notifyOrderUpdate = useCallback((status: string, menuTitle?: string) => {
    const messages: Record<string, { title: string; body: string; icon: string }> = {
      placed: {
        title: "Order Placed! 🎉",
        body: `Your order${menuTitle ? ` for ${menuTitle}` : ''} has been placed successfully.`,
        icon: "📋",
      },
      preparing: {
        title: "Chef is Cooking! 👩‍🍳",
        body: `Your order${menuTitle ? ` of ${menuTitle}` : ''} is being prepared with love.`,
        icon: "🍳",
      },
      ready: {
        title: "Order Ready! ✅",
        body: `Your order${menuTitle ? ` of ${menuTitle}` : ''} is ready for pickup!`,
        icon: "📦",
      },
      picked_up: {
        title: "On The Way! 🚗",
        body: `Your delivery partner has picked up your order. Track live location!`,
        icon: "🛵",
      },
      delivered: {
        title: "Delivered! 🎊",
        body: `Your order${menuTitle ? ` of ${menuTitle}` : ''} has been delivered. Enjoy your meal!`,
        icon: "✨",
      },
    };

    const message = messages[status] || {
      title: "Order Update",
      body: "Your order status has been updated.",
      icon: "📱",
    };

    sendNotification(message.title, {
      body: message.body,
      tag: `order-${status}`,
    });
  }, [sendNotification]);

  const notifyDeliveryPartnerAssigned = useCallback((partnerName?: string) => {
    sendNotification("Delivery Partner Assigned! 🚴", {
      body: partnerName 
        ? `${partnerName} will deliver your order. Track live location!`
        : "A delivery partner has been assigned to your order.",
      tag: "delivery-assigned",
    });
  }, [sendNotification]);

  return {
    ...permissionState,
    requestPermission,
    sendNotification,
    notifyOrderUpdate,
    notifyDeliveryPartnerAssigned,
  };
}
