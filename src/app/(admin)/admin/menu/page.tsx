"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, Star, Utensils, Tag, Loader2, Search } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  image?: string;
  isVeg: boolean;
  isSignature: boolean;
  isActive: boolean;
  categoryId: string;
  category?: Category;
}

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  // Add/Edit Product Modal State
  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    data: Partial<Product>;
  }>({
    isOpen: false,
    mode: "add",
    data: { isVeg: true, isSignature: false, isActive: true },
  });

  // Add Category Modal State
  const [catModal, setCatModal] = useState<{
    isOpen: boolean;
    name: string;
    description: string;
    image: string;
  }>({ isOpen: false, name: "", description: "", image: "" });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/menu");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    const nextState = !product.isActive;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: nextState } : p))
    );

    try {
      const res = await fetch(`/api/admin/menu/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      if (res.ok) {
        toast.success(
          `${product.name} is now ${nextState ? "Available 🟢" : "Out of Stock 🔴"}`
        );
      } else {
        fetchData(); // Rollback
        toast.error("Failed to update status");
      }
    } catch {
      fetchData();
      toast.error("Network error");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = itemModal.data;

    if (!d.name || !d.categoryId || d.price === undefined) {
      toast.error("Name, Category, and Price are required");
      return;
    }

    setSaving(true);
    try {
      const url =
        itemModal.mode === "add" ? "/api/admin/menu" : `/api/admin/menu/${d.id}`;
      const method = itemModal.mode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });

      if (res.ok) {
        toast.success(
          itemModal.mode === "add" ? "Item added to menu!" : "Item updated!"
        );
        setItemModal({ isOpen: false, mode: "add", data: { isVeg: true, isActive: true } });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save item");
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted ${name}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Failed to delete item");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catModal.name) {
      toast.error("Category name required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catModal.name,
          description: catModal.description,
          image: catModal.image,
        }),
      });

      if (res.ok) {
        toast.success("Category added!");
        setCatModal({ isOpen: false, name: "", description: "", image: "" });
        fetchData();
      } else {
        toast.error("Failed to create category");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId === "ALL" || p.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#10261B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#10261B]">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add items, update prices, toggle availability in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCatModal({ isOpen: true, name: "", description: "", image: "" })}
            className="border-[#10261B]/20 text-[#10261B] hover:bg-[#10261B]/5 text-xs sm:text-sm"
          >
            <Tag className="w-4 h-4 mr-1.5" /> + Category
          </Button>
          <Button
            onClick={() =>
              setItemModal({
                isOpen: true,
                mode: "add",
                data: {
                  isVeg: true,
                  isSignature: false,
                  isActive: true,
                  categoryId: categories[0]?.id || "",
                },
              })
            }
            className="bg-[#10261B] text-white hover:bg-[#10261B]/90 text-xs sm:text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-gray-200">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategoryId("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryId === "ALL"
                  ? "bg-[#10261B] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategoryId === c.id
                      ? "bg-[#10261B] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`border transition-all shadow-xs ${
              !product.isActive ? "bg-red-50/40 border-red-200 opacity-75" : "bg-white border-gray-200 hover:border-[#D9A441]/50"
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                {product.image ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 border">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border">
                    <Utensils className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`w-3 h-3 rounded-full border-2 inline-block ${
                        product.isVeg ? "border-green-600 bg-green-600" : "border-red-600 bg-red-600"
                      }`}
                      title={product.isVeg ? "Vegetarian" : "Non-Veg"}
                    />
                    <h3 className="font-bold text-base text-[#10261B] truncate">{product.name}</h3>
                    {product.isSignature && (
                      <Badge className="bg-[#D9A441] text-[#10261B] text-[10px] px-1.5 py-0">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-[#10261B]" /> Signature
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {product.description || product.category?.name}
                  </p>
                  <p className="font-bold text-sm text-[#10261B] mt-1">₹{product.price}</p>
                </div>
              </div>

              {/* Status Switcher & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={() => handleToggleAvailability(product)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span
                    className={`font-semibold ${
                      product.isActive ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {product.isActive ? "Available" : "Out of Stock"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:text-[#10261B]"
                    onClick={() =>
                      setItemModal({
                        isOpen: true,
                        mode: "edit",
                        data: { ...product },
                      })
                    }
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Item Modal (Add / Edit) */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-serif text-[#10261B]">
              {itemModal.mode === "add" ? "Add New Menu Item" : "Edit Menu Item"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Item Name *</Label>
                <Input
                  required
                  placeholder="e.g. Cheese Burst Pizza"
                  value={itemModal.data.name || ""}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, name: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Category *</Label>
                  <select
                    required
                    value={itemModal.data.categoryId || ""}
                    onChange={(e) =>
                      setItemModal({
                        ...itemModal,
                        data: { ...itemModal.data, categoryId: e.target.value },
                      })
                    }
                    className="w-full border rounded-md h-10 px-3 text-sm"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Price (₹) *</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    placeholder="199"
                    value={itemModal.data.price ?? ""}
                    onChange={(e) =>
                      setItemModal({
                        ...itemModal,
                        data: { ...itemModal.data, price: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <textarea
                  className="w-full border rounded-md p-2.5 text-sm min-h-[70px]"
                  placeholder="Ingredients, prep details..."
                  value={itemModal.data.description || ""}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, description: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Image URL (Unsplash or hosted)</Label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={itemModal.data.image || ""}
                  onChange={(e) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, image: e.target.value },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <span className="font-semibold text-xs">Vegetarian</span>
                <Switch
                  checked={itemModal.data.isVeg ?? true}
                  onCheckedChange={(v) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, isVeg: v },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-xs">Signature / Bestseller Tag</span>
                <Switch
                  checked={itemModal.data.isSignature ?? false}
                  onCheckedChange={(v) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, isSignature: v },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-xs">Currently Available</span>
                <Switch
                  checked={itemModal.data.isActive ?? true}
                  onCheckedChange={(v) =>
                    setItemModal({
                      ...itemModal,
                      data: { ...itemModal.data, isActive: v },
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setItemModal({ isOpen: false, mode: "add", data: {} })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#10261B] text-white hover:bg-[#10261B]/90"
                >
                  {saving ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-serif text-[#10261B]">Add Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Name *</Label>
                <Input
                  required
                  placeholder="e.g. Beverages"
                  value={catModal.name}
                  onChange={(e) => setCatModal({ ...catModal, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                  placeholder="Short category description"
                  value={catModal.description}
                  onChange={(e) => setCatModal({ ...catModal, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCatModal({ isOpen: false, name: "", description: "", image: "" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-[#10261B] text-white">
                  {saving ? "Saving..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
