"""
Logique de fuzzy search pour améliorer les résultats de recherche
Gère les variantes, pluriels, accents, etc.
"""
import re
from typing import List, Dict, Callable


def generate_search_variants(terme: str) -> List[str]:
    """
    Génère des variantes d'un terme de recherche pour améliorer les résultats.
    
    Args:
        terme: Terme de recherche original
        
    Returns:
        Liste de variantes à essayer
    """
    variantes = [terme]  # Commencer par le terme original
    
    terme_lower = terme.lower().strip()
    
    # 1. Terme original
    if terme_lower not in variantes:
        variantes.append(terme_lower)
    
    # 2. Sans accents (pour le français)
    terme_sans_accents = remove_accents(terme_lower)
    if terme_sans_accents not in variantes:
        variantes.append(terme_sans_accents)
    
    # 3. Pluriel -> Singulier
    if terme_lower.endswith('s') and len(terme_lower) > 1:
        singulier = terme_lower[:-1]
        if singulier not in variantes:
            variantes.append(singulier)
    
    # 4. Singulier -> Pluriel
    if not terme_lower.endswith('s'):
        pluriel = terme_lower + 's'
        if pluriel not in variantes:
            variantes.append(pluriel)
    
    # 5. Avec/sans tirets
    if '-' in terme_lower:
        sans_tiret = terme_lower.replace('-', ' ')
        if sans_tiret not in variantes:
            variantes.append(sans_tiret)
    else:
        avec_tiret = terme_lower.replace(' ', '-')
        if avec_tiret not in variantes:
            variantes.append(avec_tiret)
    
    # 6. Termes composés - essayer chaque mot
    mots = terme_lower.split()
    if len(mots) > 1:
        # Essayer chaque mot individuellement
        for mot in mots:
            if len(mot) > 3:  # Ignorer les mots trop courts
                if mot not in variantes:
                    variantes.append(mot)
    
    # 7. Variantes courantes en français avec synonymes
    variantes_fr = {
        'telephone': ['smartphone', 'mobile', 'portable', 'telephone'],
        'ordi': ['ordinateur', 'laptop', 'pc', 'portable'],
        'tv': ['television', 'ecran', 'téléviseur'],
        'frigo': ['refrigerateur', 'refrigerateur', 'frigidaire'],
        'perruque': ['cheveux', 'postiche', 'toupet', 'cheveux postiches', 'extension cheveux', 'wig'],
        'vetement': ['habit', 'tenue', 'habillement', 'vêtement'],
        'chaussure': ['soulier', 'basket', 'sneaker', 'chaussures'],
        'maquillage': ['cosmetique', 'beaute', 'makeup'],
        'parfum': ['fragrance', 'eau de toilette', 'eau de parfum'],
    }
    
    # Ajouter des synonymes spécifiques pour le terme recherché
    for key, synonyms in variantes_fr.items():
        if key in terme_lower:
            variantes.extend(synonyms)
        for synonym in synonyms:
            if synonym in terme_lower:
                variantes.append(key)
                variantes.extend([s for s in synonyms if s != synonym])
    
    # 8. Pour "perruque" spécifiquement, ajouter des termes liés
    if 'perruque' in terme_lower or 'perruques' in terme_lower:
        variantes.extend([
            'cheveux', 'extension cheveux', 'postiche', 'toupet', 'wig', 
            'hair extension', 'cheveux naturels', 'cheveux synthétiques',
            'cheveux postiches', 'perruque cheveux', 'perruques cheveux', 
            'postiche cheveux', 'extension', 'mèches', 'tresses',
            'cheveux humains', 'cheveux brésiliens', 'cheveux indiens'
        ])
    
    # 9. Essayer avec/sans articles (le, la, les, un, une)
    articles = ['le ', 'la ', 'les ', 'un ', 'une ', 'des ']
    for article in articles:
        if terme_lower.startswith(article):
            sans_article = terme_lower[len(article):]
            if sans_article and sans_article not in variantes:
                variantes.append(sans_article)
        else:
            avec_article = article + terme_lower
            if avec_article not in variantes:
                variantes.append(avec_article)
    
    # Retirer les doublons et les termes trop courts
    variantes_uniques = []
    seen = set()
    for v in variantes:
        v_clean = v.strip()
        if len(v_clean) >= 2 and v_clean not in seen:
            variantes_uniques.append(v_clean)
            seen.add(v_clean)
    
    return variantes_uniques[:10]  # Limiter à 10 variantes


def remove_accents(text: str) -> str:
    """
    Retire les accents d'un texte.
    
    Args:
        text: Texte avec accents
        
    Returns:
        Texte sans accents
    """
    import unicodedata
    try:
        # Normaliser en NFD et retirer les accents
        nfd = unicodedata.normalize('NFD', text)
        return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')
    except:
        # Fallback simple
        replacements = {
            'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
            'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
            'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
            'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
            'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'ñ': 'n'
        }
        result = text
        for accented, unaccented in replacements.items():
            result = result.replace(accented, unaccented)
            result = result.replace(accented.upper(), unaccented.upper())
        return result


