import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import {
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  X,
  Home,
} from "lucide-react";
import { useProducts, useCategories } from "../hooks/useSupabaseData";
import ProductCard from "../components/product/ProductCard";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";

const GIFT_FOR = ["Him", "Her", "Kids", "Parents"];
const RATINGS = [4, 3, 2];
const DELIVERY = ["Same day", "1-2 days", "2-3 days", "3-4 days", "4-5 days"];

const OCCASIONS = [
  { id: "1", name: "Birthday" },
  { id: "2", name: "Anniversary" },
  { id: "3", name: "Wedding" },
  { id: "4", name: "Valentine" },
  { id: "5", name: "Eid" },
];

const FilterPanel = ({ filters, setFilters, resetFilters, categories }) => {
  const setCat = (c) =>
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  const setOcc = (o) =>
    setFilters((f) => ({
      ...f,
      occasions: f.occasions.includes(o)
        ? f.occasions.filter((x) => x !== o)
        : [...f.occasions, o],
    }));
  const setGiftFor = (g) =>
    setFilters((f) => ({
      ...f,
      giftFor: f.giftFor.includes(g)
        ? f.giftFor.filter((x) => x !== g)
        : [...f.giftFor, g],
    }));
  const setDelivery = (d) =>
    setFilters((f) => ({
      ...f,
      delivery: f.delivery.includes(d)
        ? f.delivery.filter((x) => x !== d)
        : [...f.delivery, d],
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-brand-dark">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-brand-pink hover:underline"
        >
          Reset All
        </button>
      </div>

      <FilterBlock title="Category">
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-brand-pink"
            >
              <Checkbox
                checked={filters.categories.includes(cat.id)}
                onCheckedChange={() => setCat(cat.id)}
                className="data-[state=checked]:bg-brand-pink data-[state=checked]:border-brand-pink"
              />
              <span className="flex-1">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.count || 0}</span>
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Price Range">
        <Slider
          min={0}
          max={5000}
          step={100}
          value={filters.price}
          onValueChange={(v) => setFilters((f) => ({ ...f, price: v }))}
          className="my-4"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-1 bg-brand-pink/10 text-brand-pink font-semibold rounded">
            ৳{filters.price[0]}
          </span>
          <span className="text-gray-400">to</span>
          <span className="px-2 py-1 bg-brand-pink/10 text-brand-pink font-semibold rounded">
            ৳{filters.price[1]}
          </span>
        </div>
      </FilterBlock>

      <FilterBlock title="Occasion">
        <div className="space-y-2">
          {OCCASIONS.map((o) => (
            <label
              key={o.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-brand-pink"
            >
              <Checkbox
                checked={filters.occasions.includes(o.name)}
                onCheckedChange={() => setOcc(o.name)}
                className="data-[state=checked]:bg-brand-pink data-[state=checked]:border-brand-pink"
              />
              {o.name}
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Gift For">
        <div className="flex flex-wrap gap-2">
          {GIFT_FOR.map((g) => (
            <button
              key={g}
              onClick={() => setGiftFor(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border ${filters.giftFor.includes(g) ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-gray-700 border-gray-200 hover:border-brand-pink"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Rating">
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-brand-pink"
            >
              <Checkbox
                checked={filters.rating === r}
                onCheckedChange={() =>
                  setFilters((f) => ({ ...f, rating: f.rating === r ? 0 : r }))
                }
                className="data-[state=checked]:bg-brand-pink data-[state=checked]:border-brand-pink"
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < r
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="ml-1 text-xs">& above</span>
              </span>
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Delivery Time">
        <div className="space-y-2">
          {DELIVERY.map((d) => (
            <label
              key={d}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-brand-pink"
            >
              <Checkbox
                checked={filters.delivery.includes(d)}
                onCheckedChange={() => setDelivery(d)}
                className="data-[state=checked]:bg-brand-pink data-[state=checked]:border-brand-pink"
              />
              {d}
            </label>
          ))}
        </div>
      </FilterBlock>
    </div>
  );
};

const FilterBlock = ({ title, children }) => (
  <div className="pb-4 border-b border-gray-100">
    <h4 className="font-semibold text-sm text-brand-dark mb-3">{title}</h4>
    {children}
  </div>
);

const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
      >
        <div className="aspect-square bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const ProductList = () => {
  const [params] = useSearchParams();
  const { slug } = useParams();
  const keyword = params.get("q") || "";
  const categoryParam = params.get("category"); // Added robust search param listener
  const occasionParam = params.get("occasion");
  const saleParam = params.get("sale"); // "true" = show only items on sale (≥25% off)

  // LIVE HOOKS
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const PER_PAGE = 12;

  const loading = productsLoading || categoriesLoading || transitionLoading;

  // Intelligent URL Parser: Handles both slug parameters and query string entries
  const parsedCategoryTarget = useMemo(() => {
    if (categoriesLoading) return null;
    const target = slug || categoryParam;
    if (!target) return null;

    // Find match by checking both ID or slug configurations perfectly
    const matchedCat = categories.find(
      (c) =>
        c.slug === target ||
        c.id === target ||
        c.slug
          .replace("-bakery", "")
          .replace("-bouquets", "")
          .replace("-sweets", "")
          .replace("-accessories", "") === target,
    );
    return matchedCat ? matchedCat.id : null;
  }, [slug, categoryParam, categories, categoriesLoading]);

  const initialFilters = {
    categories: parsedCategoryTarget ? [parsedCategoryTarget] : [],
    occasions: occasionParam ? [occasionParam] : [],
    giftFor: [],
    rating: 0,
    delivery: [],
    price: [0, 5000],
  };
  const [filters, setFilters] = useState(initialFilters);

  // Sync state cleanly when database collections finish transferring
  useEffect(() => {
    if (!categoriesLoading) {
      setFilters((prev) => ({
        ...prev,
        categories: parsedCategoryTarget ? [parsedCategoryTarget] : [],
        occasions: occasionParam ? [occasionParam] : prev.occasions,
      }));
      setPage(1);
    }
  }, [parsedCategoryTarget, occasionParam, categoriesLoading]);

  useEffect(() => {
    if (productsLoading || categoriesLoading) return;
    setTransitionLoading(true);
    const t = setTimeout(() => setTransitionLoading(false), 400);
    return () => clearTimeout(t);
  }, [filters, sort, page, productsLoading, categoriesLoading]);

  const filtered = useMemo(() => {
    let arr = [...products];
    if (saleParam === "true") {
      arr = arr.filter(
        (p) => (p.discountPercent || p.discount_percent || 0) >= 25,
      );
    }
    if (keyword) {
      const k = keyword.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(k) ||
          (p.short_description || p.shortDescription || "")
            .toLowerCase()
            .includes(k),
      );
    }

    // Robust category matching logic against database items
    if (filters.categories.length) {
      arr = arr.filter((p) => {
        const productCat = p.category ? p.category.toLowerCase() : "";
        return filters.categories.some((filterCat) => {
          const targetCat = filterCat.toLowerCase();
          return (
            productCat === targetCat ||
            productCat.includes(targetCat) ||
            targetCat.includes(productCat)
          );
        });
      });
    }

    if (filters.occasions.length)
      arr = arr.filter((p) =>
        (p.occasion || []).some((o) => filters.occasions.includes(o)),
      );
    if (filters.giftFor.length)
      arr = arr.filter((p) =>
        (p.giftFor || p.gift_for || []).some((g) =>
          filters.giftFor.includes(g),
        ),
      );
    if (filters.rating)
      arr = arr.filter((p) => (p.rating || 0) >= filters.rating);
    if (filters.delivery.length)
      arr = arr.filter((p) =>
        filters.delivery.includes(p.deliveryTime || p.delivery_time),
      );

    arr = arr.filter((p) => {
      const priceToCheck = p.discountPrice || p.price || 0;
      return (
        priceToCheck >= filters.price[0] && priceToCheck <= filters.price[1]
      );
    });

    switch (sort) {
      case "newest":
        arr.sort((a, b) =>
          String(b.created_at || b.id).localeCompare(
            String(a.created_at || a.id),
          ),
        );
        break;
      case "low":
        arr.sort(
          (a, b) =>
            (a.discountPrice || a.price || 0) -
            (b.discountPrice || b.price || 0),
        );
        break;
      case "high":
        arr.sort(
          (a, b) =>
            (b.discountPrice || b.price || 0) -
            (a.discountPrice || a.price || 0),
        );
        break;
      case "rating":
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
      default:
        arr.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
    }
    return arr;
  }, [filters, sort, keyword, saleParam, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () =>
    setFilters({
      categories: [],
      occasions: [],
      giftFor: [],
      rating: 0,
      delivery: [],
      price: [0, 5000],
    });

  const categoryName = useMemo(() => {
    if (categoriesLoading) return "Loading...";
    const targetId = filters.categories[0];
    if (!targetId) return "All Products";
    const found = categories.find((c) => c.id === targetId);
    return found ? found.name : "All Products";
  }, [filters.categories, categories, categoriesLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-brand-pink">
          Products
        </Link>
        {(slug || filters.categories.length > 0) && (
          <>
            <ChevronRight size={14} />
            <span className="text-brand-dark font-medium">{categoryName}</span>
          </>
        )}
        {keyword && (
          <>
            <ChevronRight size={14} />
            <span className="text-brand-dark font-medium">"{keyword}"</span>
          </>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-44 bg-white rounded-2xl border border-gray-100 p-5">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              categories={categories}
            />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-brand-dark">
                {keyword
                  ? `Results for "${keyword}"`
                  : saleParam === "true"
                    ? "Flash Sale Offers"
                    : categoryName}
              </h1>
              <p className="text-sm text-gray-500">
                {filtered.length} products found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium">
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel
                      filters={filters}
                      setFilters={setFilters}
                      resetFilters={resetFilters}
                      categories={categories}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="low">Price: Low to High</SelectItem>
                  <SelectItem value="high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 ${view === "grid" ? "bg-brand-pink text-white" : "text-gray-500"}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 ${view === "list" ? "bg-brand-pink text-white" : "text-gray-500"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {filters.categories.length +
            filters.occasions.length +
            filters.giftFor.length +
            filters.delivery.length +
            (filters.rating ? 1 : 0) >
            0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.categories.map((c) => {
                const cat = categories.find((x) => x.id === c);
                return (
                  <Chip
                    key={c}
                    label={cat?.name || c}
                    onRemove={() =>
                      setFilters((f) => ({
                        ...f,
                        categories: f.categories.filter((x) => x !== c),
                      }))
                    }
                  />
                );
              })}
              {filters.occasions.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  onRemove={() =>
                    setFilters((f) => ({
                      ...f,
                      occasions: f.occasions.filter((x) => x !== o),
                    }))
                  }
                />
              ))}
              {filters.giftFor.map((g) => (
                <Chip
                  key={g}
                  label={`For ${g}`}
                  onRemove={() =>
                    setFilters((f) => ({
                      ...f,
                      giftFor: f.giftFor.filter((x) => x !== g),
                    }))
                  }
                />
              ))}
              {filters.delivery.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  onRemove={() =>
                    setFilters((f) => ({
                      ...f,
                      delivery: f.delivery.filter((x) => x !== d),
                    }))
                  }
                />
              ))}
              {filters.rating > 0 && (
                <Chip
                  label={`${filters.rating}★ & up`}
                  onRemove={() => setFilters((f) => ({ ...f, rating: 0 }))}
                />
              )}
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : paged.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-lg font-semibold text-brand-dark mb-2">
                No products found
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your filters
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-brand-gradient text-white rounded-full font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {paged.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paged.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="flex gap-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-pink/30 hover:shadow-brand p-3"
                >
                  <img
                    src={p.thumbnail || p.image}
                    alt={p.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-brand-dark line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {p.short_description || p.shortDescription || ""}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-0.5 bg-brand-pink/10 px-1.5 py-0.5 rounded">
                        <Star
                          size={12}
                          className="text-brand-pink fill-brand-pink"
                        />
                        <span className="font-semibold text-brand-pink">
                          {p.rating || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({p.numReviews || p.num_reviews || 0})
                      </span>
                      <span className="text-xs text-gray-400">
                        • by{" "}
                        {p.seller?.shop_name ||
                          p.sellerName ||
                          "Verified Seller"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-xl font-bold text-brand-pink">
                        ৳{p.discountPrice || p.price}
                      </span>
                      {(p.discountPercent > 0 || p.discount_percent > 0) && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ৳{p.price}
                          </span>
                          <span className="text-xs font-bold text-brand-pink">
                            -{p.discountPercent || p.discount_percent}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-brand-pink hover:text-brand-pink"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-semibold ${page === i + 1 ? "bg-brand-gradient text-white shadow-brand" : "border border-gray-200 hover:border-brand-pink hover:text-brand-pink"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-brand-pink hover:text-brand-pink"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Chip = ({ label, onRemove }) => (
  <button
    onClick={onRemove}
    className="flex items-center gap-1.5 px-3 py-1 bg-brand-pink/10 text-brand-pink text-xs font-semibold rounded-full hover:bg-brand-pink hover:text-white"
  >
    {label} <X size={12} />
  </button>
);

export default ProductList;
