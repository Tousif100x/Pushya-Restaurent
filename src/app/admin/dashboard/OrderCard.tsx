"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, ChevronDown, ChevronUp } from "lucide-react";

export function AdminOrderCard({ order, onUpdateStatus, onModifyOrder }: { order: any, onUpdateStatus: any, onModifyOrder: any }) {
  const [expanded, setExpanded] = useState(order.status === 'PENDING');
  
  // Track availability of items
  const [itemStates, setItemStates] = useState<Record<string, { available: boolean, replacement: string }>>(
    order.items.reduce((acc: any, item: any) => {
      acc[item.id] = { available: true, replacement: "" };
      return acc;
    }, {})
  );

  const handleItemToggle = (itemId: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], available: !prev[itemId].available }
    }));
  };

  const handleReplacementChange = (itemId: string, val: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], replacement: val }
    }));
  };

  const handleApprove = () => {
    // Check if any items are unavailable
    const hasModifications = Object.values(itemStates).some(state => !state.available);
    
    if (hasModifications) {
      // Send modification request
      const modifications = Object.entries(itemStates)
        .filter(([_, state]) => !state.available)
        .map(([id, state]) => ({
          itemId: id,
          status: "UNAVAILABLE",
          replacedWith: state.replacement || null
        }));
        
      onModifyOrder(order.id, modifications);
    } else {
      // All available, approve completely
      onUpdateStatus(order.id, 'APPROVED');
    }
  };

  return (
    <div className={`flex flex-col p-4 rounded-lg border ${order.status === 'PENDING' ? 'bg-orange-50 border-orange-200' : 'bg-card'}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full">
        <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
          <div className={`p-2 rounded-full ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary'}`}>
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <p className="text-sm font-medium leading-none mb-1">
              {order.customerName} - {order.customerPhone}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleTimeString()} • {order.items.length} items
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {order.formattedAddress || order.customerAddress}
            </p>
            {order.latitude && order.longitude && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline font-bold mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                [🧭 Navigate to Location]
              </a>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="md:hidden">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-6">
          <div className="text-right">
            <p className="text-sm font-medium">₹{order.totalAmount}</p>
            <Badge 
              variant={order.status === "DELIVERED" ? "default" : order.status === "PENDING" ? "destructive" : order.status === "MODIFICATION_REQUESTED" ? "secondary" : "secondary"} 
              className={`mt-1 ${order.status === 'MODIFICATION_REQUESTED' ? 'bg-yellow-500 text-black' : ''}`}
            >
              {order.status === 'MODIFICATION_REQUESTED' ? 'WAITING FOR CUSTOMER' : order.status}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {order.status === 'PENDING' && !expanded && (
              <Button size="sm" onClick={() => setExpanded(true)} variant="outline">Review Items</Button>
            )}
            {order.status === 'APPROVED' && (
              <Button size="sm" onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')} className="bg-blue-600 hover:bg-blue-700 text-white">Send for Delivery</Button>
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <Button size="sm" onClick={() => onUpdateStatus(order.id, 'DELIVERED')} className="bg-forest hover:bg-forest-soft text-white">Mark Delivered</Button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t w-full">
          <h4 className="text-sm font-semibold mb-3">Order Items Verification</h4>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-md border gap-3">
                <div className="flex items-center gap-3">
                  {order.status === 'PENDING' ? (
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-forest rounded border-gray-300 focus:ring-forest"
                      checked={itemStates[item.id]?.available ?? true}
                      onChange={() => handleItemToggle(item.id)}
                    />
                  ) : (
                    <Badge variant={item.status === 'AVAILABLE' ? 'default' : 'destructive'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  )}
                  <div>
                    <span className={`text-sm font-medium ${itemStates[item.id]?.available === false ? 'line-through text-muted-foreground' : ''}`}>
                      {item.quantity}x {item.itemName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">₹{item.price * item.quantity}</span>
                  </div>
                </div>
                
                {/* Show replacement input if item is unavailable and order is still pending */}
                {order.status === 'PENDING' && itemStates[item.id]?.available === false && (
                  <div className="flex-1 max-w-sm">
                    <Input 
                      placeholder="Suggest replacement (e.g. Paneer Momos)" 
                      className="h-8 text-xs"
                      value={itemStates[item.id]?.replacement || ""}
                      onChange={(e) => handleReplacementChange(item.id, e.target.value)}
                    />
                  </div>
                )}

                {/* Show agreed replacement if already modified */}
                {order.status !== 'PENDING' && item.replacedWith && (
                  <div className="text-xs text-blue-600 font-medium">
                    Replaced with: {item.replacedWith}
                  </div>
                )}
              </div>
            ))}
          </div>

          {order.status === 'PENDING' && (
            <div className="mt-4 flex justify-end gap-3">
              <Button onClick={() => onUpdateStatus(order.id, 'CANCELLED')} variant="destructive" className="bg-red-600 hover:bg-red-700">
                Reject Full Order
              </Button>
              <Button onClick={handleApprove} className="bg-forest hover:bg-forest-soft text-white">
                {Object.values(itemStates).some(s => !s.available) ? "Send Modification Request" : "Approve Full Order"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