def calculer_pertinence(produit: Dict, terme: str, variantes: List[str]) -> float:
    """
    Calcule un score de pertinence pour un produit.
    Version stricte : nécessite que le terme ou une variante soit présent.
    
    Args:
        produit: Dictionnaire du produit
        terme: Terme de recherche original
        variantes: Liste des variantes testées
        
    Returns:
        Score de pertinence (0-100)
    """
    score = 0.0
    nom = (produit.get('nom') or '').lower()
    categorie = (produit.get('categorie') or '').lower()
    marque = (produit.get('marque') or '').lower()
    
    terme_lower = terme.lower()
    terme_mots = terme_lower.split()
    
    # Vérifier si le terme ou une variante pertinente est présente
    terme_present = terme_lower in nom
    variante_presente = False
    variante_utilisee = None
    
    # Vérifier les variantes pertinentes (pas toutes, seulement les principales)
    variantes_principales = variantes[:10]  # Top 10 variantes
    for v in variantes_principales:
        v_lower = v.lower()
        if v_lower in nom:
            variante_presente = True
            variante_utilisee = v_lower
            break
    
    # Si ni le terme ni une variante n'est présente, score très bas
    if not terme_present and not variante_presente:
        # Vérifier si au moins un mot du terme est présent
        mots_presents = sum(1 for mot in terme_mots if mot in nom)
        if mots_presents == 0:
            return 0.0  # Aucun lien, score 0
        elif mots_presents < len(terme_mots):
            score += 5.0  # Score très bas si seulement quelques mots
    else:
        # Score basé sur la présence du terme dans le nom (poids fort)
        if terme_present:
            score += 60.0
        elif variante_presente:
            score += 50.0
        
        # Score basé sur la position dans le nom (au début = plus pertinent)
        if nom.startswith(terme_lower):
            score += 25.0
        elif variante_utilisee and nom.startswith(variante_utilisee):
            score += 20.0
        elif terme_lower in nom[:30]:  # Dans les 30 premiers caractères
            score += 15.0
        
        # Score basé sur la catégorie
        if terme_lower in categorie or (variante_utilisee and variante_utilisee in categorie):
            score += 10.0
        
        # Bonus si le terme exact est présent comme mot complet
        if terme_lower in nom.split():
            score += 15.0
    
    # Pénalité FORTE si le produit contient des mots non liés (téléphone, ordinateur, etc.)
    mots_non_pertinents = ['telephone', 'smartphone', 'laptop', 'ordinateur', 'tv', 'television', 
                           'casque', 'ecouteur', 'sony', 'samsung', 'apple', 'iphone', 'ipad',
                           'enceinte', 'bluetooth', 'ecran', 'moniteur', 'clavier', 'souris']
    
    mots_non_pertinents_trouves = [mot for mot in mots_non_pertinents if mot in nom]
    if mots_non_pertinents_trouves and not terme_present and not variante_presente:
        score = 0.0  # Score 0 si produit non pertinent ET terme absent
    elif mots_non_pertinents_trouves:
        score -= 40.0  # Pénalité forte même si terme présent
    
    # Bonus si plusieurs mots du terme sont présents
    if terme_present or variante_presente:
        mots_terme_presents = sum(1 for mot in terme_mots if mot in nom)
        if mots_terme_presents == len(terme_mots):
            score += 10.0
    
    return max(0.0, min(100.0, score))


def fuzzy_search_jumia(terme: str, scraper_func: Callable[[str, int], List[Dict]], limit: int = 20) -> List[Dict]:
    """
    Effectue une recherche fuzzy sur Jumia en essayant plusieurs variantes.
    Filtre les résultats par pertinence.
    
    Args:
        terme: Terme de recherche original
        scraper_func: Fonction de scraping à utiliser
        limit: Nombre maximum de produits par variante
        
    Returns:
        Liste de produits trouvés, triés par pertinence
    """
    variantes = generate_search_variants(terme)
    print(f"🔍 Recherche fuzzy pour '{terme}'")
    print(f"   Variantes à essayer: {len(variantes)}")
    
    tous_produits = []
    produits_vus = set()  # Pour éviter les doublons
    
    for i, variante in enumerate(variantes, 1):
        print(f"   [{i}/{len(variantes)}] Essai: '{variante}'")
        
        try:
            produits = scraper_func(variante, limit)
            
            if produits:
                print(f"      ✅ {len(produits)} produits trouvés")
                
                # Ajouter les produits non déjà vus avec calcul de pertinence
                for produit in produits:
                    # Identifier unique par lien ou nom
                    identifiant = produit.get('lien') or produit.get('nom', '')
                    if identifiant and identifiant not in produits_vus:
                        # Calculer le score de pertinence
                        score = calculer_pertinence(produit, terme, variantes)
                        produit['_pertinence'] = score
                        
                        # Ne garder que les produits avec un score minimum (seuil plus élevé)
                        if score >= 30.0:  # Seuil minimum de pertinence plus strict
                            tous_produits.append(produit)
                            produits_vus.add(identifiant)
                            print(f"         ✓ '{produit.get('nom', '')[:50]}...' (score: {score:.1f})")
                        else:
                            print(f"         ✗ '{produit.get('nom', '')[:50]}...' (score trop bas: {score:.1f})")
                
                # Si on a assez de résultats pertinents, on peut s'arrêter
                produits_pertinents = [p for p in tous_produits if p.get('_pertinence', 0) >= 40.0]
                if len(produits_pertinents) >= limit:
                    print(f"      🎯 Assez de résultats pertinents ({len(produits_pertinents)}), arrêt de la recherche")
                    break
            else:
                print(f"      ❌ Aucun résultat")
                
        except Exception as e:
            print(f"      ⚠️ Erreur: {e}")
            continue
    
    # Trier par pertinence (score décroissant)
    tous_produits.sort(key=lambda x: x.get('_pertinence', 0), reverse=True)
    
    # Retirer le champ _pertinence avant de retourner
    for produit in tous_produits:
        produit.pop('_pertinence', None)
    
    print(f"📊 Total produits pertinents trouvés: {len(tous_produits)}")
    return tous_produits[:limit]  # Limiter au nombre demandé

