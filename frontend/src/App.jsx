import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Star,
  ChevronRight,
  Check,
  ArrowRightLeft,
  Search,
  Plus,
  ArrowLeft,
  Upload,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Laptop
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const COMMON_BRANDS = [
  'Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Samsung', 'Microsoft', 'Razer', 'Gigabyte'
];

const SPEC_RANGES = [
  'Entry-Level / Budget',
  'Mid-Range / Office',
  'High-End / Gaming',
  'Premium / Workstation'
];

const COMMON_OS = [
  'Windows 11', 'Windows 10', 'macOS', 'Linux', 'ChromeOS', 'No OS / FreeDOS'
];

function App() {
  const [laptops, setLaptops] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'detail' | 'add'
  const [selectedLaptop, setSelectedLaptop] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Alerts
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filters State
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterSpecRange, setFilterSpecRange] = useState('All');
  const [sortBy, setSortBy] = useState('none');

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [specRange, setSpecRange] = useState('Mid-Range / Office');
  const [processor, setProcessor] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('16');
  const [storage, setStorage] = useState('512GB SSD');
  const [screenSize, setScreenSize] = useState('15.6 inch');
  const [os, setOs] = useState('Windows 11');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchLaptops();
  }, []);

  const fetchLaptops = async (query = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = query
        ? `${API_BASE_URL}/api/laptops?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/laptops`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch laptops');
      }
      const data = await response.json();
      setLaptops(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to database. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchedTerm(searchInput.trim());
    fetchLaptops(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchedTerm('');
    fetchLaptops('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!brand.trim()) {
      setFormError('Please enter a laptop brand.');
      return;
    }
    if (!model.trim()) {
      setFormError('Please enter a laptop model/name.');
      return;
    }
    if (!price || isNaN(price) || parseFloat(price) < 0) {
      setFormError('Please enter a valid laptop price.');
      return;
    }

    const formData = new FormData();
    formData.append('brand', brand.trim());
    formData.append('model', model.trim());
    formData.append('price', parseFloat(price));
    formData.append('spec_range', specRange);

    if (processor.trim()) formData.append('processor', processor.trim());
    if (ram) formData.append('ram', parseInt(ram));
    if (storage.trim()) formData.append('storage', storage.trim());
    if (gpu.trim()) formData.append('gpu', gpu.trim());
    if (screenSize.trim()) formData.append('screen_size', screenSize.trim());
    if (os.trim()) formData.append('os', os.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (image) formData.append('image', image);

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/laptops`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save laptop.');
      }

      const createdLaptop = await response.json();
      setSuccessMessage(`Successfully saved "${brand} ${model}" into the database!`);
      resetForm();
      await fetchLaptops();

      // Auto open detail view of the newly added laptop!
      setSelectedLaptop(createdLaptop);
      setSelectedImage(0);
      setCurrentView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setPrice('');
    setSpecRange('Mid-Range / Office');
    setProcessor('');
    setGpu('');
    setRam('16');
    setStorage('512GB SSD');
    setScreenSize('15.6 inch');
    setOs('Windows 11');
    setDescription('');
    setImage(null);
    setImagePreview(null);
    setFormError(null);
  };

  const handlePreFill = () => {
    resetForm();
    setModel(searchedTerm);
    const words = searchedTerm.trim().split(' ');
    if (words.length > 0) {
      const matchedBrand = COMMON_BRANDS.find(b => b.toLowerCase() === words[0].toLowerCase());
      if (matchedBrand) {
        setBrand(matchedBrand);
        setModel(words.slice(1).join(' '));
      }
    }
    setCurrentView('add');
  };

  // Unique brands list for filters
  const uniqueBrands = ['All', ...new Set(laptops.map(l => l.brand))].sort();

  // Filters logic
  const filteredLaptops = laptops
    .filter(laptop => {
      const brandMatch = filterBrand === 'All' || laptop.brand === filterBrand;
      const specMatch = filterSpecRange === 'All' || laptop.spec_range === filterSpecRange;
      return brandMatch && specMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'ram-high') return (b.ram || 0) - (a.ram || 0);
      return 0;
    });

  // Calculate Metrics
  const totalCount = laptops.length;
  const avgPrice = totalCount > 0 ? laptops.reduce((sum, l) => sum + l.price, 0) / totalCount : 0;
  const highEndCount = laptops.filter(l => l.spec_range && (l.spec_range.includes('High-End') || l.spec_range.includes('Premium'))).length;

  return (
    <div className="min-h-screen bg-surface font-hanken text-on-surface flex flex-col">
      {/* Top Banner Navbar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex justify-between items-center py-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setCurrentView('catalog'); setSelectedLaptop(null); }}
          >
            <div className="bg-primary text-white p-2 rounded-xl shadow-md">
              <Laptop size={22} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-on-surface">LapQuest</span>
              <span className="text-xs block text-on-surface-variant font-medium -mt-1">Specs DB Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setCurrentView('catalog'); setSelectedLaptop(null); }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentView === 'catalog' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => { setCurrentView('add'); }}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all ${currentView === 'add' ? 'bg-primary text-white' : 'bg-surface border border-outline hover:bg-surface-container-low'
                }`}
            >
              <Plus size={16} />
              Add Laptop
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        {/* Global Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 text-error rounded-xl flex items-center gap-2 font-medium">
            ⚠️ {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-container text-success border border-success/30 rounded-xl flex items-center gap-2 font-medium">
            ✅ {successMessage}
          </div>
        )}

        {/* 1. CATALOG BROWSE VIEW */}
        {currentView === 'catalog' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl">
                  💻
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Catalog Size</h4>
                  <p className="text-2xl font-black">{totalCount} Laptops</p>
                </div>
              </div>

              <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-success-container text-success rounded-xl flex items-center justify-center font-bold text-xl">
                  💰
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Catalog Price</h4>
                  <p className="text-2xl font-black">${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">High-End & Gaming</h4>
                  <p className="text-2xl font-black">{highEndCount} Models</p>
                </div>
              </div>
            </section>

            {/* Filters Dashboard */}
            <section className="p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-3.5 text-on-surface-variant" size={18} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by Laptop name, CPU, GPU, brand, specs..."
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium"
                  />
                </div>
                {searchedTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-3 bg-surface border border-outline hover:bg-surface-container-low rounded-xl font-bold transition-all"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant">
                <div className="flex flex-wrap gap-4 items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface-variant">Brand:</span>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="bg-surface border border-outline rounded-lg px-2.5 py-1.5 outline-none focus:border-primary font-medium"
                    >
                      {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface-variant">Category:</span>
                    <select
                      value={filterSpecRange}
                      onChange={(e) => setFilterSpecRange(e.target.value)}
                      className="bg-surface border border-outline rounded-lg px-2.5 py-1.5 outline-none focus:border-primary font-medium"
                    >
                      <option value="All">All Categories</option>
                      {SPEC_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-on-surface-variant flex items-center gap-1">
                    <SlidersHorizontal size={14} /> Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-surface border border-outline rounded-lg px-2.5 py-1.5 outline-none focus:border-primary font-medium"
                  >
                    <option value="none">Default (Latest)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="ram-high">RAM: High to Low</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Grid display */}
            <section>
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-outline border-t-primary"></div>
                  <p className="text-on-surface-variant font-bold">Querying catalog database...</p>
                </div>
              ) : (
                <>
                  <div className="text-sm font-semibold text-on-surface-variant mb-4">
                    Showing {filteredLaptops.length} matching laptops
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLaptops.length > 0 ? (
                      filteredLaptops.map(laptop => (
                        <div
                          key={laptop.id}
                          className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col group cursor-pointer"
                          onClick={() => {
                            setSelectedLaptop(laptop);
                            setSelectedImage(0);
                            setCurrentView('detail');
                          }}
                        >
                          <div className="h-48 bg-surface-container-low relative overflow-hidden flex items-center justify-center border-b border-outline-variant">
                            {laptop.image_url ? (
                              <img
                                src={`${API_BASE_URL}${laptop.image_url}`}
                                alt={laptop.model}
                                className="w-full h-full object-cover group-hover:scale-104 transition-all"
                              />
                            ) : (
                              <div className="text-center text-on-surface-variant">
                                <span className="text-4xl block mb-1">💻</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-60">No Photo</span>
                              </div>
                            )}
                            {laptop.spec_range && (
                              <span className="absolute top-3 right-3 bg-on-surface/90 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                                {laptop.spec_range.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          <div className="p-5 flex-grow flex flex-col">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                                {laptop.brand}
                              </span>
                              <span className="font-extrabold text-lg">
                                ${laptop.price.toLocaleString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface mb-3 line-clamp-1">{laptop.model}</h3>

                            <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-xl border border-outline-variant text-xs mb-4">
                              <div className="truncate">
                                <span className="block text-[10px] font-bold uppercase opacity-50 tracking-wider">CPU</span>
                                <span className="font-bold">{laptop.processor || 'N/A'}</span>
                              </div>
                              <div className="truncate">
                                <span className="block text-[10px] font-bold uppercase opacity-50 tracking-wider">RAM</span>
                                <span className="font-bold">{laptop.ram ? `${laptop.ram}GB` : 'N/A'}</span>
                              </div>
                              <div className="truncate col-span-2">
                                <span className="block text-[10px] font-bold uppercase opacity-50 tracking-wider">Storage</span>
                                <span className="font-bold">{laptop.storage || 'N/A'}</span>
                              </div>
                            </div>

                            <p className="text-sm text-on-surface-variant line-clamp-2 mt-auto">
                              {laptop.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center space-y-4">
                        <span className="text-5xl block">🔍</span>
                        <h3 className="text-xl font-bold">Laptop Model Not Found</h3>
                        <p className="text-on-surface-variant max-w-md mx-auto">
                          We don't have catalog entries matching your query. Would you like to add it?
                        </p>
                        {searchedTerm && (
                          <button
                            onClick={handlePreFill}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all shadow-md"
                          >
                            Add "{searchedTerm}" to Catalog
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* 2. PRODUCT DETAIL VIEW (MATCHING PROVIDED UI DESIGN TEMPLATE) */}
        {currentView === 'detail' && selectedLaptop && (
          <div>
            {/* Navigation Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
              <span className="cursor-pointer hover:underline" onClick={() => setCurrentView('catalog')}>Catalog</span>
              <ChevronRight size={14} />
              <span>{selectedLaptop.brand}</span>
              <ChevronRight size={14} />
              <span className="text-on-surface font-medium">{selectedLaptop.model}</span>
            </nav>

            {/* Back Button */}
            <button
              onClick={() => { setCurrentView('catalog'); setSelectedLaptop(null); }}
              className="mb-8 flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <ArrowLeft size={16} /> Back to Catalog
            </button>

            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                  {selectedLaptop.brand} {selectedLaptop.model}
                </h1>
                <div className="flex items-center gap-2 bg-secondary-container px-3 py-1.5 rounded-full text-on-secondary-container font-semibold">
                  <Star size={18} fill="currentColor" className="text-amber-500" />
                  <span className="font-bold">4.9</span>
                  <span className="text-sm opacity-80">(128 Reviews)</span>
                </div>
              </div>
              <p className="text-xl text-on-surface-variant max-w-3xl mt-3 font-medium">
                {selectedLaptop.description || 'Uncompromising power. Precision engineered for professionals, creators, and developers.'}
              </p>
            </div>

            {/* Two-Column / Three-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* Left: Image Gallery */}
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant flex items-center justify-center relative">
                  {selectedLaptop.image_url ? (
                    // We render different placeholder angles if secondary thumbnails are selected
                    selectedImage === 0 ? (
                      <img
                        src={`${API_BASE_URL}${selectedLaptop.image_url}`}
                        alt={selectedLaptop.model}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Mock alternate views for UI demonstration
                      <div className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center text-on-surface-variant p-6">
                        <Laptop size={64} className="opacity-40 mb-2" />
                        <span className="font-bold text-sm uppercase tracking-wider">
                          {selectedImage === 1 && "Keyboard & Deck Close-up"}
                          {selectedImage === 2 && "Side Profile & Port Selection"}
                          {selectedImage === 3 && "Venting & Under-chassis Angle"}
                        </span>
                        <span className="text-xs opacity-60 mt-1">Mock Alternate Gallery Angle</span>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-on-surface-variant">
                      <span className="text-6xl block mb-2">💻</span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">No Photo Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails list */}
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 bg-surface-container-lowest flex items-center justify-center transition-all ${selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-outline'
                        }`}
                    >
                      {selectedLaptop.image_url && idx === 0 ? (
                        <img
                          src={`${API_BASE_URL}${selectedLaptop.image_url}`}
                          alt="Thumbnail View 1"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-1 text-on-surface-variant">
                          <Laptop size={20} className="mx-auto opacity-40" />
                          <span className="text-[9px] font-bold block uppercase mt-1">Angle {idx + 1}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Configuration & Buy Card */}
              <div className="space-y-6">
                <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-lg shadow-surface-container-high/50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-3xl font-extrabold text-on-surface">
                      ${selectedLaptop.price.toLocaleString()}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px] rounded tracking-wider uppercase">
                      In Stock
                    </span>
                  </div>

                  {/* Specs Chips */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedLaptop.processor && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.processor}
                      </div>
                    )}
                    {selectedLaptop.gpu && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.gpu}
                      </div>
                    )}
                    {selectedLaptop.ram && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.ram}GB RAM
                      </div>
                    )}
                    {selectedLaptop.storage && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.storage}
                      </div>
                    )}
                    {selectedLaptop.screen_size && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.screen_size}
                      </div>
                    )}
                    {selectedLaptop.os && (
                      <div className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded text-xs font-mono uppercase font-bold text-on-surface-variant">
                        {selectedLaptop.os}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-8">
                    <button
                      onClick={() => alert(`Redirecting to config & checkout for ${selectedLaptop.brand} ${selectedLaptop.model}...`)}
                      className="w-full py-4 bg-primary text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:bg-primary-dim transition-all shadow-lg shadow-primary/20"
                    >
                      <ShoppingCart size={20} />
                      Configure & Buy
                    </button>
                    <button
                      onClick={() => alert('Added to comparison list!')}
                      className="w-full py-4 bg-surface border border-outline text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all"
                    >
                      <ArrowRightLeft size={20} />
                      Add to Compare
                    </button>
                  </div>

                  {/* Pricing Comparison Table (using real DB price for baseline comparison) */}
                  <div>
                    <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider text-on-surface-variant">Where to Buy (Local Stock)</h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center p-3 rounded-xl border-2 border-primary bg-primary/5">
                        <span className="font-bold text-sm">Official Catalog Store</span>
                        <div className="text-right">
                          <span className="font-black text-primary">${selectedLaptop.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                        <span className="font-semibold text-sm">TechRetailer Partner</span>
                        <div className="text-right">
                          <span className="font-bold text-on-surface">${(selectedLaptop.price + 49).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">ElectroHub Special</span>
                          <span className="text-[10px] text-green-600 font-bold">Limited Promotion</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] line-through text-on-surface-variant block">
                            ${(selectedLaptop.price + 99).toLocaleString()}
                          </span>
                          <span className="font-bold text-error">
                            ${(selectedLaptop.price - 25).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. ADD LAPTOP SPEC FORM VIEW */}
        {currentView === 'add' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-surface-container-low border-b border-outline-variant p-6 md:p-8">
                <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
                  <Sparkles className="text-primary" size={24} /> Add Laptop to database
                </h2>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  Populate specifications, brand, price, and photo upload. Values will be saved directly in PostgreSQL.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-6">
                {formError && (
                  <div className="p-4 bg-error/10 border border-error/30 text-error rounded-xl font-bold text-sm">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Section 1 */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-on-surface-variant tracking-wider border-b border-outline-variant pb-2 mb-4">
                    <Layers size={14} /> 1. General Info
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Brand Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dell, Apple, Lenovo"
                        list="brands"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                      <datalist id="brands">
                        {COMMON_BRANDS.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Laptop Model / Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. XPS 15 9530, MacBook Pro"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Pricing ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1499.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Specs Range Category</label>
                      <select
                        value={specRange}
                        onChange={(e) => setSpecRange(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      >
                        {SPEC_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-on-surface-variant tracking-wider border-b border-outline-variant pb-2 mb-4">
                    <Laptop size={14} /> 2. Details & Components
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Processor (CPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i9-14900HX"
                        value={processor}
                        onChange={(e) => setProcessor(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Graphics (GPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. NVIDIA RTX 4080"
                        value={gpu}
                        onChange={(e) => setGpu(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">RAM Capacity (GB)</label>
                      <select
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      >
                        <option value="8">8 GB</option>
                        <option value="16">16 GB</option>
                        <option value="24">24 GB</option>
                        <option value="32">32 GB</option>
                        <option value="64">64 GB</option>
                        <option value="128">128 GB</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Storage Spec</label>
                      <input
                        type="text"
                        placeholder="e.g. 1TB SSD NVMe"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Display Panel Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 16 inch Mini-LED"
                        value={screenSize}
                        onChange={(e) => setScreenSize(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Operating System</label>
                      <select
                        value={os}
                        onChange={(e) => setOs(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm"
                      >
                        {COMMON_OS.map(system => <option key={system} value={system}>{system}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-on-surface-variant tracking-wider border-b border-outline-variant pb-2 mb-4">
                    <Upload size={14} /> 3. Media & Notes
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Laptop Image / Photo</label>
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-outline hover:border-primary hover:bg-primary/5 transition-all p-6 rounded-2xl cursor-pointer text-center space-y-2"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {!imagePreview ? (
                          <>
                            <Upload size={28} className="mx-auto text-on-surface-variant" />
                            <p className="text-sm font-bold text-on-surface">Click to browse or upload a photo</p>
                            <p className="text-xs text-on-surface-variant">PNG, JPG, WEBP, GIF, etc.</p>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain border border-outline-variant" />
                            <p className="text-xs text-primary font-bold">Click to replace photo</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Description / Headline</label>
                      <textarea
                        rows="3"
                        placeholder="Add information about battery life, condition, keyboard type, port options..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-outline rounded-xl outline-none focus:border-primary transition-all font-medium text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setCurrentView('catalog'); }}
                    className="px-6 py-3.5 bg-surface border border-outline text-on-surface rounded-xl font-bold hover:bg-surface-container-low transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition-all shadow-md disabled:bg-primary/50"
                  >
                    {isSaving ? "Saving to DB..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-on-surface-variant font-medium">
          <p>© 2026 LapQuest Specifications Database Portal. Connected to PostgreSQL Localhost.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
