"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsAddingNew(false);
  };

  const handleSuccess = () => {
    setIsAddingNew(false);
    setEditingAddress(null);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!isAddingNew && !editingAddress && (
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingAddress) && (
        <div className="mb-6">
          <AddAddressForm
            address={editingAddress}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !isAddingNew ? (
        <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
          <p className="text-muted-foreground mb-4">
            Add an address to get started with checkout
          </p>
          <Button onClick={handleAddNew}>Add Your First Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              isSelected={selectedAddress?._id === address._id}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Selection Info */}
      {selectedAddress && (
        <div className="bg-muted/30 rounded-lg p-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Selected shipping address:{" "}
            <span className="font-medium text-foreground">
              {selectedAddress.address}, {selectedAddress.city},{" "}
              {selectedAddress.province}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
