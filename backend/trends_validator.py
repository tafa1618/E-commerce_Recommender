"""
Module pour valider les produits Jumia en croisant avec Google Trends
Permet de déterminer si un produit tendance sur Jumia est aussi tendance sur Google
"""
from typing import Dict, List, Optional
from datetime import datetime
from google_trends import get_trends_data, compare_keywords, get_seasonal_trends
import re


def extract_keywords_from_product(produit: Dict) -> List[str]:
    """
    Extrait les mots-clés pertinents d'un produit Jumia pour la recherche Google Trends
    
    Args:
        produit: Dictionnaire du produit Jumia
        
    Returns:
        Liste de mots-clés à rechercher
    """
    keywords = []
    
    # Nom du produit
    nom = produit.get('nom', '').lower()
    if nom:
        # Nettoyer le nom (retirer les caractères spéciaux, les numéros de modèle)
        nom_clean = re.sub(r'\d+', '', nom)  # Retirer les chiffres
        nom_clean = re.sub(r'[^\w\s]', ' ', nom_clean)  # Retirer la ponctuation
        mots = nom_clean.split()
        
        # Garder les mots significatifs (plus de 3 caractères)
        mots_significatifs = [m for m in mots if len(m) > 3]
        
        # Prendre les 2-3 premiers mots les plus importants
        if len(mots_significatifs) >= 2:
            keywords.append(' '.join(mots_significatifs[:2]))
            keywords.append(mots_significatifs[0])  # Premier mot seul
        elif len(mots_significatifs) == 1:
            keywords.append(mots_significatifs[0])
    
    # Catégorie
    categorie = produit.get('categorie', '').lower()
    if categorie and categorie not in keywords:
        keywords.append(categorie)
    
    # Marque
    marque = produit.get('marque', '').lower()
    if marque and marque not in keywords:
        # Ne pas ajouter la marque seule si c'est trop générique (Samsung, Apple, etc.)
        marques_generiques = ['samsung', 'apple', 'sony', 'lg', 'huawei', 'xiaomi', 'oppo', 'vivo']
        if marque not in marques_generiques:
            keywords.append(marque)
    
    # Retirer les doublons et limiter à 3 mots-clés max
    keywords_unique = []
    seen = set()
    for kw in keywords:
        if kw and kw not in seen and len(kw) > 2:
            keywords_unique.append(kw)
            seen.add(kw)
            if len(keywords_unique) >= 3:
                break
    
    return keywords_unique


def validate_product_trend(produit: Dict, timeframe: str = 'today 3-m', geo: str = 'SN') -> Dict:
    """
    Valide si un produit Jumia est aussi tendance sur Google Trends
    
    Args:
        produit: Dictionnaire du produit Jumia
        timeframe: Période d'analyse (recommandé: 'today 3-m' pour tendances récentes)
        geo: Code pays
        
    Returns:
        Dictionnaire avec le résultat de la validation
    """
    try:
        # Extraire les mots-clés du produit
        keywords = extract_keywords_from_product(produit)
        
        if not keywords:
            return {
                "validated": False,
                "reason": "Impossible d'extraire des mots-clés pertinents du produit",
                "keywords": [],
                "trends_data": None,
                "score": 0
            }
        
        # Récupérer les données Google Trends
        trends_result = get_trends_data(
            keywords=keywords[:3],  # Max 3 mots-clés
            timeframe=timeframe,
            geo=geo
        )
        
        if not trends_result.get("success") or not trends_result.get("trends"):
            return {
                "validated": False,
                "reason": "Aucune donnée Google Trends disponible",
                "keywords": keywords,
                "trends_data": None,
                "score": 0
            }
        
        # Analyser les tendances
        trends = trends_result.get("trends", [])
        validation_score = 0
        validation_details = []
        
        for trend in trends:
            keyword = trend.get("keyword", "")
            average = trend.get("average", 0)
            max_value = trend.get("max", 0)
            current_value = 0
            
            # Calculer la valeur actuelle (dernière valeur disponible)
            data_points = trend.get("data", [])
            if data_points:
                # Prendre la moyenne des 4 dernières semaines
                recent_values = [p.get("value", 0) for p in data_points[-4:]]
                current_value = sum(recent_values) / len(recent_values) if recent_values else 0
            
            # Score de validation basé sur plusieurs critères
            score_keyword = 0
            
            # 1. Intérêt moyen élevé (score 0-30)
            if average >= 50:
                score_keyword += 30
            elif average >= 30:
                score_keyword += 20
            elif average >= 15:
                score_keyword += 10
            
            # 2. Tendance à la hausse (score 0-40)
            if current_value > average * 1.2:  # 20% au-dessus de la moyenne
                score_keyword += 40
                validation_details.append(f"📈 '{keyword}' en forte hausse (+{((current_value/average - 1) * 100):.0f}%)")
            elif current_value > average * 1.1:  # 10% au-dessus
                score_keyword += 25
                validation_details.append(f"📈 '{keyword}' en hausse (+{((current_value/average - 1) * 100):.0f}%)")
            elif current_value >= average * 0.9:  # Stable
                score_keyword += 15
                validation_details.append(f"➡️ '{keyword}' stable")
            else:
                validation_details.append(f"📉 '{keyword}' en baisse")
            
            # 3. Pic récent (score 0-30)
            if max_value > 0:
                # Vérifier si le max est récent (dans les 30 derniers jours)
                if data_points:
                    recent_max = max([p.get("value", 0) for p in data_points[-8:]])  # 8 dernières semaines
                    if recent_max >= max_value * 0.8:  # Le max est récent
                        score_keyword += 30
                        validation_details.append(f"🔥 Pic récent pour '{keyword}'")
            
            validation_score = max(validation_score, score_keyword)
        
        # Déterminer si le produit est validé
        validated = validation_score >= 50  # Seuil de validation
        
        # Raison de validation/rejet
        if validated:
            reason = f"✅ Produit validé: tendance confirmée sur Google Trends (score: {validation_score}/100)"
        else:
            reason = f"⚠️ Produit non validé: tendance faible ou en baisse sur Google Trends (score: {validation_score}/100)"
        
        return {
            "validated": validated,
            "reason": reason,
            "keywords": keywords,
            "trends_data": trends_result,
            "score": validation_score,
            "details": validation_details,
            "recommendation": get_recommendation(validation_score, trends_result)
        }
        
    except Exception as e:
        return {
            "validated": False,
            "reason": f"Erreur lors de la validation: {str(e)}",
            "keywords": [],
            "trends_data": None,
            "score": 0
        }


