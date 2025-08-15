interface WebsiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
}

interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export function generateWebsiteSchema(): WebsiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MobilePrices.pk",
    url: import.meta.env.VITE_SITE_URL || "https://mobileprices.pk",
    description: "Pakistan's trusted mobile phone price comparison website",
    potentialAction: {
      "@type": "SearchAction",
      target: `${import.meta.env.VITE_SITE_URL || "https://mobileprices.pk"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateProductSchema(mobile: any): ProductSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: mobile.name,
    description: `${mobile.name} specifications and price in Pakistan`,
    image: mobile.carouselImages || [mobile.imageUrl],
    brand: {
      "@type": "Brand",
      name: mobile.brand
    },
    offers: {
      "@type": "Offer",
      price: mobile.price?.replace(/[₨,\s]/g, '') || "0",
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock"
    }
  };
}

export function generateBreadcrumbSchema(breadcrumbs: { label: string; href: string }[]): BreadcrumbSchema {
  const baseUrl = import.meta.env.VITE_SITE_URL || "https://mobileprices.pk";
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${baseUrl}${crumb.href}`
    }))
  };
}
