#!/usr/bin/env python3
"""
Script de scraping Amazon amélioré
Version optimisée avec gestion multi-langues, devises et préparation FastAPI
"""

import requests
from bs4 import BeautifulSoup
import csv
from urllib.parse import quote, urljoin
import uuid
import time
import re
from datetime import datetime
from langdetect import detect, LangDetectException
from typing import List, Dict, Optional, Tuple

def calculate_winning_score(price: float, rating: float, review_score: float) -> float:
    """Calcule le score gagnant basé sur le prix, rating et nombre d'avis"""
    price_score = 0.5 if 10 <= price <= 100 else 0.2
    rating_score = rating / 5.0 if rating > 0 else 0.0
    return (price_score + rating_score + review_score) / 3 * 100

def clean_title(name: str) -> str:
    """Nettoie et formate le titre du produit"""
    if not name:
        return ""
    name = name.strip()
    if name.isupper():
        name = name.capitalize()
    return name

def extract_price_and_currency(price_text: str, lang_code: str) -> Tuple[float, str]:
    """Extrait le prix et la devise du texte selon la langue"""
    if not price_text:
        return 0.0, "€"
    
    price_text = price_text.strip()
    
    # Mapping des devises par langue
    currency_map = {
        'fr': {'€': '€', 'EUR': '€', 'euros': '€'},
        'ar': {'SAR': 'SAR', 'ر.س': 'SAR', 'ريال': 'SAR'},
        'en': {'$': '$', 'USD': '$', 'dollars': '$'},
        'de': {'€': '€', 'EUR': '€', 'euro': '€'},
        'it': {'€': '€', 'EUR': '€', 'euro': '€'},
        'es': {'€': '€', 'EUR': '€', 'euro': '€'},
        'uk': {'£': '£', 'GBP': '£', 'pounds': '£'},
        'ca': {'C$': 'CAD', 'CAD': 'CAD', 'dollars': 'CAD'},
        'jp': {'¥': '¥', 'JPY': '¥', '円': '¥'},
        'in': {'₹': 'INR', 'INR': 'INR', 'rupees': 'INR'}
    }
    
    currencies = currency_map.get(lang_code, {'$': '$', 'USD': '$'})
    currency = "$"  # défaut
    
    # Détecter la devise
    for symbol, curr in currencies.items():
        if symbol in price_text:
            currency = curr
            break
    
    # Extraire les chiffres
    price_match = re.search(r'[\d,]+\.?\d*', price_text.replace(',', ''))
    if price_match:
        try:
            price = float(price_match.group().replace(',', ''))
            return price, currency
        except ValueError:
            pass
    
    return 0.0, currency

def get_amazon_domain(lang_code: str) -> str:
    """Retourne le domaine Amazon approprié selon la langue"""
    domains = {
        'fr': "https://www.amazon.fr",
        'ar': "https://www.amazon.sa", 
        'en': "https://www.amazon.com",
        'de': "https://www.amazon.de",
        'it': "https://www.amazon.it",
        'es': "https://www.amazon.es",
        'uk': "https://www.amazon.co.uk",
        'ca': "https://www.amazon.ca",
        'jp': "https://www.amazon.co.jp",
        'in': "https://www.amazon.in"
    }
    return domains.get(lang_code, "https://www.amazon.com")

def get_robust_selectors() -> Dict[str, List[str]]:
    """Retourne des sélecteurs CSS robustes avec fallbacks"""
    return {
        'name': [
            'h2 a span',
            '.a-size-medium.a-text-normal',
            '.a-size-base-plus.a-text-normal',
            '.a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2 a span',
            '[data-cy="title-recipe"] span',
            '.a-size-base-plus.a-color-base.a-text-normal'
        ],
        'price': [
            '.a-price .a-offscreen',
            '.a-price-whole',
            '.a-price .a-price-range .a-offscreen',
            '.a-price-range .a-price-range-min .a-offscreen',
            '.a-price .a-price-range-min .a-offscreen'
        ],
        'rating': [
            '.a-icon-alt',
            '.a-icon-star-small .a-icon-alt',
            '[data-cy="rating-recipe"] .a-icon-alt',
            '.a-icon-star .a-icon-alt'
        ],
        'link': [
            'h2 a',
            '.a-size-mini a',
            '[data-cy="title-recipe"] a',
            '.a-size-base-plus a'
        ],
        'reviews': [
            '.a-size-small .a-link-normal span',
            '.a-size-base .a-link-normal span',
            '[data-cy="rating-recipe"] .a-size-small span',
            '.a-size-base .a-color-secondary'
        ],
        'badge': [
            '.s-label-popover-default',
            '.a-badge-text',
            '.a-size-mini .a-badge-text',
            '.a-badge-supplementary-text'
        ]
    }

