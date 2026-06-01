# Agent Discovery — llms.txt + AI Agent Policy (F-04)

**Strategy ref:** [Dokan Agentic Commerce Strategy](https://hackmd.io/@anikfahmid/dokan-agentic-strategy) — F-04  
**Horizon:** H1 — Agent Accessible  
**Ships in:** Dokan Lite (free)

---

## What It Does

Dokan automatically generates two machine-readable files at your marketplace root that tell AI crawlers and agents what your marketplace is, what it sells, and what operations agents can perform.

| Endpoint | Format | Purpose |
|----------|--------|---------|
| `/llms.txt` | Plain text (llmstxt.org spec) | AI crawlers (OAI-SearchBot, PerplexityBot, GPTBot) use this before indexing |
| `/ai-agent-policy` | JSON | Structured capability declaration for agent clients |

**Why this matters:** AI crawlers check `llms.txt` before indexing a site. Without it, crawlers guess what a marketplace is and skip ambiguous sites. This is half a day of effort for zero-cost discoverability.

---

## What Gets Published

Both files include a snapshot of your marketplace:

- Marketplace name and description
- Vendor count and product count
- Top product categories
- API endpoint links (REST, MCP, ACP feed when active)
- Agent permissions (read catalog, create cart, etc.)
- Return and shipping policy signals

Example `/llms.txt` output:
```
# Marketplace: My Outdoor Store
> A multi-vendor marketplace for outdoor and adventure gear.

Vendors: 24
Products: 847
Categories: Camping, Hiking, Climbing, Water Sports

## API
- REST: https://mystore.com/wp-json/dokan/v2/
- MCP: https://mystore.com/wp-json/wc/mcp/v1/ (when WC MCP active)

## Agent Permissions
- read:catalog
- read:vendor-profiles
- read:product-availability

## Policies
- Returns: 30-day returns on all vendor orders
- Shipping: Vendor-managed shipping zones
```

---

## Technical Details

- **Delivery:** WordPress rewrite rules, not static files. Works on hardened hosts; content is always fresh.
- **Cache:** 6-hour transient. Bypassed when `WP_DEBUG` is true for development.
- **Cache invalidation triggers:** Product save/delete, vendor registration/deletion/role change, Dokan settings save, daily WP-Cron safety net.
- **SEO:** `X-Robots-Tag: noindex` on `/llms.txt` so the file itself doesn't get indexed — only the content it describes matters.

---

## Filters & Extensibility

Other Dokan modules (and third-party plugins) can contribute data via filters:

```php
// Add custom endpoints to llms.txt
add_filter( 'dokan_agent_discovery_endpoints', function( array $endpoints ): array {
    $endpoints['custom_feed'] = home_url( '/my-custom-feed.json' );
    return $endpoints;
});

// Add capability flags
add_filter( 'dokan_agent_discovery_capabilities', function( array $caps ): array {
    $caps[] = 'checkout:ucp'; // e.g., when UCP is active
    return $caps;
});

// Modify full llms.txt body
add_filter( 'dokan_llms_txt_body', function( string $body ): string {
    return $body . "\n## Custom Section\nExtra info for agents.";
});

// Modify ai-agent-policy JSON payload
add_filter( 'dokan_agent_policy_payload', function( array $payload ): array {
    $payload['custom_data'] = 'value';
    return $payload;
});
```

**AI Product Feed integration:** When F-03 (AI Product Feed) is active and ACP is enabled, it auto-registers its feed URL via `dokan_agent_discovery_endpoints`.

---

## Implementation Files

| File | Role |
|------|------|
| `includes/AgentDiscovery/Manager.php` | Rewrite rules, request dispatch, cache, invalidation hooks |
| `includes/AgentDiscovery/DataProvider.php` | Snapshot aggregator — vendor count, product count, categories, endpoints |
| `includes/AgentDiscovery/LLMsTxt.php` | Plain text renderer (llmstxt.org spec) |
| `includes/AgentDiscovery/AgentPolicy.php` | JSON renderer |

---

## Related Features

- **F-09 Vendor Structured Data** — JSON-LD on product/store pages (same H1 agent-accessibility push)
- **F-03 AI Product Feed** — registers its ACP feed URL into Agent Discovery when active
- **F-16 Agent Abilities** — auto-registers ability endpoint in agent policy
