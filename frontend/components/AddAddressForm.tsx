"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/lib/hooks";
import {
  addAddress,
  updateAddress,
  Address,
  AddressFormData,
} from "@/lib/features/addresses/addressesSlice";
import { LocationMapPicker } from "@/components/LocationMapPicker";

interface AddAddressFormProps {
  address?: Address | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const provinces = [
  "Province 1",
  "Province 2",
  "Province 3",
  "Province 4",
  "Province 5",
  "Province 6",
  "Province 7",
];

const districts: Record<string, string[]> = {
  "Province 1": [
    "Bhotekholi",
    "Damak",
    "Dharan",
    "Itahari",
    "Ilam",
    "Khandbari",
    "Mechinagar",
    "Sundar Haraicha",
    "Triyuga",
    "Udayapur",
  ],
  "Province 2": [
    "Bara",
    "Birgunj",
    "Gaur",
    "Janakpur",
    "Kalaiya",
    "Lahan",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  "Province 3": [
    "Bhaktapur",
    "Chitwan",
    "Dolakha",
    "Dhulikhel",
    "Hetauda",
    "Kavrepalanchok",
    "Kathmandu",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasu",
    "Sindhuli",
    "Sindhupalchok",
  ],
  "Province 4": [
    "Baglung",
    "Besisahar",
    "Gandaki",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Parwat",
    "Pokhara",
    "Syangja",
    "Tanahu",
  ],
  "Province 5": [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Butwal",
    "Dang",
    "East Rukum",
    "Gulariya",
    "Kapilvastu",
    "Kohalpur",
    "Luwak",
    "Nawalparasi East",
    "Pyuthan",
    "Rolpa",
    "Rupandehi",
    "Salyan",
    "Sunsari",
    "West Rukum",
  ],
  "Province 6": [
    "Daulatpur",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Kalikot",
    "Mugu",
    "Salyan",
    "Surkhet",
    "Teligram",
    "Jumla",
    "Karnali",
  ],
  "Province 7": [
    "Achham",
    "Bajhang",
    "Bajura",
    "Betan",
    "Doti",
    "Dadeldhura",
    "Darchula",
    "Gorakhpur",
    "Kanchanpur",
    "Kailali",
    "Mahendranagar",
    "Pipaladi",
    "Tikapur",
  ],
};

export function AddAddressForm({
  address,
  onSuccess,
  onCancel,
}: AddAddressFormProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    address: address?.address || "",
    city: address?.city || "",
    district: address?.district || "",
    province: address?.province || "",
    ward: address?.ward || "",
    phone: address?.phone || "",
    isDefault: address?.isDefault || false,
    latitude: address?.latitude,
    longitude: address?.longitude,
    locationAddress: address?.locationAddress || "",
  });

  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(() => {
    if (address?.latitude && address?.longitude) {
      return {
        lat: address.latitude,
        lng: address.longitude,
        address: address.locationAddress || "",
      };
    }
    return null;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }
    if (!formData.province) {
      newErrors.province = "Province is required";
    }
    if (!formData.ward.trim()) {
      newErrors.ward = "Ward is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (address) {
        // Update existing address
        await dispatch(
          updateAddress({ id: address._id, addressData: formData }),
        ).unwrap();
      } else {
        // Add new address
        await dispatch(addAddress(formData)).unwrap();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: AddressFormData) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset district when province changes
    if (name === "province") {
      setFormData((prev: AddressFormData) => ({ ...prev, district: "" }));
    }
  };

  const selectedDistricts = formData.province
    ? districts[formData.province] || []
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? "Edit Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter street address"
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Province and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Province</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-sm text-destructive">{errors.province}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.province}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select District</option>
                {selectedDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-sm text-destructive">{errors.district}</p>
              )}
            </div>
          </div>

          {/* City and Ward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City/Municipality *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">Ward No. *</Label>
              <Input
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="e.g., Ward 1"
                className={errors.ward ? "border-destructive" : ""}
              />
              {errors.ward && (
                <p className="text-sm text-destructive">{errors.ward}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Location Map Picker */}
          <div className="space-y-2">
            <LocationMapPicker
              initialCoordinates={
                locationCoords
                  ? { lat: locationCoords.lat, lng: locationCoords.lng }
                  : undefined
              }
              onLocationSelect={(location) => {
                setLocationCoords({
                  lat: location.lat,
                  lng: location.lng,
                  address: location.address,
                });
                setFormData((prev) => ({
                  ...prev,
                  latitude: location.lat,
                  longitude: location.lng,
                  locationAddress: location.address,
                }));
              }}
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefault: checked as boolean,
                }))
              }
            />
            <Label htmlFor="isDefault" className="text-sm font-normal">
              Set as default address
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {address ? "Updating..." : "Adding..."}
                </>
              ) : address ? (
                "Update Address"
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
