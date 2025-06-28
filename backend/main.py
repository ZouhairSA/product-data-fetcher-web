from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import requests
from bs4 import BeautifulSoup
import csv
from urllib.parse import quote
import uuid
import time
from langdetect import detect, LangDetectException

app = FastAPI()

class ScrapeRequest(BaseModel):
    search_query: str
    num_products: Optional[int] = 50
    delay: Optional[int] = 2

def calculate_winning_score(price, rating, review_score):
    price_score = 0.5 if 10 <= price <= 100 else 0.2
    rating_score = rating / 5.0 if rating > 0 else 0.0
    return (price_score + rating_score + review_score) / 3 * 100

def clean_title(name):
    name = name.strip()
    if name.isupper():
        name = name.capitalize()
    return name

def get_amazon_url(search_query, lang_code):
    if lang_code == 'fr':
        base = "https://www.amazon.fr"
    elif lang_code == 'ar':
        base = "https://www.amazon.sa"
    else:
        base = "https://www.amazon.com"
    search_url = f"{base}/s?k={quote(search_query)}"
    return search_url, base

def scrape_products(search_query, num_products=50, delay=2):
    try:
        lang_code = detect(search_query)
    except LangDetectException:
        lang_code = 'en'

    base_url, base_site = get_amazon_url(search_query, lang_code)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }

    products = []
    page = 1

    while len(products) < num_products:
        url = f"{base_url}&page={page}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            items = soup.select('.s-result-item')

            if not items:
                break

            new_products_count = 0
            for item in items:
                try:
                    name_elem = item.select_one('h2 a span') or item.select_one('.a-size-medium.a-text-normal')
                    price_elem = item.select_one('.a-price .a-offscreen') or item.select_one('.a-price-whole')
                    rating_elem = item.select_one('.a-icon-alt')
                    link_elem = item.select_one('h2 a')
                    review_elem = item.select_one('.a-size-small .a-link-normal span')
                    badge_elem = item.select_one('.s-label-popover-default')

                    name = clean_title(name_elem.text) if name_elem else None
                    price_text = price_elem.text.strip().replace('$', '').replace(',', '') if price_elem else None
                    rating_text = rating_elem.text.strip().split(' ')[0] if rating_elem else None
                    link = base_site + link_elem['href'] if link_elem else None
                    review_count_text = review_elem.text.replace(',', '') if review_elem else '0'
                    badge = badge_elem.text.strip() if badge_elem else 'Aucun'

                    if not name or not price_text or 'buying options' in name.lower():
                        continue

                    price_float = float(price_text)
                    rating_float = float(rating_text) if rating_text else 0.0
                    review_count = int(review_count_text) if review_count_text.isdigit() else 0
                    review_score = min(review_count / 1000, 1.0)

                    score = calculate_winning_score(price_float, rating_float, review_score)
                    sku = f"SKU-{str(uuid.uuid4())[:8]}"

                    product = {
                        'SKU': sku,
                        'Nom': name,
                        'Prix': price_float,
                        'Lien': link,
                        'Rating': rating_float,
                        'Review_Count': review_count,
                        'Badge': badge,
                        'Winning_Score': score
                    }

                    products.append(product)
                    new_products_count += 1

                    if len(products) >= num_products:
                        break
                except Exception:
                    continue

            if new_products_count == 0:
                break

            page += 1
            time.sleep(delay)

        except requests.RequestException:
            break

    products = sorted(products, key=lambda x: x['Winning_Score'], reverse=True)

    # Statistiques dynamiques
    prices = [p['Prix'] for p in products]
    ratings = [p['Rating'] for p in products if p['Rating'] > 0]
    reviews = [p['Review_Count'] for p in products]

    stats = {
        "total_products": len(products),
        "avg_price": round(sum(prices)/len(prices), 2) if prices else 0,
        "avg_rating": round(sum(ratings)/len(ratings), 2) if ratings else 0,
        "total_reviews": sum(reviews),
    }

    return {
        "products": products,
        "stats": stats,
        "success": len(products) > 0
    }

@app.post("/scrape")
def scrape_endpoint(req: ScrapeRequest):
    return scrape_products(req.search_query, req.num_products, req.delay) 