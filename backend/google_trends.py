"""
Module pour interagir avec Google Trends API
Permet de suivre les tendances de recherche pour les produits
"""
import sys
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

try:
    from pytrends.request import TrendReq
    PYTRENDS_AVAILABLE = True
except ImportError:
    PYTRENDS_AVAILABLE = False
    print("⚠️ pytrends non installé. Installez-le avec: pip install pytrends")


def init_trends():
    """Initialise la connexion à Google Trends"""
    if not PYTRENDS_AVAILABLE:
        raise ImportError("pytrends n'est pas installé. Installez-le avec: pip install pytrends")
    
    try:
        pytrends = TrendReq(hl='fr-FR', tz=360)  # Français, timezone UTC+1
        return pytrends
    except Exception as e:
        print(f"Erreur initialisation Google Trends: {e}")
        raise


def get_trends_data(
    keywords: List[str],
    timeframe: str = 'today 12-m',
    geo: str = 'SN',  # Sénégal par défaut
    cat: int = 0  # Toutes les catégories
) -> Dict:
    """
    Récupère les données de tendances pour une liste de mots-clés
    
    Args:
        keywords: Liste de mots-clés à rechercher (max 5)
        timeframe: Période de recherche (ex: 'today 12-m', 'today 3-m', 'today 1-m')
        geo: Code pays (SN pour Sénégal, FR pour France, etc.)
        cat: Catégorie (0 = toutes)
        
    Returns:
        Dictionnaire avec les données de tendances
    """
    if not PYTRENDS_AVAILABLE:
        return {
            "error": "pytrends n'est pas installé",
            "keywords": keywords,
            "data": []
        }
    
    try:
        # Limiter à 5 mots-clés maximum
        keywords = keywords[:5]
        
        pytrends = init_trends()
        
        # Construire la payload
        pytrends.build_payload(
            kw_list=keywords,
            timeframe=timeframe,
            geo=geo,
            cat=cat
        )
        
        # Récupérer les données de tendances
        interest_over_time = pytrends.interest_over_time()
        
        # Récupérer les données par région
        interest_by_region = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True, inc_geo_code=False)
        
        # Récupérer les requêtes liées
        related_queries = {}
        for keyword in keywords:
            try:
                related = pytrends.related_queries()
                if keyword in related and related[keyword]['rising'] is not None:
                    related_queries[keyword] = {
                        'rising': related[keyword]['rising'].head(10).to_dict('records') if related[keyword]['rising'] is not None else [],
                        'top': related[keyword]['top'].head(10).to_dict('records') if related[keyword]['top'] is not None else []
                    }
            except:
                related_queries[keyword] = {'rising': [], 'top': []}
        
        # Formater les données de tendances temporelles
        trends_data = []
        if not interest_over_time.empty:
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    keyword_data = interest_over_time[keyword].to_dict()
                    trends_data.append({
                        'keyword': keyword,
                        'data': [
                            {
                                'date': date.strftime('%Y-%m-%d'),
                                'value': int(value) if not (value != value) else 0  # Gérer NaN
                            }
                            for date, value in keyword_data.items()
                        ],
                        'average': float(interest_over_time[keyword].mean()) if not interest_over_time[keyword].empty else 0,
                        'max': int(interest_over_time[keyword].max()) if not interest_over_time[keyword].empty else 0,
                        'min': int(interest_over_time[keyword].min()) if not interest_over_time[keyword].empty else 0
                    })
        
        # Formater les données par région
        region_data = {}
        if not interest_by_region.empty:
            for keyword in keywords:
                if keyword in interest_by_region.columns:
                    region_data[keyword] = interest_by_region[keyword].sort_values(ascending=False).head(10).to_dict()
        
        return {
            "success": True,
            "keywords": keywords,
            "timeframe": timeframe,
            "geo": geo,
            "trends": trends_data,
            "regions": region_data,
            "related_queries": related_queries,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Erreur récupération tendances: {e}")
        return {
            "success": False,
            "error": str(e),
            "keywords": keywords,
            "data": []
        }


def compare_keywords(
    keywords: List[str],
    timeframe: str = 'today 12-m',
    geo: str = 'SN'
) -> Dict:
    """
    Compare plusieurs mots-clés pour voir lequel est le plus recherché
    
    Args:
        keywords: Liste de mots-clés à comparer (max 5)
        timeframe: Période de recherche
        geo: Code pays
        
    Returns:
        Dictionnaire avec la comparaison
    """
    if not PYTRENDS_AVAILABLE:
        return {
            "error": "pytrends n'est pas installé",
            "keywords": keywords,
            "comparison": []
        }
    
    try:
        keywords = keywords[:5]
        pytrends = init_trends()
        
        pytrends.build_payload(
            kw_list=keywords,
            timeframe=timeframe,
            geo=geo
        )
        
        interest_over_time = pytrends.interest_over_time()
        
        comparison = []
        if not interest_over_time.empty:
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    avg_interest = float(interest_over_time[keyword].mean())
                    max_interest = int(interest_over_time[keyword].max())
                    current_interest = int(interest_over_time[keyword].iloc[-1]) if len(interest_over_time) > 0 else 0
                    
                    comparison.append({
                        'keyword': keyword,
                        'average_interest': round(avg_interest, 2),
                        'max_interest': max_interest,
                        'current_interest': current_interest,
                        'trend': 'up' if current_interest > avg_interest else 'down' if current_interest < avg_interest else 'stable'
                    })
        
        # Trier par intérêt moyen décroissant
        comparison.sort(key=lambda x: x['average_interest'], reverse=True)
        
        return {
            "success": True,
            "keywords": keywords,
            "timeframe": timeframe,
            "geo": geo,
            "comparison": comparison,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Erreur comparaison tendances: {e}")
        return {
            "success": False,
            "error": str(e),
            "keywords": keywords,
            "comparison": []
        }


def get_seasonal_trends(
    keyword: str,
    years: int = 3,
    geo: str = 'SN'
) -> Dict:
    """
    Analyse les tendances saisonnières d'un mot-clé sur plusieurs années
    
    Args:
        keyword: Mot-clé à analyser
        years: Nombre d'années à analyser
        geo: Code pays
        
    Returns:
        Dictionnaire avec les tendances saisonnières
    """
    if not PYTRENDS_AVAILABLE:
        return {
            "error": "pytrends n'est pas installé",
            "keyword": keyword,
            "seasonal_data": []
        }
    
    try:
        pytrends = init_trends()
        
        # Calculer la date de début
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)
        timeframe = f"{start_date.strftime('%Y-%m-%d')} {end_date.strftime('%Y-%m-%d')}"
        
        pytrends.build_payload(
            kw_list=[keyword],
            timeframe=timeframe,
            geo=geo
        )
        
        interest_over_time = pytrends.interest_over_time()
        
        seasonal_data = []
        if not interest_over_time.empty:
            # Grouper par mois pour voir les tendances saisonnières
            monthly_data = {}
            for date, value in interest_over_time[keyword].items():
                month_key = date.strftime('%Y-%m')
                if month_key not in monthly_data:
                    monthly_data[month_key] = []
                monthly_data[month_key].append(int(value) if not (value != value) else 0)
            
            # Calculer la moyenne par mois
            for month, values in monthly_data.items():
                seasonal_data.append({
                    'month': month,
                    'average': round(sum(values) / len(values), 2),
                    'max': max(values),
                    'min': min(values)
                })
        
        seasonal_data.sort(key=lambda x: x['month'])
        
        return {
            "success": True,
            "keyword": keyword,
            "years": years,
            "geo": geo,
            "seasonal_data": seasonal_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Erreur analyse saisonnière: {e}")
        return {
            "success": False,
            "error": str(e),
            "keyword": keyword,
            "seasonal_data": []
        }


def get_related_topics(keyword: str, geo: str = 'SN') -> Dict:
    """
    Récupère les sujets liés à un mot-clé
    
    Args:
        keyword: Mot-clé à rechercher
        geo: Code pays
        
    Returns:
        Dictionnaire avec les sujets liés
    """
    if not PYTRENDS_AVAILABLE:
        return {
            "error": "pytrends n'est pas installé",
            "keyword": keyword,
            "topics": []
        }
    
    try:
        pytrends = init_trends()
        
        pytrends.build_payload(
            kw_list=[keyword],
            timeframe='today 12-m',
            geo=geo
        )
        
        related_topics = pytrends.related_topics()
        
        topics_data = {}
        if keyword in related_topics:
            rising = related_topics[keyword].get('rising')
            top = related_topics[keyword].get('top')
            
            topics_data = {
                'rising': rising.head(10).to_dict('records') if rising is not None and not rising.empty else [],
                'top': top.head(10).to_dict('records') if top is not None and not top.empty else []
            }
        
        return {
            "success": True,
            "keyword": keyword,
            "geo": geo,
            "topics": topics_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Erreur récupération sujets liés: {e}")
        return {
            "success": False,
            "error": str(e),
            "keyword": keyword,
            "topics": {}
        }

