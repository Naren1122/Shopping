"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceFilterProps {
  products: Array<{ price?: number }>;
  onPriceFilter: (min: number, max: number) => void;
}

export function PriceFilter({ products, onPriceFilter }: PriceFilterProps) {
  // Calculate price range from products safely
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products
      .map((p) => p.price)
      .filter((p): p is number => p !== undefined && p !== null && !isNaN(p));

    if (prices.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [products]);

  const [priceValues, setPriceValues] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);
  const [inputMin, setInputMin] = useState<number>(minPrice);
  const [inputMax, setInputMax] = useState<number>(maxPrice);

  const handleSliderChange = (value: number[]) => {
    setPriceValues([value[0], value[1]]);
    setInputMin(value[0]);
    setInputMax(value[1]);
  };

  const handleApply = () => {
    onPriceFilter(inputMin, inputMax);
  };

  const handleClear = () => {
    setPriceValues([minPrice, maxPrice]);
    setInputMin(minPrice);
    setInputMax(maxPrice);
    onPriceFilter(minPrice, maxPrice);
  };

  // If only one product or same min/max, don't show filter
  if (minPrice === maxPrice || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-card">
      <Label className="text-sm font-medium">Price Range</Label>

      {/* Slider */}
      <Slider
        value={priceValues}
        onValueChange={handleSliderChange}
        min={minPrice}
        max={maxPrice}
        step={100}
        className="w-full"
      />

      {/* Price Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            value={inputMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              setInputMin(isNaN(val) ? minPrice : val);
            }}
            placeholder="Min"
            className="h-8 text-sm"
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex-1">
          <Input
            type="number"
            value={inputMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              setInputMax(isNaN(val) ? maxPrice : val);
            }}
            placeholder="Max"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Price Display */}
      <p className="text-xs text-center text-muted-foreground">
        Rs. {inputMin.toLocaleString()} - Rs. {inputMax.toLocaleString()}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex-1 text-xs"
        >
          Clear
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1 text-xs">
          Apply
        </Button>
      </div>
    </div>
  );
}