def get_recommendation(score: float, trends_data: Dict) -> str:
    """
    Génère une recommandation basée sur le score de validation
    
    Args:
        score: Score de validation (0-100)
        trends_data: Données Google Trends
        
    Returns:
        Recommandation textuelle
    """
    if score >= 70:
        return "🟢 GO FORT: Produit très tendance, opportunité excellente"
    elif score >= 50:
        return "🟡 GO MODÉRÉ: Produit tendance, opportunité bonne"
    elif score >= 30:
        return "🟠 ATTENTION: Tendance faible, marché saturé ou déclinant"
    else:
        return "🔴 NO GO: Produit peu recherché, risque élevé"


def validate_multiple_products(produits: List[Dict], timeframe: str = 'today 3-m', geo: str = 'SN') -> List[Dict]:
    """
    Valide plusieurs produits Jumia en une seule fois
    
    Args:
        produits: Liste de produits Jumia
        timeframe: Période d'analyse
        geo: Code pays
        
    Returns:
        Liste de résultats de validation pour chaque produit
    """
    results = []
    
    for produit in produits:
        validation = validate_product_trend(produit, timeframe, geo)
        results.append({
            "produit": produit,
            "validation": validation
        })
    
    # Trier par score décroissant
    results.sort(key=lambda x: x["validation"]["score"], reverse=True)
    
    return results


def compare_jumia_vs_trends(produits_jumia: List[Dict], timeframe: str = 'today 3-m', geo: str = 'SN') -> Dict:
    """
    Compare les produits tendance sur Jumia avec les tendances Google Trends
    
    Args:
        produits_jumia: Liste de produits Jumia (supposés tendance)
        timeframe: Période d'analyse
        geo: Code pays
        
    Returns:
        Analyse comparative
    """
    validations = validate_multiple_products(produits_jumia, timeframe, geo)
    
    validated_count = sum(1 for v in validations if v["validation"]["validated"])
    total_count = len(validations)
    
    # Produits validés (GO)
    produits_go = [v for v in validations if v["validation"]["validated"]]
    
    # Produits non validés (NO GO)
    produits_no_go = [v for v in validations if not v["validation"]["validated"]]
    
    # Statistiques
    scores = [v["validation"]["score"] for v in validations]
    score_moyen = sum(scores) / len(scores) if scores else 0
    
    return {
        "total_produits": total_count,
        "produits_valides": validated_count,
        "produits_non_valides": total_count - validated_count,
        "taux_validation": (validated_count / total_count * 100) if total_count > 0 else 0,
        "score_moyen": round(score_moyen, 2),
        "produits_go": produits_go,
        "produits_no_go": produits_no_go,
        "recommandation_globale": get_global_recommendation(validated_count, total_count, score_moyen)
    }


def get_global_recommendation(validated: int, total: int, score_moyen: float) -> str:
    """
    Génère une recommandation globale basée sur les résultats
    
    Args:
        validated: Nombre de produits validés
        total: Nombre total de produits
        score_moyen: Score moyen
        
    Returns:
        Recommandation globale
    """
    taux = (validated / total * 100) if total > 0 else 0
    
    if taux >= 70 and score_moyen >= 60:
        return "🟢 Excellente opportunité: La majorité des produits sont validés par Google Trends"
    elif taux >= 50 and score_moyen >= 50:
        return "🟡 Opportunité modérée: Environ la moitié des produits sont validés"
    elif taux >= 30:
        return "🟠 Opportunité limitée: Seulement quelques produits sont validés"
    else:
        return "🔴 Risque élevé: Peu de produits validés, marché peut-être saturé"

