import React, { useState, useMemo } from 'react';
import { Search, Download, Star, Award, ExternalLink, TrendingUp, Package, Filter, Grid, List } from 'lucide-react';
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
  name: string;
  price: string;
  rating: number;
  reviews: number;
  badge: string;
  link: string;
  winningScore: number;
  image?: string;
}

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topProduct, setTopProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = 12;

  // Generate realistic mock data that matches your scraping results (51+ products)
  const generateMockData = (): Product[] => {
    const baseProducts = [
      {
        name: "AT&T CD4930 Corded Phone with Digital Answering System and Caller ID, Extra-Large Tilt Display & Buttons, Black",
        price: "$49.95",
        rating: 4.4,
        reviews: 13973,
        badge: "Amazon's Choice",
        link: "https://amazon.com/dp/B0CHXJX9YZ",
        winningScore: 79.33,
        image: "/placeholder.svg"
      },
      {
        name: "Panasonic Cordless Phone with Answering Machine, Advanced Call Block, Bilingual Caller ID and Easy to Read High-Contrast Display",
        price: "$59.99",
        rating: 4.3,
        reviews: 6066,
        badge: "Best Seller",
        link: "https://amazon.com/dp/B0C7B7QQP2",
        winningScore: 78.67,
        image: "/placeholder.svg"
      },
      {
        name: "VTech CS6719-2 2-Handset Cordless Phone with Caller ID/Call Waiting, Handset Intercom & Backlit Display/Keypad, Silver",
        price: "$37.99",
        rating: 4.3,
        reviews: 65521,
        badge: "Popular Choice",
        link: "https://amazon.com/dp/B0B4N5HWQX",
        winningScore: 78.67,
        image: "/placeholder.svg"
      },
      {
        name: "VTech VG131-11 DECT 6.0 Cordless Phone - Bluetooth Connection, Blue-White Display, Big Buttons, Full Duplex",
        price: "$19.95",
        rating: 4.3,
        reviews: 1497,
        badge: "Editor's Choice",
        link: "https://amazon.com/dp/B0C6GB21YJ",
        winningScore: 78.67,
        image: "/placeholder.svg"
      },
      {
        name: "AT&T GL2101-2 DECT 6.0 2-Handset Cordless Home Phone with Call Block, Caller ID, Full-Duplex Handset Speakerphone",
        price: "$39.95",
        rating: 4.3,
        reviews: 2340,
        badge: "Amazon's Choice",
        link: "https://amazon.com/dp/B0C6GB21YJ",
        winningScore: 78.67,
        image: "/placeholder.svg"
      }
    ];

    // Generate additional products to reach 51+ items like your real scraping results
    const additionalProducts = Array.from({ length: 46 }, (_, i) => {
      const productTypes = [
        "Smart Phone", "Cordless Phone", "Cell Phone", "Android Phone", "iPhone", 
        "Samsung Galaxy", "Motorola", "Google Pixel", "OnePlus", "Xiaomi",
        "Huawei", "LG Phone", "Sony Xperia", "Nokia", "BlackBerry"
      ];
      
      const brands = ["AT&T", "Vtech", "Panasonic", "Samsung", "Apple", "Google", "Motorola", "Sony", "LG", "Nokia"];
      const features = ["with Call Block", "Cordless", "5G Ready", "Unlocked", "Dual SIM", "Fast Charging", "Wireless Charging", "Water Resistant"];
      const colors = ["Black", "White", "Silver", "Blue", "Red", "Gold", "Pink", "Green"];
      
      const brand = brands[i % brands.length];
      const productType = productTypes[i % productTypes.length];
      const feature = features[i % features.length];
      const color = colors[i % colors.length];
      
      return {
        name: `${brand} ${productType} ${feature} - ${color} Model ${(i + 6).toString().padStart(3, '0')}`,
        price: `$${(29.99 + (i * 15.5)).toFixed(2)}`,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 50000) + 500,
        badge: i % 4 === 0 ? "Amazon's Choice" : i % 5 === 0 ? "Best Seller" : i % 6 === 0 ? "Popular" : "",
        link: `https://amazon.com/dp/B0${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))}`,
        winningScore: parseFloat((55 + Math.random() * 40).toFixed(2)),
        image: "/placeholder.svg"
      };
    });

    return [...baseProducts, ...additionalProducts].sort((a, b) => b.winningScore - a.winningScore);
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
        description: "Veuillez saisir un mot-clé pour commencer la recherche",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);
    
    setTimeout(() => {
      const allProducts = generateMockData();
      console.log(`Generated ${allProducts.length} products for keyword: ${keyword}`);
      
      setProducts(allProducts);
      setTopProduct(allProducts[0]);
      setIsLoading(false);
      
      toast({
        title: "🎉 Recherche terminée !",
        description: `${allProducts.length} produits trouvés pour "${keyword}"`,
      });
    }, 2000);
  };

  const handleDownloadCSV = () => {
    if (products.length === 0) {
      toast({
        title: "📋 Aucune donnée",
        description: "Effectuez d'abord une recherche pour télécharger les résultats",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Nom', 'Prix', 'Note', 'Avis', 'Badge', 'Score', 'Lien'],
      ...products.map(p => [p.name, p.price, p.rating, p.reviews, p.badge, p.winningScore, p.link])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amazon_scraping_${keyword}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "✅ Téléchargement réussi",
      description: "Le fichier CSV a été téléchargé avec succès",
    });
  };

  const handleProductClick = (productLink: string) => {
    window.open(productLink, '_blank', 'noopener,noreferrer');
    toast({
      title: "🔗 Redirection",
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
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Package className="w-10 h-10 text-blue-600 mr-3 drop-shadow-sm" />
              <h1 className="text-3xl font-bold">Amazon Product Scraper Pro</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Enhanced Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Découvrez les Meilleurs Produits
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Analysez instantanément les produits Amazon avec notre IA. 
              Recherchez en français, anglais ou arabe pour des résultats précis.
            </p>
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
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-14 px-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                ) : (
                  <>
                    <Search className="w-6 h-6 mr-3" />
                    Analyser
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Top Product Winner */}
        {topProduct && (
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-300/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-2xl text-amber-800">
                    <Award className="w-8 h-8 mr-3 text-amber-600" />
                    🏆 Produit Gagnant
                  </CardTitle>
                  <div className="flex items-center bg-gradient-to-r from-amber-200 to-orange-200 px-4 py-2 rounded-full shadow-sm">
                    <TrendingUp className="w-5 h-5 mr-2 text-amber-700" />
                    <span className="font-bold text-amber-800 text-lg">
                      Score: {topProduct.winningScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 line-clamp-2 leading-relaxed">
                      {topProduct.name}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-green-600">
                          {topProduct.price}
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
                  Résultats de la recherche
                </h3>
                <p className="text-gray-600">
                  {products.length} produits trouvés • Page {currentPage} sur {totalPages}
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
                  className="border-green-500 text-green-600 hover:bg-green-50 px-6 py-2 font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger CSV
                </Button>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedProducts.map((product, index) => (
                  <Card 
                    key={index} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                    onClick={() => handleProductClick(product.link)}
                  >
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            {product.price}
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
                                className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                style={{ width: `${Math.min(product.winningScore, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold">
                              {product.winningScore.toFixed(0)}
                            </span>
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
                          <th className="text-left p-6 font-semibold text-gray-700">Produit</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Prix</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Note</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Avis</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Badge</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Score</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, index) => (
                          <tr 
                            key={index} 
                            className="border-b hover:bg-blue-50/50 transition-colors cursor-pointer"
                            onClick={() => handleProductClick(product.link)}
                          >
                            <td className="p-6">
                              <div className="max-w-md">
                                <p className="font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                                  {product.name}
                                </p>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="font-bold text-green-600 text-lg">
                                {product.price}
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
                                <div className="w-16 h-3 bg-gray-200 rounded-full mr-3">
                                  <div
                                    className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                    style={{ width: `${Math.min(product.winningScore, 100)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm">
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
                                Voir
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
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-blue-50'}
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
                            className="cursor-pointer hover:bg-blue-50"
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
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-blue-50'}
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
              <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Essayez avec un autre mot-clé ou vérifiez l'orthographe. 
                Notre IA analyse des milliers de produits pour vous.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
