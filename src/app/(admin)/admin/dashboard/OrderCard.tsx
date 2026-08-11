"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:                     { label: "Pending Review",     color: "bg-orange-500 text-white" },
  MODIFICATION_REQUESTED:      { label: "Awaiting Customer",  color: "bg-yellow-500 text-black" },
  APPROVED:                    { label: "Approved",           color: "bg-blue-600 text-white" },
  AWAITING_PAYMENT:            { label: "Awaiting Payment",   color: "bg-purple-600 text-white" },
  PAYMENT_CONFIRMED:           { label: "Payment Confirmed",  color: "bg-green-500 text-white" },
  PREPARING:                   { label: "Preparing",          color: "bg-teal-600 text-white" },
  READY_FOR_DELIVERY:          { label: "Ready",              color: "bg-cyan-600 text-white" },
  OUT_FOR_DELIVERY:            { label: "Out for Delivery",   color: "bg-indigo-600 text-white" },
  AWAITING_CUSTOMER_CONFIRM:   { label: "Confirm Delivery",   color: "bg-lime-600 text-black" },
  DELIVERED:                   { label: "Delivered",          color: "bg-green-700 text-white" },
  CANCELLED:                   { label: "Cancelled",          color: "bg-red-600 text-white" },
  CANCELLED_BY_RESTAURANT:     { label: "Cancelled by Us",    color: "bg-red-700 text-white" },
  CANCELLED_BY_CUSTOMER:       { label: "Cancelled by Cust.", color: "bg-red-500 text-white" },
};