def extract_element_text(item, selectors: List[str]) -> Optional[str]:
    """Extrait le texte d'un élément avec fallbacks"""
    for selector in selectors:
        elem = item.select_one(selector)
        if elem and elem.text.strip():
            return elem.text.strip()
    return None

def extract_element_href(item, selectors: List[str], base_url: str) -> Optional[str]:
    """Extrait l'URL d'un élément avec fallbacks"""
    for selector in selectors:
        elem = item.select_one(selector)
        if elem and elem.get('href'):
            href = elem['href']
            if href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
    return None

def scrape_products(search_query: str, num_products: int = 50, delay: int = 2, 
                   verbose: bool = True, return_stats: bool = True) -> Dict:
    """
    Scrape les produits Amazon avec améliorations
    
    Args:
        search_query: Terme de recherche
        num_products: Nombre de produits à récupérer
        delay: Délai entre les requêtes
        verbose: Afficher les logs
        return_stats: Retourner les statistiques
    
    Returns:
        Dict contenant les produits et statistiques
    """
    
    # Détection de langue améliorée
    try:
        lang_code = detect(search_query)
        if verbose:
            print(f"🌍 Langue détectée : {lang_code}")
    except LangDetectException:
        if verbose:
            print("⚠️ Langue non détectée, utilisation par défaut : anglais")
        lang_code = 'en'

    # Configuration selon la langue
    base_domain = get_amazon_domain(lang_code)
    search_url = f"{base_domain}/s?k={quote(search_query)}"
    
    # Headers HTTP avancés
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ar;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
    }

    products = []
    page = 1
    max_pages = 10  # Limite de sécurité
    selectors = get_robust_selectors()

    while len(products) < num_products and page <= max_pages:
        url = f"{search_url}&page={page}"
        if verbose:
            print(f"📄 Scraping page {page} sur {url} ...")
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Sélecteurs CSS améliorés pour différents layouts Amazon
            items = (
                soup.select('.s-result-item[data-component-type="s-search-result"]') or
                soup.select('.s-result-item') or
                soup.select('[data-asin]') or
                soup.select('.sg-col-inner')
            )

            if not items:
                if verbose:
                    print("❌ Plus de résultats trouvés, arrêt du scraping.")
                break

            new_products_count = 0
            for item in items:
                try:
                    # Extraction des données avec fallbacks
                    name = extract_element_text(item, selectors['name'])
                    price_text = extract_element_text(item, selectors['price'])
                    rating_text = extract_element_text(item, selectors['rating'])
                    link = extract_element_href(item, selectors['link'], base_domain)
                    review_count_text = extract_element_text(item, selectors['reviews'])
                    badge = extract_element_text(item, selectors['badge']) or 'Aucun'

                    # Validation des données
                    if not name or not price_text or 'buying options' in name.lower():
                        continue

                    # Extraction du prix avec devise
                    price_float, currency = extract_price_and_currency(price_text, lang_code)
                    
                    # Traitement du rating
                    rating_float = 0.0
                    if rating_text:
                        rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                        if rating_match:
                            try:
                                rating_float = float(rating_match.group(1))
                            except ValueError:
                                pass
                    
                    # Traitement du nombre d'avis
                    review_count = 0
                    if review_count_text:
                        review_match = re.search(r'(\d+)', review_count_text.replace(',', ''))
                        if review_match:
                            review_count = int(review_match.group(1))
                    
                    review_score = min(review_count / 1000, 1.0)

                    # Calcul du score
                    score = calculate_winning_score(price_float, rating_float, review_score)
                    sku = f"SKU-{str(uuid.uuid4())[:8]}"

                    product = {
                        'SKU': sku,
                        'Nom': name,
                        'Prix': price_float,
                        'Devise': currency,
                        'Lien': link,
                        'Rating': rating_float,
                        'Review_Count': review_count,
                        'Badge': badge,
                        'Winning_Score': round(score, 2),
                        'Date_Scraping': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }

                    products.append(product)
                    new_products_count += 1

                    if len(products) >= num_products:
                        break
                        
                except Exception as e:
                    if verbose:
                        print(f"⚠️ Erreur lors du traitement d'un produit: {e}")
                    continue

            if new_products_count == 0:
                if verbose:
                    print("⚠️ Aucun nouveau produit ajouté cette page, arrêt du scraping.")
                break

            page += 1
            time.sleep(delay)

        except requests.RequestException as e:
            if verbose:
                print(f"❌ Erreur requête HTTP: {e}")
            break

    # Tri par score décroissant
    products = sorted(products, key=lambda x: x['Winning_Score'], reverse=True)

    # Génération du fichier CSV avec nom intelligent
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_query = re.sub(r'[^\w\s-]', '', search_query).replace(' ', '_')
    filename = f"{safe_query}_winning_products_{timestamp}.csv"
    
    try:
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            fieldnames = ['SKU', 'Nom', 'Prix', 'Devise', 'Lien', 'Rating', 'Review_Count', 'Badge', 'Winning_Score', 'Date_Scraping']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(products)
        
        if verbose:
            print(f"✅ Fichier CSV généré : {filename} avec {len(products)} produits.")
    except Exception as e:
        if verbose:
            print(f"❌ Erreur lors de la génération du CSV: {e}")

    # Statistiques détaillées
    stats = {}
    if products and return_stats:
        top = products[0]
        
        if verbose:
            print(f"\n🏆 Top produit gagnant :")
            print(f"SKU: {top['SKU']}")
            print(f"Nom: {top['Nom']}")
            print(f"Prix: {top['Prix']:.2f} {top['Devise']}")
            print(f"Rating: {top['Rating']}")
            print(f"Reviews: {top['Review_Count']}")
            print(f"Badge: {top['Badge']}")
            print(f"Score: {top['Winning_Score']:.2f}")
            print(f"Lien: {top['Lien']}")

        # Calcul des statistiques
        prices = [p['Prix'] for p in products if p['Prix'] > 0]
        ratings = [p['Rating'] for p in products if p['Rating'] > 0]
        reviews = [p['Review_Count'] for p in products]
        scores = [p['Winning_Score'] for p in products]

        stats = {
            'total_products': len(products),
            'avg_price': sum(prices) / len(prices) if prices else 0,
            'avg_rating': sum(ratings) / len(ratings) if ratings else 0,
            'total_reviews': sum(reviews),
            'avg_score': sum(scores) / len(scores) if scores else 0,
            'top_product': top,
            'filename': filename,
            'search_query': search_query,
            'lang_code': lang_code,
            'scraping_date': datetime.now().isoformat(),
            'currency': currency
        }

        if verbose:
            print(f"\n📊 Statistiques générales :")
            print(f"- Produits analysés : {stats['total_products']}")
            print(f"- Prix moyen : {stats['avg_price']:.2f} {currency}")
            if ratings:
                print(f"- Note moyenne : {stats['avg_rating']:.2f}")
            print(f"- Total avis cumulés : {stats['total_reviews']}")
            print(f"- Score moyen : {stats['avg_score']:.2f}")

    return {
        'products': products,
        'stats': stats,
        'success': len(products) > 0
    }

# Version pour FastAPI (sans I/O)
def scrape_products_api(search_query: str, num_products: int = 50, delay: int = 2) -> Dict:
    """Version de la fonction pour utilisation avec FastAPI (sans print/input)"""
    return scrape_products(search_query, num_products, delay, verbose=False, return_stats=True)

if __name__ == "__main__":
    search_term = input("Entrez le produit à rechercher (français, arabe, anglais...) : ")
    result = scrape_products(search_term, num_products=50, delay=2)
    
    if result['success']:
        print(f"\n✅ Scraping terminé avec succès !")
        print(f"📁 Fichier généré : {result['stats']['filename']}")
    else:
        print(f"\n❌ Aucun produit trouvé pour '{search_term}'") 