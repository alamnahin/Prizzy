import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Heart, Star, Truck, ShieldCheck, RotateCcw, Minus, Plus, ShoppingBag, Zap, BadgeCheck, Store } from 'lucide-react';
import { getProductBySlug, products, mockReviews } from '../mock';
import ProductCard from '../components/product/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useCart } from '../context/CartContext';
import { toast } from '../hooks/use-toast';
import NotFound from './NotFound';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = getProductBySlug(slug);
  const { addToCart, toggleWishlist, inWishlist } = useCart();

  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalMsg, setPersonalMsg] = useState('');
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  if (!product) return <NotFound />;

  const wished = inWishlist(product.id);
  const allImages = product.images.length > 1 ? product.images : [product.thumbnail, product.thumbnail, product.thumbnail];
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = mockReviews.filter(r => r.productId === product.id);
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({ stars, count: stars === 5 ? 180 : stars === 4 ? 50 : stars === 3 ? 12 : 4 }));
  const totalReviewCount = ratingBreakdown.reduce((s, r) => s + r.count, 0);

  const handleAdd = () => {
    addToCart(product, quantity, personalMsg);
    toast({ title: '🛍️ Added to cart', description: `${product.name} × ${quantity}` });
  };
  const handleBuyNow = () => {
    addToCart(product, quantity, personalMsg);
    navigate('/checkout');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
        <Link to="/" className="flex items-center hover:text-brand-pink"><Home size={14} /></Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-brand-pink">Products</Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
          >
            <img
              src={allImages[selectedImg]}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{
                transform: zoom.active ? 'scale(1.8)' : 'scale(1)',
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
                transition: 'transform 0.2s ease',
              }}
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-brand-pink text-white text-sm font-bold px-3 py-1.5 rounded-md shadow">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${selectedImg === i ? 'border-brand-pink' : 'border-gray-200 hover:border-brand-pink/50'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
              ))}
              <span className="ml-1 font-bold text-brand-dark text-sm">{product.rating}</span>
            </div>
            <a href="#reviews" className="text-sm text-gray-500 hover:text-brand-pink">{product.numReviews} reviews</a>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{product.sold}+ sold</span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-3 mt-4 bg-brand-gradient-soft rounded-xl px-4 py-3">
            <img src={product.seller.shopLogo} alt={product.seller.shopName} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-brand-dark">{product.seller.shopName}</span>
                {product.seller.verified && <BadgeCheck size={14} className="text-brand-pink" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Star size={11} className="text-yellow-500 fill-yellow-500" /> {product.seller.rating} • {product.seller.products} products
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-pink text-xs font-semibold rounded-full hover:bg-brand-pink hover:text-white">
              <Store size={12} /> Visit Shop
            </button>
          </div>

          {/* Price */}
          <div className="mt-5 p-5 bg-gradient-to-r from-brand-pink/5 to-brand-purple/5 rounded-2xl border border-brand-pink/10">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-extrabold text-brand-pink">৳{product.discountPrice.toLocaleString()}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                  <span className="px-2 py-1 bg-brand-pink text-white text-xs font-bold rounded-md">SAVE ৳{(product.price - product.discountPrice).toLocaleString()}</span>
                </>
              )}
            </div>
            <p className={`text-sm font-semibold mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
            </p>
          </div>

          {/* Occasion tags */}
          {product.occasion.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-brand-dark mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {product.occasion.map(o => (
                  <Link key={o} to={`/products?occasion=${o}`} className="px-3 py-1.5 bg-white border border-brand-pink/30 text-brand-pink text-xs font-semibold rounded-full hover:bg-brand-pink hover:text-white">
                    {o}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Personal message */}
          {product.isCustomizable && (
            <div className="mt-5">
              <label className="text-sm font-semibold text-brand-dark mb-2 block">Personal Message (optional)</label>
              <textarea
                value={personalMsg}
                onChange={(e) => setPersonalMsg(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="e.g. Happy Birthday, my love!"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-brand-pink text-sm"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{personalMsg.length}/200</p>
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-brand-pink/10 text-brand-dark"><Minus size={16} /></button>
              <span className="px-5 font-bold text-brand-dark">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-brand-pink/10 text-brand-dark"><Plus size={16} /></button>
            </div>
            <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-brand-pink text-brand-pink font-bold rounded-full hover:bg-brand-pink hover:text-white">
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient text-white font-bold rounded-full hover:opacity-90 shadow-brand">
              <Zap size={18} /> Buy Now
            </button>
          </div>

          <button onClick={() => toggleWishlist(product.id)} className={`mt-4 flex items-center gap-2 text-sm font-semibold ${wished ? 'text-brand-pink' : 'text-gray-600 hover:text-brand-pink'}`}>
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} /> {wished ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Delivery info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info icon={Truck} title="Delivery" desc={product.deliveryTime} />
            <Info icon={ShieldCheck} title="Secure Payment" desc="100% protected" />
            <Info icon={RotateCcw} title="Easy Returns" desc="7-day policy" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
            <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-pink data-[state=active]:border-b-2 data-[state=active]:border-brand-pink rounded-none px-4 py-3 font-semibold">Description</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-pink data-[state=active]:border-b-2 data-[state=active]:border-brand-pink rounded-none px-4 py-3 font-semibold">Reviews ({product.numReviews})</TabsTrigger>
            <TabsTrigger value="seller" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-pink data-[state=active]:border-b-2 data-[state=active]:border-brand-pink rounded-none px-4 py-3 font-semibold">Seller Info</TabsTrigger>
            <TabsTrigger value="return" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-pink data-[state=active]:border-b-2 data-[state=active]:border-brand-pink rounded-none px-4 py-3 font-semibold">Return Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 text-gray-700 leading-relaxed">
            <p className="mb-4">{product.shortDescription}</p>
            <p>Delight your loved ones with this thoughtfully curated gift. Each item from Prizzy is hand-picked, beautifully packaged, and delivered with care. Whether it's for a birthday, anniversary, wedding, or just a moment to say "I love you", this gift is sure to make a lasting impression.</p>
            <h4 className="font-bold text-brand-dark mt-5 mb-2">Specifications</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-500 w-1/3">Category</td><td className="py-2 font-medium text-brand-dark">{product.category}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Delivery Time</td><td className="py-2 font-medium text-brand-dark">{product.deliveryTime}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Customizable</td><td className="py-2 font-medium text-brand-dark">{product.isCustomizable ? 'Yes — add personal message' : 'No'}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Sold by</td><td className="py-2 font-medium text-brand-dark">{product.seller.shopName}</td></tr>
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="reviews" id="reviews" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-brand-gradient-soft rounded-2xl p-6 text-center">
                <div className="text-5xl font-extrabold text-gradient">{product.rating}</div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} className={i < Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}
                </div>
                <p className="text-sm text-gray-600 mt-2">{product.numReviews} reviews</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                {ratingBreakdown.map(r => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <span className="text-xs w-6 text-gray-600 font-semibold">{r.stars}★</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gradient" style={{ width: `${(r.count / totalReviewCount) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {reviews.length > 0 ? reviews.map(r => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">{r.user[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-dark text-sm">{r.user}</span>
                        {r.verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Verified Purchase</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}
                        <span className="text-xs text-gray-400 ml-1">{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-3">{r.comment}</p>
                </div>
              )) : <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>}
            </div>
          </TabsContent>

          <TabsContent value="seller" className="mt-6">
            <div className="flex items-start gap-5 bg-white border border-gray-100 rounded-2xl p-6">
              <img src={product.seller.shopLogo} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-pink/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-brand-dark">{product.seller.shopName}</h3>
                  {product.seller.verified && <BadgeCheck size={18} className="text-brand-pink" />}
                </div>
                <p className="text-sm text-gray-500">{product.seller.category}</p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Stat label="Rating" value={`${product.seller.rating}★`} />
                  <Stat label="Products" value={product.seller.products} />
                  <Stat label="Sales" value={`${product.seller.sales}+`} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="return" className="mt-6 text-gray-700 leading-relaxed space-y-3">
            <h4 className="font-bold text-brand-dark">7-Day Easy Returns</h4>
            <p>If you're not happy with your purchase, you can return it within 7 days of delivery for a full refund or replacement. Items must be unused and in original packaging.</p>
            <h4 className="font-bold text-brand-dark mt-4">Non-returnable Items</h4>
            <p>Customized items, fresh flowers, perishable food items (cakes), and personalized gifts cannot be returned unless damaged on arrival.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      <div className="mt-14">
        <h2 className="text-2xl font-extrabold text-brand-dark mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, title, desc }) => (
  <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
    <div className="w-9 h-9 rounded-lg bg-brand-gradient-soft flex items-center justify-center"><Icon size={16} className="text-brand-pink" /></div>
    <div>
      <p className="text-xs font-bold text-brand-dark">{title}</p>
      <p className="text-[11px] text-gray-500">{desc}</p>
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xl font-extrabold text-gradient">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export default ProductDetail;
