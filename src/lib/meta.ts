import { Product } from "../types";
import { getProductSlug } from "./slug";

function setMetaTag(attrName: "name" | "property", attrValue: string, content: string) {
  if (typeof document === "undefined") return;
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Dynamically updates document.title and Open Graph / Twitter / SEO meta tags
 * for the current active product or homepage.
 */
export function updatePageMetaTags(product: Product | null) {
  if (typeof document === "undefined") return;

  const siteName = "ZENVIA — Ultra-Luxury Lifestyle";
  const baseUrl = window.location.origin;

  if (product) {
    const slug = getProductSlug(product);
    const productUrl = `${baseUrl}/product/${slug}`;
    const pageTitle = `${product.name} | Zenvia`;
    const description = `${product.name} — ${product.tagline || product.description}. Order online at Zenvia with Free India Express Shipping and Cash on Delivery.`;
    const image = product.image;

    document.title = pageTitle;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", pageTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:url", productUrl);
    setMetaTag("property", "og:type", "product");
    setMetaTag("property", "og:site_name", "Zenvia");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", pageTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);
  } else {
    document.title = siteName;
    const defaultDesc =
      "ZENVIA — Curated ultra-luxury gadgets, home lifestyle accessories, and aesthetic utility finds across India.";
    setMetaTag("name", "description", defaultDesc);
    setMetaTag("property", "og:title", siteName);
    setMetaTag("property", "og:description", defaultDesc);
    setMetaTag("property", "og:image", `${baseUrl}/icon.png`);
    setMetaTag("property", "og:url", baseUrl);
    setMetaTag("property", "og:type", "website");
  }
}
