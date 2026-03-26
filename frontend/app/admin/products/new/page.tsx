"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createProduct } from "@/lib/features/products/productsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Toys",
  "Beauty",
  "Food",
  "Other",
];

export default function NewProductPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.products);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.image) {
      toast.error("Please upload an image");
      return;
    }

    try {
      await dispatch(
        createProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image,
        }),
      ).unwrap();

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (err) {
      toast.error(error || "Failed to create product");
    }
  };

  // Show loading or check auth
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/products")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Fill in the details to create a new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs.) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image *</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs mx-auto rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePreview("");
                        setFormData((prev) => ({ ...prev, image: "" }));
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </label>
                      <p>SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
