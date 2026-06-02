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
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage only after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (query: string) => {
    try {
      const updated = recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase());
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length <= 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      const result = await dispatch(searchProducts(searchQuery));
      if (searchProducts.fulfilled.match(result)) {
        const products = Array.isArray(result.payload)
          ? result.payload
          : result.payload.products;
        setSearchResults(products);
        setShowResults(true);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearching(false);
    };
  }, [searchQuery, dispatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setShowResults(false);
      setShowRecentSearches(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setShowRecentSearches(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 2 && searchResults.length > 0) {
      setShowResults(true);
    } else if (searchQuery.length <= 2) {
      setShowRecentSearches(true);
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
                  placeholder="Search products, categories..."
                  className="w-full pl-10 pr-10 h-11 rounded-full border border-gray-300"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowRecentSearches(false);
                  }}
                  onFocus={handleInputFocus}
                  onBlur={() => {
                    setTimeout(() => setShowResults(false), 200);
                    setTimeout(() => setShowRecentSearches(false), 200);
                  }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {searchQuery.length > 0 && !isSearching && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowResults(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</p>
                </div>
                {recentSearches.map((query) => (
                  <div
                    key={query}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer group"
                  >
                    <div
                      className="flex items-center gap-2 flex-1"
                      onClick={() => handleRecentSearchClick(query)}
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{query}</span>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(query);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.slice(0, 5).map((product: Product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="flex items-center gap-3 p-3 hover:bg-muted"
                        onClick={() => setShowResults(false)}
                      >
                        <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Rs. {product.price.toLocaleString()}
                            </span>
                            {product.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="block p-3 text-center text-sm text-primary hover:bg-muted border-t"
                      onClick={() => {
                        setShowResults(false);
                        saveRecentSearch(searchQuery.trim());
                      }}
                    >
                      View all {searchResults.length} results
                    </Link>
                  </>
                ) : (
                  !isSearching && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No results for &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try searching for a category like &quot;Electronics&quot; or &quot;Clothing&quot;
                      </p>
                    </div>
                  )
                )}
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
                placeholder="Search products, categories..."
                className="w-full pl-10 pr-10 h-10 rounded-full border border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          {/* Mobile Recent Searches */}
          {searchQuery.length <= 2 && recentSearches.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
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
