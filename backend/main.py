from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import time
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    search_query: str
    num_products: Optional[int] = 20
    delay: Optional[int] = 2

def scrape_meta_ads(search_query, num_ads=20, delay=2):
    base_url = f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q={quote(search_query)}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    ads = []

    try:
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # ATTENTION : La structure HTML de Meta Ads Library change souvent.
        # Ce sélecteur est un exemple, il faudra peut-être l'adapter selon le HTML réel.
        ad_blocks = soup.find_all('div', {'data-testid': 'ad-library-ad-card'})  # Peut changer !
        for ad in ad_blocks:
            try:
                title_elem = ad.find('div', {'data-testid': 'ad-library-ad-creative'})
                title = title_elem.text.strip() if title_elem else "No title"
                image_elem = ad.find('img')
                image = image_elem['src'] if image_elem else None
                link_elem = ad.find('a', href=True)
                link = link_elem['href'] if link_elem else None

                ads.append({
                    'title': title,
                    'image': image,
                    'link': link
                })
                if len(ads) >= num_ads:
                    break
            except Exception as e:
                continue
    except Exception as e:
        return {
            "ads": [],
            "total_ads": 0,
            "success": False,
            "error": str(e)
        }

    return {
        "ads": ads,
        "total_ads": len(ads),
        "success": True
    }

@app.post("/scrape_meta_ads")
def scrape_meta_ads_route(req: ScrapeRequest):
    try:
        return scrape_meta_ads(req.search_query, req.num_products, req.delay)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port) 