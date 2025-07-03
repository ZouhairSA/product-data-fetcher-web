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
  title: string;
  image?: string;
  link: string;
}

interface ScrapingStats {
  totalAds: number;
}

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topProduct, setTopProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const itemsPerPage = 12;

  // Historique des recherches (localStorage)
  const [searchHistory, setSearchHistory] = useState<{ keyword: string; source: string }[]>(() => {
    // Charger l'historique depuis localStorage au démarrage
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Fonction pour ajouter une recherche à l'historique
  const addToHistory = (keyword: string, source: string) => {
    if (!keyword.trim()) return;
    const newEntry = { keyword, source };
    // Évite les doublons consécutifs
    let updated = searchHistory.filter(h => h.keyword !== keyword || h.source !== source);
    updated = [newEntry, ...updated].slice(0, 5); // max 5 éléments
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  // Filtrer les produits sans titre
  const filteredPaginatedProducts = paginatedProducts.filter(
    (product) =>
      product.title &&
      product.title.trim() !== "" &&
      product.title.trim().toLowerCase() !== "no title"
  );

  // Calculer les stats sur les produits filtrés
  const filteredStats = {
    totalAds: filteredPaginatedProducts.length,
  };

  // Calculer le nombre total de produits récupérés (avant filtrage)
  const totalFetchedProducts = products.length;

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "⚠️ Champ requis",
        description: "Veuillez saisir un mot-clé pour démarrer l'analyse IA",
        variant: "destructive"
      });
      return;
    }

    // Ajoute la recherche à l'historique
    addToHistory(keyword, 'meta_ads');

    setProducts([]);
    setTopProduct(null);
    setStats(null);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = '/scrape_meta_ads';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_query: keyword,
          num_products: 50 // Remettre la valeur par défaut
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors du scraping");
      }

      setProducts(data.ads || []);
      setTopProduct(data.ads && data.ads.length > 0 ? data.ads[0] : null);
      setStats({ total_ads: (data.ads || []).length });
      setIsLoading(false);

      toast({
        title: "🤖 Analyse IA Terminée !",
        description: `${(data.ads || []).length} publicités analysées`,
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
      ['Titre', 'Image', 'Lien'],
      ...products.map(p => [p.title, p.image || '', p.link])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyword.replace(' ', '_')}_meta_ads_synchroscale.csv`;
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
      title: "🔗 Redirection Meta Ads",
      description: "Ouverture de la publicité...",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header with SynchroScale Branding */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-2"> {/* py-6 -> py-2 */}
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/336dbe2d-7314-4ff2-be63-da2f6039278f.png" 
                alt="SynchroScale Logo" 
                className="w-8 h-8 mr-2 drop-shadow-sm" // w-12 h-12 mr-4 -> w-8 h-8 mr-2
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent"> {/* text-3xl -> text-2xl */}
                  SynchroScale
                </h1>
                <p className="text-xs text-gray-600 font-medium">Agent E-commerce Intelligent</p> {/* text-sm -> text-xs */}
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
              Intelligence Artificielle Meta Ads
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Agent e-commerce avancé avec analyse des publicités Meta Ads 
              et détection automatique de tendances publicitaires.
            </p>
            
            {/* AI Features */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge className="bg-teal-100 text-teal-800 px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Analyse Meta Ads
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
                <Bot className="w-4 h-4 mr-2" />
                Détection de Tendances
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Veille Publicitaire
              </Badge>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-xl border border-gray-200/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="Ex: smart watch, iPhone, coque téléphone..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 text-lg border-0 focus:ring-0 bg-transparent placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
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

            {/* Historique des recherches */}
            {searchHistory.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 mr-2">Dernières recherches :</span>
                {searchHistory.map((item, idx) => (
                  <Button
                    key={item.keyword + item.source + idx}
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1 border-gray-300"
                    onClick={() => {
                      setKeyword(item.keyword);
                      setTimeout(() => handleSearch(), 0);
                    }}
                  >
                    {item.keyword} <span className="ml-1 text-gray-400">[Meta Ads]</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

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
                  <span>Scraping Meta Ads • Analyse des tendances • Calcul des statistiques</span>
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
                    {totalFetchedProducts}
                  </p>
                  <p className="text-sm text-blue-600">Publicités Récupérées</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">
                    {filteredStats.totalAds}
                  </p>
                  <p className="text-sm text-green-600">Publicités Valides</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">
                    {totalPages}
                  </p>
                  <p className="text-sm text-yellow-600">Pages de Résultats</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">
                    {itemsPerPage}
                  </p>
                  <p className="text-sm text-purple-600">Par Page</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Results Section */}
        {products.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Analyse SynchroScale Meta Ads
                </h3>
                <p className="text-gray-600">
                  {products.length} publicités analysées • Page {currentPage} sur {totalPages} • Triées par pertinence
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
                {filteredPaginatedProducts.map((product, index) => (
                  <Card 
                    key={index} 
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1"
                    onClick={() => handleProductClick(product.link)}
                  >
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        {/* Affiche l'image si elle existe, sinon l'icône */}
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {product.title}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Publicité Meta
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Meta Ads
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Cliquez pour voir</span>
                          <div className="flex items-center">
                            <ExternalLink className="w-4 h-4 text-teal-600" />
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
                          <th className="text-left p-6 font-semibold text-gray-700">Image</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Titre Publicité</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Source</th>
                          <th className="text-left p-6 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPaginatedProducts.map((product, index) => (
                          <tr 
                            key={index} 
                            className="border-b hover:bg-teal-50/50 transition-colors cursor-pointer"
                            onClick={() => handleProductClick(product.link)}
                          >
                            <td className="p-6">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                {product.image ? (
                                  <img src={product.image} alt={product.title} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  <Package className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="max-w-md">
                                <p className="font-medium text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors">
                                  {product.title}
                                </p>
                              </div>
                            </td>
                            <td className="p-6">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Meta Ads
                              </Badge>
                            </td>
                            <td className="p-6">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductClick(product.link);
                                }}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
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
                Aucune publicité trouvée
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Essayez avec un autre mot-clé. Notre IA SynchroScale analyse 
                les publicités Meta Ads pour détecter les tendances.
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
              Powered by SynchroScale AI - Agent Meta Ads Intelligent
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Analyse automatique • Détection de tendances • Veille publicitaire
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
