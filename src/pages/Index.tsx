
import React, { useState } from 'react';
import { Search, Download, Star, Award, ExternalLink, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Product {
  name: string;
  price: string;
  rating: number;
  reviews: number;
  badge: string;
  link: string;
  winningScore: number;
}

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topProduct, setTopProduct] = useState<Product | null>(null);

  // Simulation des données pour la démonstration
  const mockData: Product[] = [
    {
      name: "Apple Watch Series 9 GPS 45mm Midnight Aluminum Case",
      price: "$399.00",
      rating: 4.5,
      reviews: 12847,
      badge: "Amazon's Choice",
      link: "https://amazon.com/product1",
      winningScore: 95.8
    },
    {
      name: "Samsung Galaxy Watch 6 Classic 47mm",
      price: "$329.99",
      rating: 4.3,
      reviews: 8932,
      badge: "Best Seller",
      link: "https://amazon.com/product2",
      winningScore: 87.3
    },
    {
      name: "Fitbit Sense 2 Health & Fitness Smartwatch",
      price: "$249.95",
      rating: 4.1,
      reviews: 5621,
      badge: "",
      link: "https://amazon.com/product3",
      winningScore: 78.9
    },
    {
      name: "Garmin Venu 3 GPS Smartwatch",
      price: "$449.99",
      rating: 4.6,
      reviews: 3847,
      badge: "Editor's Choice",
      link: "https://amazon.com/product4",
      winningScore: 82.4
    }
  ];

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un mot-clé pour la recherche",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulation d'un appel API
    setTimeout(() => {
      const filteredProducts = mockData.sort((a, b) => b.winningScore - a.winningScore);
      setProducts(filteredProducts);
      setTopProduct(filteredProducts[0]);
      setIsLoading(false);
      
      toast({
        title: "Recherche terminée",
        description: `${filteredProducts.length} produits trouvés pour "${keyword}"`,
      });
    }, 2000);
  };

  const handleDownloadCSV = () => {
    if (products.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Effectuez d'abord une recherche pour télécharger les résultats",
        variant: "destructive"
      });
      return;
    }

    // Simulation du téléchargement CSV
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
      title: "Téléchargement réussi",
      description: "Le fichier CSV a été téléchargé",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : i < rating 
            ? 'text-yellow-400 fill-yellow-400/50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Amazon Product Scraper</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Recherchez des produits Amazon
            </h2>
            <p className="text-lg text-gray-600">
              Entrez un mot-clé en français, anglais ou arabe pour analyser les meilleurs produits
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Ex: smart watch, هاتف, coque iPhone..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-semibold"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Top Product Winner */}
        {topProduct && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl text-amber-800">
                    <Award className="w-6 h-6 mr-2 text-amber-600" />
                    🏆 Produit Gagnant
                  </CardTitle>
                  <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 mr-1 text-amber-600" />
                    <span className="font-bold text-amber-800">Score: {topProduct.winningScore}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-3 line-clamp-2">
                      {topProduct.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">{topProduct.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(topProduct.rating)}</div>
                        <span className="text-sm text-gray-600">
                          {topProduct.rating} ({topProduct.reviews.toLocaleString()} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    {topProduct.badge && (
                      <Badge variant="secondary" className="w-fit mb-3 bg-blue-100 text-blue-800">
                        {topProduct.badge}
                      </Badge>
                    )}
                    <Button
                      onClick={() => window.open(topProduct.link, '_blank')}
                      className="w-fit bg-orange-500 hover:bg-orange-600"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir sur Amazon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {products.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Résultats de la recherche ({products.length} produits)
              </h3>
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger CSV
              </Button>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700">Produit</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Prix</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Note</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Avis</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Badge</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Score</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="max-w-md">
                              <p className="font-medium text-gray-800 line-clamp-2">
                                {product.name}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-green-600 text-lg">
                              {product.price}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex">{renderStars(product.rating)}</div>
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-600">
                              {product.reviews.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            {product.badge && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {product.badge}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                                <div
                                  className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                  style={{ width: `${product.winningScore}%` }}
                                />
                              </div>
                              <span className="font-semibold text-sm">
                                {product.winningScore}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              onClick={() => window.open(product.link, '_blank')}
                              size="sm"
                              variant="outline"
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && products.length === 0 && keyword && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-500">
              Essayez avec un autre mot-clé ou vérifiez l'orthographe
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
