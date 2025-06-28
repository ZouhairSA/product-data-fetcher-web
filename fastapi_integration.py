#!/usr/bin/env python3
"""
Exemple d'intégration FastAPI pour le scraping Amazon
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
from datetime import datetime

# Import du script de scraping amélioré
try:
    from scrape_products_enhanced import scrape_products_api
except ImportError:
    # Fallback si le fichier n'existe pas
    def scrape_products_api(search_query: str, num_products: int = 50, delay: int = 2) -> Dict:
        return {
            'products': [],
            'stats': {},
            'success': False,
            'error': 'Module de scraping non disponible'
        }

app = FastAPI(
    title="Amazon Product Scraper API",
    description="API pour scraper les produits Amazon avec calcul de score gagnant",
    version="1.0.0"
)

class ScrapingRequest(BaseModel):
    search_query: str = Field(..., description="Terme de recherche (français, anglais, arabe...)")
    num_products: int = Field(default=50, ge=1, le=100, description="Nombre de produits à récupérer (1-100)")
    delay: int = Field(default=2, ge=1, le=10, description="Délai entre les requêtes en secondes (1-10)")

class ScrapingResponse(BaseModel):
    success: bool
    total_products: int
    search_query: str
    lang_code: str
    scraping_date: str
    filename: Optional[str] = None
    top_product: Optional[Dict] = None
    stats: Optional[Dict] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "Amazon Product Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "/scrape": "POST - Scraper des produits Amazon",
            "/health": "GET - Vérifier l'état de l'API",
            "/docs": "GET - Documentation interactive"
        }
    }

@app.get("/health")
async def health_check():
    """Vérifier l'état de l'API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Amazon Product Scraper"
    }

@app.post("/scrape", response_model=ScrapingResponse)
async def scrape_products_endpoint(request: ScrapingRequest):
    """
    Scraper des produits Amazon
    
    - **search_query**: Terme de recherche (détection automatique de langue)
    - **num_products**: Nombre de produits à récupérer (1-100)
    - **delay**: Délai entre les requêtes en secondes (1-10)
    """
    try:
        # Appel de la fonction de scraping
        result = scrape_products_api(
            search_query=request.search_query,
            num_products=request.num_products,
            delay=request.delay
        )
        
        if not result['success']:
            return ScrapingResponse(
                success=False,
                total_products=0,
                search_query=request.search_query,
                lang_code="unknown",
                scraping_date=datetime.now().isoformat(),
                error="Aucun produit trouvé"
            )
        
        stats = result.get('stats', {})
        
        return ScrapingResponse(
            success=True,
            total_products=stats.get('total_products', 0),
            search_query=request.search_query,
            lang_code=stats.get('lang_code', 'unknown'),
            scraping_date=stats.get('scraping_date', datetime.now().isoformat()),
            filename=stats.get('filename'),
            top_product=stats.get('top_product'),
            stats=stats
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors du scraping: {str(e)}"
        )

@app.get("/download/{filename}")
async def download_csv(filename: str):
    """
    Télécharger un fichier CSV généré
    
    - **filename**: Nom du fichier CSV à télécharger
    """
    file_path = filename
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, 
            detail=f"Fichier {filename} non trouvé"
        )
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='text/csv'
    )

@app.get("/stats")
async def get_api_stats():
    """Obtenir les statistiques de l'API"""
    return {
        "api_name": "Amazon Product Scraper",
        "version": "1.0.0",
        "features": [
            "Détection automatique de langue",
            "Support multi-langues (FR, EN, AR, DE, IT, ES, UK, CA, JP, IN)",
            "Calcul de score gagnant",
            "Export CSV automatique",
            "Statistiques détaillées",
            "Gestion d'erreurs robuste"
        ],
        "supported_languages": {
            "fr": "Français - Amazon.fr",
            "ar": "Arabe - Amazon.sa",
            "en": "Anglais - Amazon.com",
            "de": "Allemand - Amazon.de",
            "it": "Italien - Amazon.it",
            "es": "Espagnol - Amazon.es",
            "uk": "Anglais UK - Amazon.co.uk",
            "ca": "Canadien - Amazon.ca",
            "jp": "Japonais - Amazon.co.jp",
            "in": "Indien - Amazon.in"
        },
        "timestamp": datetime.now().isoformat()
    }

# Fonction pour démarrer le serveur
def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Démarrer le serveur FastAPI"""
    import uvicorn
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    print("🚀 Démarrage du serveur FastAPI...")
    print("📖 Documentation disponible sur: http://localhost:8000/docs")
    print("🔍 Tests disponibles sur: http://localhost:8000/health")
    start_server() 