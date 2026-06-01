# Vendor Structured Data — Schema.org JSON-LD (F-09)

**Strategy ref:** [Dokan Agentic Commerce Strategy](https://hackmd.io/@anikfahmid/dokan-agentic-strategy) — F-09  
**Horizon:** H1 — Agent Accessible  
**Ships in:** Dokan Lite (free)

---

## What It Does

Injects vendor-attributed Schema.org JSON-LD markup on every product page and vendor storefront. This makes each vendor's identity visible to Google Shopping Graph, Bing Shopping, Perplexity, and any AI agent that reads page markup.

**The problem:** WooCommerce's default product schema has no `seller` field. Every product appears to be sold by the marketplace operator — vendor identity is invisible to AI agents and search engines before they even reach your catalog.

**After F-09:** Each product's structured data names the actual vendor as the seller. Agents can distinguish between vendors, compare sellers, and surface vendor-specific trust signals.

---

## Before / After

**Before (WooCommerce default):**
```json
{
  "@type": "Product",
  "name": "Trail Running Shoes",
  "offers": [{
    "@type": "Offer",
    "price": "129.00",
    "availability": "https://schema.org/InStock"
  }]
}
```

**After (with F-09):**
```json
{
  "@type": "Product",
  "name": "Trail Running Shoes",
  "offers": [{
    "@type": "Offer",
    "price": "129.00",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "@id": "https://mystore.com/store/greenleather/#organization",
      "name": "GreenLeather Co",
      "url": "https://mystore.com/store/greenleather/",
      "logo": "https://mystore.com/.../logo.jpg"
    }
  }],
  "brand": {
    "@type": "Brand",
    "name": "GreenLeather Co"
  }
}
```

Vendor storefront pages also emit a full `Store` + `Organization` `@graph` with a stable `@id` so Google and agents can cross-link vendor cards across product listings and the storefront page.

---

## Admin Attribution Control

WP Admin → Dokan → Settings → **Agent Attribution**

| Mode | Behavior |
|------|---------|
| **Per Vendor** (default) | `seller.name` = vendor store name; `seller.url` = vendor storefront |
| **Marketplace** | `seller.name` = site name; `seller.url` = site URL (white-label: buyers see marketplace brand, not individual vendors) |
| **Disabled** | No JSON-LD injected by Dokan (use when an SEO plugin handles all schema) |

The same setting controls attribution across F-03 (AI Product Feed) and F-05 (Semantic Search API responses) via the global `dokan_agent_attribution_mode()` helper.

---

## Filters & Extensibility

```php
// Opt out entirely (e.g., SEO plugin handles all schema)
add_filter( 'dokan_jsonld_enabled', '__return_false' );

// Modify product JSON-LD after Dokan builds it
add_filter( 'dokan_jsonld_product', function( array $data, WC_Product $product ): array {
    // Add aggregate rating from your review system
    $data['aggregateRating'] = [ ... ];
    return $data;
}, 10, 2 );

// Modify vendor store JSON-LD
add_filter( 'dokan_jsonld_vendor_store', function( array $data, int $vendor_id ): array {
    $data['address'] = [ '@type' => 'PostalAddress', ... ];
    return $data;
}, 10, 2 );
```

**Global attribution helper** (usable by Pro modules and themes):
```php
$mode = dokan_agent_attribution_mode(); // returns 'vendor' | 'marketplace' | 'off'
```

---

## Implementation Files

| File | Role |
|------|------|
| `includes/StructuredData/Manager.php` | Bootstrap; instantiates ProductSchema + VendorStoreSchema; arg-less constructor (League container constraint) |
| `includes/StructuredData/Helper.php` | Vendor lookup, Organization node builder, logo resolution, current-store detection |
| `includes/StructuredData/ProductSchema.php` | Hooks `woocommerce_structured_data_product`; attaches seller to each Offer; injects brand |
| `includes/StructuredData/VendorStoreSchema.php` | Emits Store + Organization @graph on store pages via `wp_head` |
| `includes/StructuredData/Settings.php` | Admin attribution control (Per Vendor / Marketplace / Disabled) |
| `includes/functions.php` | `dokan_agent_attribution_mode()` global helper |

---

## Planned Extensions (P2)

- Marketplace homepage `Organization` schema with `subOrganization` list of top vendors
- `aggregateRating` on vendor `Organization` — conditional when Dokan Store Reviews module is active
- `hasMerchantReturnPolicy` + `shippingDetails` from vendor settings
- `location` address node when vendor has a structured address

---

## Related Features

- **F-04 Agent Discovery** — sibling H1 free build; llms.txt signals what agents can access
- **F-03 AI Product Feed** — same vendor attribution differentiator applied to ACP/UCP/Perplexity feeds
- **F-05 Semantic Search** — uses `dokan_agent_attribution_mode()` for consistent vendor identity in API responses
