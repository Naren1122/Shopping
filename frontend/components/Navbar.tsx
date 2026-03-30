"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { searchProducts, Product } from "@/lib/features/products/productsSlice";

const categories = [
  { name: "Electronics", icon: "📱", slug: "Electronics" },
  { name: "Clothing", icon: "👕", slug: "Clothing" },
  { name: "Books", icon: "📚", slug: "Books" },
  { name: "Home & Garden", icon: "🏠", slug: "Home & Garden" },
  { name: "Sports", icon: "⚽", slug: "Sports" },
  { name: "Toys", icon: "🎮", slug: "Toys" },
  { name: "Beauty", icon: "💄", slug: "Beauty" },
  { name: "Food", icon: "🍕", slug: "Food" },
];

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const result = await dispatch(searchProducts(query));
      if (searchProducts.fulfilled.match(result)) {
        setSearchResults(result.payload);
        setShowResults(true);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md py-2"
          : "bg-background py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-20 h-14 rounded-xl overflow-hidden bg-white">
              <img
                src="/bazarrr.png"
                alt="Bazar"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 h-11 rounded-full border border-gray-300"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowResults(true)
                  }
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
              </div>
            </form>
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden">
                {searchResults.slice(0, 5).map((product: Product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="w-20 h-10 rounded bg-muted overflow-hidden shrink-0">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/products?search=${encodeURIComponent(searchQuery)}`}
                  className="block p-3 text-center text-sm text-primary hover:bg-muted"
                  onClick={() => setShowResults(false)}
                >
                  View all results
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Categories Dropdown - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex gap-1"
                >
                  Shop
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.slug}
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={`/products?category=${cat.slug}`}>
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.role === "admin" ? (
                    <DropdownMenuItem>
                      <Link href="/admin" className="w-full">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link href="/dashboard" className="w-full">
                          My Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/orders" className="w-full">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/wishlist" className="w-full">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/recommendations" className="w-full">
                          Recommendations
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Link href="/logout" className="w-full">
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex gap-2 items-center">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 h-10 rounded-full border border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block py-2 px-3 rounded-lg hover:bg-muted"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="block py-2 px-3 rounded-lg hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
