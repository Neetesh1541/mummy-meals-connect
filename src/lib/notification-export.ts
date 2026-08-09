import type { NotificationHistoryItem } from "@/hooks/useNotificationHistory";

const CHANNEL_LABEL: Record<string, string> = {
  push: "Push",
  "in-app": "In-app",
  silenced: "Silenced",
};

function formatRow(item: NotificationHistoryItem) {
  return {
    date: new Date(item.createdAt).toLocaleString(),
    type: (item.category ?? "system") as string,
    channel: CHANNEL_LABEL[item.channel] ?? item.channel,
    status: item.statusKey ?? "",
    title: item.title,
    body: item.body ?? "",
    read: item.read ? "Read" : "Unread",
  };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function exportNotificationsCsv(items: NotificationHistoryItem[]) {
  const headers = ["Date", "Type", "Channel", "Status", "Title", "Message", "State"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...items.map((item) => {
      const r = formatRow(item);
      return [r.date, r.type, r.channel, r.status, r.title, r.body, r.read]
        .map((v) => escape(String(v)))
        .join(",");
    }),
  ];
  download(
    new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" }),
    `mummy-meals-notifications-${stamp()}.csv`
  );
}

export async function exportNotificationsPdf(items: NotificationHistoryItem[]) {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const margin = 42;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setFontSize(18);
  doc.text("Mummy Meals — Notification history", margin, y);
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()} · ${items.length} alerts`, margin, y);
  y += 24;

  items.forEach((item) => {
    const r = formatRow(item);
    const bodyLines = doc.splitTextToSize(r.body || "—", pageWidth - margin * 2);
    const blockHeight = 34 + bodyLines.length * 12;
    if (y + blockHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(30);
    doc.setFontSize(11);
    doc.text(r.title, margin, y);
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(`${r.date} · ${r.type} · ${r.channel} · ${r.read}`, margin, y);
    y += 14;
    doc.setTextColor(70);
    doc.setFontSize(10);
    doc.text(bodyLines, margin, y);
    y += bodyLines.length * 12 + 10;
  });

  doc.save(`mummy-meals-notifications-${stamp()}.pdf`);
}