export function AdminOrderCard({
  order,
  onUpdateStatus,
  onModifyOrder,
}: {
  order: any;
  onUpdateStatus: (id: string, status: string) => void;
  onModifyOrder: (id: string, mods: any[]) => void;
}) {
  const [expanded, setExpanded] = useState(order.status === "PENDING");
  const [itemStates, setItemStates] = useState<
    Record<string, { available: boolean; replacement: string }>
  >(
    order.items.reduce((acc: any, item: any) => {
      acc[item.id] = { available: true, replacement: "" };
      return acc;
    }, {})
  );

  const handleItemToggle = (itemId: string) =>
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], available: !prev[itemId].available },
    }));

  const handleReplacementChange = (itemId: string, val: string) =>
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], replacement: val },
    }));

  const handleApprove = () => {
    const hasModifications = Object.values(itemStates).some((s) => !s.available);
    if (hasModifications) {
      const mods = Object.entries(itemStates)
        .filter(([_, s]) => !s.available)
        .map(([id, s]) => ({
          itemId: id,
          status: "UNAVAILABLE",
          replacedWith: s.replacement || null,
        }));
      onModifyOrder(order.id, mods);
    } else {
      onUpdateStatus(order.id, "APPROVED");
    }
  };

  const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-muted text-foreground" };
  const isPending = order.status === "PENDING";

  const addressParts = [
    order.houseNumber,
    order.flat,
    order.floor && `Floor ${order.floor}`,
    order.apartment,
    order.landmark && `Near ${order.landmark}`,
  ].filter(Boolean);

  const googleMapsUrl =
    order.latitude && order.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`
      : null;

  const orderNum = order.id.slice(-6).toUpperCase();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://pushya-restaurent.vercel.app";
  const trackingUrl = `${baseUrl}/order/${order.id}`;

  let rawWhatsappMsg = `Hello ${order.customerName}, regarding your order #${orderNum}: Track status live here: ${trackingUrl}`;
  if (order.status === "PENDING") {
    rawWhatsappMsg = `Hello ${order.customerName}, we received your order #${orderNum}! We are reviewing it now. Track live: ${trackingUrl}`;
  } else if (order.status === "APPROVED") {
    rawWhatsappMsg = `Hello ${order.customerName}, your order #${orderNum} has been ACCEPTED! Cooking has started. Track live: ${trackingUrl}`;
  } else if (order.status === "MODIFICATION_REQUESTED") {
    const unavailItems = order.items.filter((i: any) => i.status === "UNAVAILABLE");
    const modLines = unavailItems.length > 0
      ? unavailItems
          .map(
            (i: any) =>
              `• ${i.quantity}x ${i.itemName}` +
              (i.replacedWith ? ` (Suggested replacement: ${i.replacedWith})` : ` (Out of stock)`)
          )
          .join("\n")
      : "• Item modification requested by restaurant";

    rawWhatsappMsg =
      `Hello ${order.customerName}, regarding your order #${orderNum}:\n\n` +
      `⚠️ The following item(s) are currently unavailable:\n${modLines}\n\n` +
      `Please tap here to review and accept/decline the changes:\n${trackingUrl}`;
  } else if (order.status === "OUT_FOR_DELIVERY") {
    rawWhatsappMsg = `Hello ${order.customerName}, your order #${orderNum} is OUT FOR DELIVERY! Our driver is on the way. Track live: ${trackingUrl}`;
  } else if (order.status === "DELIVERED") {
    rawWhatsappMsg = `Hello ${order.customerName}, your order #${orderNum} was DELIVERED! Thank you for ordering from Pushya Restaurent.`;
  }
  const whatsappText = encodeURIComponent(rawWhatsappMsg);

  return (
    <div
      className={`flex flex-col rounded-xl border shadow-sm transition-shadow hover:shadow-md overflow-hidden ${
        isPending ? "bg-orange-50 border-orange-300" : "bg-card border-border"
      }`}
    >
      {/* Header Row — always visible */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`shrink-0 p-2 rounded-full mt-0.5 ${
              isPending ? "bg-orange-100 text-orange-600" : "bg-primary/10 text-primary"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              #{orderNum} — {order.customerName}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap">
              <Clock className="h-3 w-3 shrink-0" />
              {new Date(order.createdAt).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
              &nbsp;·&nbsp;{order.items.length} item{order.items.length > 1 ? "s" : ""}
            </p>
            {!expanded && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                <MapPin className="h-3 w-3 inline-block mr-0.5 shrink-0" />
                {order.formattedAddress || order.customerAddress}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 shrink-0">
          <div className="text-right">
            <p className="font-bold text-sm">₹{order.totalAmount}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-1 ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">

          {/* Customer & Address Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Customer</p>
              <p className="font-semibold text-sm">{order.customerName}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a href={`tel:+91${order.customerPhone}`}>
                  <Button size="sm" variant="outline" className="border-forest text-forest h-8 text-xs gap-1">
                    <Phone className="h-3 w-3" /> {order.customerPhone}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/91${order.customerPhone}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-green-600 text-green-700 h-8 text-xs gap-1">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Delivery Address</p>
              {addressParts.length > 0 && (
                <p className="text-sm font-semibold">{addressParts.join(", ")}</p>
              )}
              <p className="text-xs text-muted-foreground">{order.formattedAddress || order.customerAddress}</p>
              {order.deliveryInstructions && (
                <p className="text-xs italic text-muted-foreground">"{order.deliveryInstructions}"</p>
              )}
              {order.distanceKm && (
                <p className="text-xs text-blue-600 font-medium">{order.distanceKm}km from restaurant</p>
              )}
              {googleMapsUrl && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1">
                      <Navigation className="h-3 w-3" /> Navigate
                    </Button>
                  </a>
                  <a
                    href={`https://maps.google.com/maps?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="border-blue-400 text-blue-600 h-8 text-xs gap-1">
                      <MapPin className="h-3 w-3" /> View Map
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isPending ? (
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-forest rounded border-gray-300 cursor-pointer shrink-0"
                          checked={itemStates[item.id]?.available ?? true}
                          onChange={() => handleItemToggle(item.id)}
                        />
                      ) : (
                        <Badge
                          className={`text-[10px] shrink-0 ${
                            item.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      )}
                      <div className="min-w-0">
                        <span
                          className={`text-sm font-medium block ${
                            itemStates[item.id]?.available === false
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {item.quantity}× {item.itemName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                    {!isPending && item.replacedWith && (
                      <span className="text-xs text-blue-600 font-medium">
                        → {item.replacedWith}
                      </span>
                    )}
                  </div>

                  {isPending && itemStates[item.id]?.available === false && (
                    <Input
                      placeholder="Suggest replacement (optional)"
                      className="h-8 text-xs"
                      value={itemStates[item.id]?.replacement || ""}
                      onChange={(e) => handleReplacementChange(item.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Action Buttons — Full-width stacked on mobile, row on lg ─── */}
          {isPending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <Button
                onClick={() => onUpdateStatus(order.id, "CANCELLED_BY_RESTAURANT")}
                variant="outline"
                size="sm"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 h-10 gap-1"
              >
                <XCircle className="h-4 w-4 shrink-0" /> Reject Order
              </Button>
              <Button
                onClick={handleApprove}
                size="sm"
                className="w-full bg-forest hover:bg-forest/90 text-white h-10 gap-1"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {Object.values(itemStates).some((s) => !s.available)
                  ? "Send Modification"
                  : "Accept Order"}
              </Button>
            </div>
          )}

          {order.status === "APPROVED" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, "PREPARING")}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 gap-1"
              >
                <Package className="h-4 w-4 shrink-0" /> Start Preparing
              </Button>
            </div>
          )}

          {order.status === "PREPARING" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 gap-1"
              >
                <Truck className="h-4 w-4 shrink-0" /> Send for Delivery
              </Button>
            </div>
          )}

          {order.status === "OUT_FOR_DELIVERY" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
              {googleMapsUrl && (
                <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="block">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 gap-1">
                    <Navigation className="h-4 w-4 shrink-0" /> Navigate Now
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, "DELIVERED")}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-10 gap-1"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Mark Delivered
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
