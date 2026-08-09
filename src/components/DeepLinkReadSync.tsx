import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";

/**
 * Auto-marks alerts as read whenever the user lands on the route a
 * notification deep-links to, so the unread badge stays accurate.
 */
export function DeepLinkReadSync() {
  const location = useLocation();
  const { markReadByLink } = useNotificationHistory();

  useEffect(() => {
    markReadByLink(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search, markReadByLink]);

  return null;
}

export default DeepLinkReadSync;
