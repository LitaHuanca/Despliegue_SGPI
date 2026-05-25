import re
from datetime import date
from typing import List, Optional
from bs4 import BeautifulSoup
from colorama import Fore, Style

from vrip_connector.engines.base import BaseExtractor
from vrip_connector.core.models import ConvocatoriaModel
from vrip_connector.utils.date_parser import parse_spanish_date, extract_deadline_from_text, calculate_days_remaining

class VripConvocatoriasExtractor(BaseExtractor):
    def __init__(self):
        super().__init__("vrip_convocatorias")

    def extract(self, year: Optional[int] = None, **kwargs) -> List[ConvocatoriaModel]:
        """
        Scrapes funding opportunities/convocatorias from VRIP portal.
        Supports both Elementor Page Builder grids and classic WP post layouts.
        """
        target_year = year if year else date.today().year
        
        # Build URL based on target year
        url = self.source_config.get("url", "https://vrip.unmsm.edu.pe/convocatoria-2026/")
        if year:
            url = f"https://vrip.unmsm.edu.pe/convocatoria-{target_year}/"

        print(f"{Fore.GREEN}[Convocatorias VRIP]{Style.RESET_ALL} Iniciando raspado en vivo: {url}...")
        
        # Fetch web page content
        response = self.client.get(url)
        if not response:
            # Try fallbacks from config
            fallbacks = self.source_config.get("fallback_urls", [])
            for fb_url in fallbacks:
                print(f"{Fore.YELLOW}[Convocatorias VRIP]{Style.RESET_ALL} Intento fallido. Probando fallback: {fb_url}")
                response = self.client.get(fb_url)
                if response:
                    url = fb_url
                    break

        if not response:
            print(f"{Fore.RED}[Convocatorias VRIP] Error: No se pudo cargar ninguna página de convocatorias.{Style.RESET_ALL}")
            return []

        html_content = response.text
        soup = BeautifulSoup(html_content, "html.parser")
        items: List[ConvocatoriaModel] = []
        seen_titles = set()

        # 1. Elementor Containers layout
        elementor_containers = soup.select(".e-con-inner, .elementor-element.e-con")
        if elementor_containers:
            print(f"[Convocatorias VRIP] Se detectó diseño de Elementor Grid. {len(elementor_containers)} contenedores encontrados.")
            for c in elementor_containers:
                title_elem = c.find(["h1", "h2", "h3", "h4", "p"])
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                
                # Filter out generic site headings/elements
                if not title or title.lower() in [
                    "convocatorias", "descargas", "siguenos en:", "direcciones generales", "inicio", 
                    "vicerrectorado de investigación y posgrado", "novedades", "noticias"
                ]:
                    continue
                
                # Ensure it pertains to research funding or programs
                keywords = ["programa", "proyecto", "financiamiento", "subvención", "subvencion", "concurso", "taller", "equipamiento", "fiduciario", "perez-guerrero", "investigacion", "investigación"]
                if not any(kw in title.lower() for kw in keywords):
                    continue
                    
                if title in seen_titles:
                    continue
                    
                # Extract Elementor buttons (normally directivas or cronogramas)
                buttons = c.select(".elementor-button")
                cronograma_link = ""
                directiva_link = ""
                
                for btn in buttons:
                    btn_text = btn.get_text(strip=True).lower()
                    btn_href = btn.get("href", "")
                    if "cronograma" in btn_text:
                        cronograma_link = btn_href
                    elif "directiva" in btn_text or "bases" in btn_text:
                        directiva_link = btn_href
                
                if not cronograma_link and not directiva_link:
                    continue
                    
                seen_titles.add(title)
                
                # Determine Year / Publish Date context from links
                publish_year = str(target_year)
                for link in [cronograma_link, directiva_link]:
                    year_match = re.search(r'/20(2\d)/', link)
                    if year_match:
                        publish_year = f"20{year_match.group(1)}"
                        break
                
                # We do not guess status, we extract objective dates
                deadline_original = "Ver cronograma" if cronograma_link else "Ver bases"
                parsed_deadline = None
                
                # If there's an explicit date in the Elementor container text, let's extract it!
                container_text = c.get_text(" ", strip=True)
                extracted_text, extracted_date = extract_deadline_from_text(container_text)
                if extracted_date:
                    deadline_original = extracted_text
                    parsed_deadline = extracted_date
                
                final_link = directiva_link if directiva_link else cronograma_link

                items.append(ConvocatoriaModel(
                    titulo=title,
                    entidad_promotora="Vicerrectorado de Investigación y Posgrado (VRIP) - UNMSM",
                    fecha_publicacion=f"Convocatoria {publish_year}",
                    plazo_cierre=parsed_deadline.isoformat() if parsed_deadline else None,
                    plazo_cierre_original=deadline_original,
                    enlace=final_link,
                    dias_restantes=calculate_days_remaining(parsed_deadline) if parsed_deadline else None
                ))

        # 2. Fallback to classic WP articles layout if Elementor parsing found nothing
        if not items:
            selectors = self.source_config.get("selectors", {})
            post_selector = selectors.get("item", "article, .post, .entry, .type-post")
            posts = soup.select(post_selector)

            if not posts:
                posts = soup.find_all("div", class_=re.compile(r"post|entry|article"))
            if not posts:
                posts = soup.find_all(["h2", "h3"])

            print(f"[Convocatorias VRIP] Probando fallback clásico: {len(posts)} posibles posts encontrados.")

            for post in posts:
                try:
                    title_elem = post.select_one(selectors.get("title", "h2.entry-title a, h1.entry-title a, a"))
                    if not title_elem and post.name in ["h2", "h3"]:
                        title_elem = post if post.name == "a" else post.find("a")
                    
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)
                    link = title_elem.get("href", "")

                    if not link:
                        continue
                    if not link.startswith("http"):
                        link = "https://vrip.unmsm.edu.pe" + link

                    # Title keywords filter
                    keywords = ["convocatoria", "proyecto", "financiamiento", "programa", "subvencion", "subvención", "concurso", "pconfigi", "pmulti", "investigacion", "investigación"]
                    if not any(kw in title.lower() for kw in keywords):
                        continue

                    if title in seen_titles:
                        continue

                    seen_titles.add(title)

                    # Extract publication date
                    date_elem = post.select_one(selectors.get("date", ".entry-date, .date, time"))
                    date_str = date_elem.get_text(strip=True) if date_elem else "No especificada"

                    # Try to extract deadline date from post description text
                    snippet_text = post.get_text(strip=True)
                    deadline_original, parsed_deadline = extract_deadline_from_text(snippet_text)

                    # Check for direct link to document
                    guidelines_elem = post.select_one(selectors.get("link", "a[href*='bases'], a[href*='pdf']"))
                    guidelines_link = guidelines_elem.get("href", "") if guidelines_elem else ""
                    
                    if guidelines_link and not guidelines_link.startswith("http"):
                        guidelines_link = "https://vrip.unmsm.edu.pe" + guidelines_link
                    
                    if not guidelines_link:
                        guidelines_link = link

                    items.append(ConvocatoriaModel(
                        titulo=title,
                        entidad_promotora="Vicerrectorado de Investigación y Posgrado (VRIP) - UNMSM",
                        fecha_publicacion=date_str,
                        plazo_cierre=parsed_deadline.isoformat() if parsed_deadline else None,
                        plazo_cierre_original=deadline_original,
                        enlace=guidelines_link,
                        dias_restantes=calculate_days_remaining(parsed_deadline) if parsed_deadline else None
                    ))
                except Exception as e:
                    continue

        print(f"[Convocatorias VRIP] Raspado completado. {len(items)} convocatorias vigentes encontradas.")
        return items
