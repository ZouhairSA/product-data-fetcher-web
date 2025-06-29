import React, { useState, useMemo } from 'react';
import { Search, Download, Star, Award, ExternalLink, TrendingUp, Package, Filter, Grid, List, Bot, Zap, Target, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Product {
  sku: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  badge: string;
  link: string;
  winningScore: number;
}

interface ScrapingStats {
  avgPrice: number;
  avgRating: number;
  totalReviews: number;
  totalProducts: number;
}

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topProduct, setTopProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [source, setSource] = useState<'amazon' | 'ebay'>('ebay');
  const itemsPerPage = 12;

  // Calculate winning score based on your Python algorithm
  const calculateWinningScore = (price: number, rating: number, reviewScore: number): number => {
    const priceScore = (price >= 10 && price <= 100) ? 0.5 : 0.2;
    const ratingScore = rating > 0 ? rating / 5.0 : 0.0;
    return ((priceScore + ratingScore + reviewScore) / 3) * 100;
  };

  // Detect language like your Python script
  const detectLanguage = (text: string): string => {
    const arabicRegex = /[\u0600-\u06FF]/;
    const frenchWords = ['de', 'le', 'la', 'les', 'du', 'des', 'pour', 'avec', 'coque', 'étui'];
    
    if (arabicRegex.test(text)) return 'ar';
    if (frenchWords.some(word => text.toLowerCase().includes(word))) return 'fr';
    return 'en';
  };

  // Generate enhanced mock data based on your Python scraper structure
  const generateEnhancedMockData = (searchTerm: string): { products: Product[], stats: ScrapingStats } => {
    const lang = detectLanguage(searchTerm);
    setDetectedLanguage(lang === 'ar' ? 'Arabe' : lang === 'fr' ? 'Français' : 'Anglais');

    const baseProducts = [
      {
        sku: "SKU-A1B2C3D4",
        name: "AT&T CD4930 Corded Phone with Digital Answering System and Caller ID, Extra-Large Tilt Display & Buttons, Black",
        price: 49.95,
        rating: 4.4,
        reviews: 13973,
        badge: "Amazon's Choice",
        link: "https://amazon.com/dp/B0CHXJX9YZ",
        winningScore: 0
      },
      {
        sku: "SKU-E5F6G7H8",
        name: "Panasonic Cordless Phone with Answering Machine, Advanced Call Block, Bilingual Caller ID",
        price: 59.99,
        rating: 4.3,
        reviews: 6066,
        badge: "Best Seller",
        link: "https://amazon.com/dp/B0C7B7QQP2",
        winningScore: 0
      },
      {
        sku: "SKU-I9J0K1L2",
        name: "VTech CS6719-2 2-Handset Cordless Phone with Caller ID/Call Waiting, Handset Intercom",
        price: 37.99,
        rating: 4.3,
        reviews: 65521,
        badge: "Popular Choice",
        link: "https://amazon.com/dp/B0B4N5HWQX",
        winningScore: 0
      }
    ];

    // Generate additional products to reach 51+ like your Python scraper
    const additionalProducts = Array.from({ length: 48 }, (_, i) => {
      const productTypes = [
        "Smart Phone", "Cordless Phone", "Cell Phone", "Android Phone", "iPhone", 
        "Samsung Galaxy", "Motorola", "Google Pixel", "OnePlus", "Xiaomi",
        "Huawei", "LG Phone", "Sony Xperia", "Nokia", "BlackBerry", "Headphones",
        "Wireless Earbuds", "Bluetooth Speaker", "Phone Case", "Screen Protector"
      ];
      
      const brands = ["AT&T", "Vtech", "Panasonic", "Samsung", "Apple", "Google", "Motorola", "Sony", "LG", "Nokia"];
      const features = ["with Call Block", "Cordless", "5G Ready", "Unlocked", "Dual SIM", "Fast Charging", "Wireless Charging", "Water Resistant"];
      const colors = ["Black", "White", "Silver", "Blue", "Red", "Gold", "Pink", "Green"];
      
      const brand = brands[i % brands.length];
      const productType = productTypes[i % productTypes.length];
      const feature = features[i % features.length];
      const color = colors[i % colors.length];
      
      return {
        sku: `SKU-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))}`,
        name: `${brand} ${productType} ${feature} - ${color} Model ${(i + 6).toString().padStart(3, '0')}`,
        price: parseFloat((29.99 + (i * 15.5)).toFixed(2)),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 50000) + 500,
        badge: i % 4 === 0 ? "Amazon's Choice" : i % 5 === 0 ? "Best Seller" : i % 6 === 0 ? "Popular" : i % 7 === 0 ? "Limited Deal" : "",
        link: `https://amazon.com/dp/B0${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))}`,
        winningScore: 0
      };
    });

    const allProducts = [...baseProducts, ...additionalProducts];

    // Calculate winning scores using your algorithm
    const processedProducts = allProducts.map(product => {
      const reviewScore = Math.min(product.reviews / 1000, 1.0);
      const winningScore = calculateWinningScore(product.price, product.rating, reviewScore);
      return { ...product, winningScore };
    });

    // Sort by winning score (like your Python script)
    const sortedProducts = processedProducts.sort((a, b) => b.winningScore - a.winningScore);

    // Calculate stats
    const prices = sortedProducts.map(p => p.price);
    const ratings = sortedProducts.filter(p => p.rating > 0).map(p => p.rating);
    const totalReviews = sortedProducts.reduce((sum, p) => sum + p.reviews, 0);

    const stats: ScrapingStats = {
      avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      avgRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0,
      totalReviews,
      totalProducts: sortedProducts.length
    };

    return { products: sortedProducts, stats };
  };

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "⚠️ Champ requis",
        description: "Veuillez saisir un mot-clé pour démarrer l'analyse IA",
        variant: "destructive"
      });
      return;
    }

    setProducts([]);
    setTopProduct(null);
    setStats(null);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      let endpoint = source === 'amazon' ? '/scrape_amazon' : '/scrape_ebay';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_query: keyword,
          num_products: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du scraping");
      }

      setProducts(data.products || []);
      setTopProduct(data.top_product || null);
      setStats(data.stats || { total_products: (data.products || []).length });
      setIsLoading(false);

      toast({
        title: "🤖 Analyse IA Terminée !",
        description: `${(data.products || []).length} produits analysés`,
      });
    } catch (error) {
      setProducts([]);
      setTopProduct(null);
      setStats(null);
      setIsLoading(false);
      toast({
        title: "❌ Erreur API",
        description: error instanceof Error ? error.message : "Impossible de récupérer les données du backend.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCSV = () => {
    if (products.length === 0) {
      toast({
        title: "📋 Aucune donnée",
        description: "Lancez d'abord une analyse pour télécharger les résultats",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['SKU', 'Nom', 'Prix', 'Rating', 'Review_Count', 'Badge', 'Winning_Score', 'Lien'],
      ...products.map(p => [p.sku, p.name, p.price, p.rating, p.reviews, p.badge, p.winningScore.toFixed(2), p.link])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyword.replace(' ', '_')}_winning_products_synchroscale.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "✅ Export Réussi",
      description: "Données SynchroScale exportées en CSV",
    });
  };

  const handleProductClick = (productLink: string) => {
    window.open(productLink, '_blank', 'noopener,noreferrer');
    toast({
      title: "🔗 Redirection Amazon",
      description: "Ouverture du produit sur Amazon...",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'text-amber-400 fill-amber-400' 
                : i < rating 
                ? 'text-amber-400 fill-amber-400/50' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header with SynchroScale Branding */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/336dbe2d-7314-4ff2-be63-da2f6039278f.png" 
                alt="SynchroScale Logo" 
                className="w-12 h-12 mr-4 drop-shadow-sm"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  SynchroScale
                </h1>
                <p className="text-sm text-gray-600 font-medium">Agent E-commerce Intelligent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Enhanced Hero Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bot className="w-8 h-8 text-teal-600" />
              <Zap className="w-6 h-6 text-yellow-500" />
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Intelligence Artificielle Amazon
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Agent e-commerce avancé avec détection automatique de langue, calcul de scores gagnants 
              et analyse comparative intelligente. Compatible français, arabe et anglais.
            </p>
            
            {/* AI Features */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge className="bg-teal-100 text-teal-800 px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Détection Auto de Langue
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
                <Bot className="w-4 h-4 mr-2" />
                Analyse IA Avancée
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Score Gagnant Automatique
              </Badge>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-xl border border-gray-200/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="Ex: smart watch, هاتف ذكي, coque iPhone..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg border-0 focus:ring-0 bg-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as 'amazon' | 'ebay')}
                  className="h-14 px-4 rounded-xl border border-gray-300 text-lg"
                >
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                </select>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-14 px-10 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                      Analyse IA...
                    </div>
                  ) : (
                    <>
                      <Bot className="w-6 h-6 mr-3" />
                      Analyser
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Language Detection Display */}
          {detectedLanguage && (
            <div className="mt-4 text-center">
              <Badge className="bg-green-100 text-green-800">
                <Globe className="w-4 h-4 mr-2" />
                Langue détectée: {detectedLanguage}
              </Badge>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 text-center">
              <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🤖 SynchroScale IA en cours d'analyse...
                </h3>
                <p className="text-gray-600 mb-4">
                  Analyse de <strong>{keyword}</strong> en cours
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Bot className="w-4 h-4" />
                  <span>Détection de langue • Scraping Amazon • Calcul des scores</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">
                    {stats.totalProducts}
                  </p>
                  <p className="text-sm text-blue-600">Produits Analysés</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">${stats.avgPrice.toFixed(2)}</p>
                  <p className="text-sm text-green-600">Prix Moyen</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-sm text-yellow-600">Note Moyenne</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">{stats.totalReviews.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Total Avis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Top Product Winner */}
        {topProduct && (
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-300/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-2xl text-amber-800">
                    <Award className="w-8 h-8 mr-3 text-amber-600" />
                    🏆 Produit Gagnant IA
                  </CardTitle>
                  <div className="flex items-center bg-gradient-to-r from-amber-200 to-orange-200 px-4 py-2 rounded-full shadow-sm">
                    <Bot className="w-5 h-5 mr-2 text-amber-700" />
                    <span className="font-bold text-amber-800 text-lg">
                      Score: {topProduct.winningScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-gray-100 text-gray-700 text-xs">
                        SKU: {topProduct.sku}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-4 line-clamp-2 leading-relaxed">
                      {topProduct.name}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-green-600">
                          ${topProduct.price}
                        </span>
                        {topProduct.badge && (
                          <Badge className="bg-blue-600 text-white px-3 py-1 text-sm">
                            {topProduct.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {renderStars(topProduct.rating)}
                        <span className="text-gray-600 font-medium">
                          ({topProduct.reviews.toLocaleString()} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <Button
                      onClick={() => handleProductClick(topProduct.link)}
                      className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <ExternalLink className="w-6 h-6 mr-3" />
                      Voir sur Amazon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Results Section */}
        {products.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Analyse SynchroScale IA
                </h3>
                <p className="text-gray-600">
                  {products.length} produits analysés • Page {currentPage} sur {totalPages} • Triés par Score IA
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-md"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-md"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleDownloadCSV}
                  variant="outline"
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 px-6 py-2 font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedProducts.map((product, index) => (
                  <Card 
                    key={product.sku} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                    onClick={() => handleProductClick(product.link)}
                  >
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.sku}
                        </Badge>
                        <div className="flex items-center">
                          <Bot className="w-4 h-4 text-teal-600 mr-1" />
                          <span className="text-sm font-bold text-teal-600">
                            {product.winningScore.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {product.name}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            ${product.price}
                          </span>
                          {product.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {renderStars(product.rating)}
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{product.reviews.toLocaleString()} avis</span>
                          <div className="flex items-center">
                            <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                              <div
                                className="h-2 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                                style={{ width: `${Math.min(product.winningScore, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <Card className="shadow-lg mb-8">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <tr>
                          <th className="text-left p-6 font-semibold text-gray-700">SKU</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Produit</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Prix</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Note</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Avis</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Badge</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Score IA</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, index) => (
                          <tr 
                            key={product.sku} 
                            className="border-b hover:bg-teal-50/50 transition-colors cursor-pointer"
                            onClick={() => handleProductClick(product.link)}
                          >
                            <td className="p-6">
                              <Badge variant="outline" className="text-xs font-mono">
                                {product.sku}
                              </Badge>
                            </td>
                            <td className="p-6">
                              <div className="max-w-md">
                                <p className="font-medium text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors">
                                  {product.name}
                                </p>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="font-bold text-green-600 text-lg">
                                ${product.price}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                {renderStars(product.rating)}
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="text-gray-600 font-medium">
                                {product.reviews.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-6">
                              {product.badge && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {product.badge}
                                </Badge>
                              )}
                            </td>
                            <td className="p-6">
                              <div className="flex items-center">
                                <Bot className="w-4 h-4 text-teal-600 mr-2" />
                                <span className="font-bold text-sm text-teal-600">
                                  {product.winningScore.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td className="p-6">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(product.link);
                                }}
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Amazon
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-teal-50'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer hover:bg-teal-50"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-teal-50'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}

        {/* Enhanced No Results State */}
        {!isLoading && products.length === 0 && keyword && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Bot className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                Aucun produit analysé
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Essayez avec un autre mot-clé. Notre IA SynchroScale analyse 
                des milliers de produits avec détection automatique de langue.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-20 py-8 border-t border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/336dbe2d-7314-4ff2-be63-da2f6039278f.png" 
              alt="SynchroScale" 
              className="w-8 h-8 mr-3"
            />
            <span className="text-gray-600 font-medium">
              Powered by SynchroScale AI - Agent E-commerce Intelligent
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Analyse automatique • Détection de langue • Calcul de scores gagnants
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
