"use client";

import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/AddressCard";
import { AddAddressForm } from "@/components/AddAddressForm";
import { Address } from "@/lib/features/addresses/addressesSlice";

interface AddressListProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
}

export function AddressList({
  addresses,
  selectedAddress,
  onSelectAddress,
}: AddressListProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSuccess = () => {
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved Addresses</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Choose from your saved addresses or add a new one
          </p>
        </div>
        {/* {!isAddingNew && (
          <Button onClick={handleAddNew} size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add New Address
          </Button>
        )} */}
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border animate-fade-in">
          <AddAddressForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !isAddingNew ? (
        <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/20">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-2">No addresses yet</h3>
          <p className="text-muted-foreground text-xs mb-4">
            Add an address to get started with checkout
          </p>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              isSelected={selectedAddress?._id === address._id}
            />
          ))}
        </div>
      )}

      {/* Selection Info */}
      {selectedAddress && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 mt-3 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Selected shipping address:
              </p>
              <p className="font-medium text-foreground">
                {selectedAddress.address}, {selectedAddress.city},{" "}
                {selectedAddress.province}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
