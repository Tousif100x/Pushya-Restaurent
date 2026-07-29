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
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:               { label: "Pending",        color: "bg-orange-500 text-white" },
  MODIFICATION_REQUESTED:{ label: "Awaiting Customer",color: "bg-yellow-400 text-black" },
  APPROVED:              { label: "Approved",        color: "bg-blue-600 text-white" },
  OUT_FOR_DELIVERY:      { label: "Out for Delivery", color: "bg-indigo-600 text-white" },
  DELIVERED:             { label: "Delivered",       color: "bg-green-600 text-white" },
  CANCELLED:             { label: "Cancelled",       color: "bg-red-600 text-white" },
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

  const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-muted" };
  const isPending = order.status === "PENDING";

  // Build address lines
  const addressParts = [
    order.houseNumber,
    order.flat,
    order.floor && `Floor ${order.floor}`,
    order.apartment,
    order.landmark && `Near ${order.landmark}`,
  ].filter(Boolean);

  const googleMapsUrl = order.latitude && order.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`
    : null;

  const orderNum = order.id.slice(-6).toUpperCase();

  return (
    <div
      className={`flex flex-col rounded-xl border shadow-sm transition-shadow hover:shadow-md ${
        isPending ? "bg-orange-50 border-orange-300" : "bg-card border-border"
      }`}
    >
      {/* Header Row */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`shrink-0 p-2 rounded-full ${
              isPending ? "bg-orange-100 text-orange-600" : "bg-primary/10 text-primary"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              #{orderNum} — {order.customerName}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
              &nbsp;·&nbsp;{order.items.length} item{order.items.length > 1 ? "s" : ""}
            </p>
            {/* Compact address for collapsed view */}
            {!expanded && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                <MapPin className="h-3 w-3 inline-block mr-0.5" />
                {order.formattedAddress || order.customerAddress}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-bold text-base">₹{order.totalAmount}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-5">

          {/* Customer & Address Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Customer</p>
              <p className="font-semibold">{order.customerName}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <a href={`tel:+91${order.customerPhone}`}>
                  <Button size="sm" variant="outline" className="border-forest text-forest h-8 text-xs">
                    <Phone className="h-3 w-3 mr-1" /> {order.customerPhone}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/91${order.customerPhone}?text=Hello%20${encodeURIComponent(order.customerName)}%2C%20your%20order%20%23${orderNum}%20is%20being%20processed.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-green-600 text-green-700 h-8 text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
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
                <div className="flex gap-2 mt-2 flex-wrap">
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                      <Navigation className="h-3 w-3 mr-1" /> Navigate
                    </Button>
                  </a>
                  <a
                    href={`https://maps.google.com/maps?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="border-blue-400 text-blue-600 h-8 text-xs">
                      <MapPin className="h-3 w-3 mr-1" /> View on Map
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border gap-2"
                >
                  <div className="flex items-center gap-3">
                    {isPending ? (
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-forest rounded border-gray-300 cursor-pointer"
                        checked={itemStates[item.id]?.available ?? true}
                        onChange={() => handleItemToggle(item.id)}
                      />
                    ) : (
                      <Badge
                        className={`text-[10px] ${
                          item.status === "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    )}
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          itemStates[item.id]?.available === false
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.quantity}× {item.itemName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {isPending && itemStates[item.id]?.available === false && (
                    <Input
                      placeholder="Suggest replacement (optional)"
                      className="h-8 text-xs max-w-xs"
                      value={itemStates[item.id]?.replacement || ""}
                      onChange={(e) => handleReplacementChange(item.id, e.target.value)}
                    />
                  )}
                  {!isPending && item.replacedWith && (
                    <span className="text-xs text-blue-600 font-medium">
                      → Replaced with: {item.replacedWith}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isPending && (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => onUpdateStatus(order.id, "CANCELLED")}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject Order
              </Button>
              <Button
                onClick={handleApprove}
                size="sm"
                className="bg-forest hover:bg-forest/90 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {Object.values(itemStates).some((s) => !s.available)
                  ? "Send Modification"
                  : "Approve Order"}
              </Button>
            </div>
          )}
          {order.status === "APPROVED" && (
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="h-4 w-4 mr-1" /> Send for Delivery
              </Button>
            </div>
          )}
          {order.status === "OUT_FOR_DELIVERY" && (
            <div className="flex justify-end gap-2 pt-2">
              {googleMapsUrl && (
                <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Navigation className="h-4 w-4 mr-1" /> Navigate Now
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, "DELIVERED")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Delivered
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
