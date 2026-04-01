"use client";

import { useState } from "react";
import { MapPin, Phone, Trash2, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Address } from "@/lib/features/addresses/addressesSlice";
import { useAppDispatch } from "@/lib/hooks";
import {
  setSelectedAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/features/addresses/addressesSlice";

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
}

export function AddressCard({ address, isSelected }: AddressCardProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelect = () => {
    dispatch(setSelectedAddress(address));
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteAddress(address._id)).unwrap();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete address:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    if (isSettingDefault || address.isDefault) return;

    setIsSettingDefault(true);
    try {
      await dispatch(setDefaultAddress(address._id)).unwrap();
    } catch (error) {
      console.error("Failed to set default address:", error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const formatAddress = () => {
    const parts = [
      address.address,
      address.ward,
      address.district,
      address.city,
      address.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? "border-primary ring-1 ring-primary/20"
          : "hover:border-muted-foreground/50"
      }`}
      onClick={handleSelect}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Selection indicator */}
          <div className="shrink-0 mt-0.5">
            {isSelected ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 bg-background" />
            )}
          </div>

          {/* Address content */}
          <div className="flex-1 min-w-0">
            {/* Header with default badge */}
            <div className="flex items-center gap-1.5 mb-2">
              {address.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Star className="h-2.5 w-2.5 mr-1" />
                  Default
                </span>
              )}
            </div>

            {/* Address details */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{formatAddress()}</p>
              </div>

              {address.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-foreground">{address.phone}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/50">
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault();
                  }}
                  disabled={isSettingDefault}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Set Default
                </Button>
              )}

              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base">
                      Delete Address
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      Are you sure you want to delete this address? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 sm:flex-none"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
