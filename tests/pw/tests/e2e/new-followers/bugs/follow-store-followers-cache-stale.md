# Bug: vendor "Followers" list stays stale after a customer unfollows (cache key mismatch)

**Module:** `follow_store` (Dokan Pro)
**Surface:** vendor dashboard → Followers (`/dashboard/new/#/followers`, and the legacy `/dashboard/followers`); REST `GET /dokan/v1/follow-store/followers`
**Severity:** medium — a vendor keeps seeing a customer as a follower for up to **2 weeks** after that customer unfollowed.

## Summary

When a customer unfollows a store, the vendor's followers list does **not** update. The
unfollowed customer keeps appearing in the list (and in the followers count) until the
cache entry expires on its own (default TTL `WEEK_IN_SECONDS * 2`).

## Root cause (cache key mismatch)

The REST controller caches each followers query under a **hashed** key:

`dokan-pro/modules/follow-store/includes/class-dokan-follow-store-rest-controller.php:307-346`
```php
$cache_group = "followers_{$args['vendor_id']}";
$cache_key   = 'get_followers_' . md5( wp_json_encode( $args ) );  // e.g. get_followers_ab12…
$followers = Cache::get( $cache_key, $cache_group );
// …on miss: query DB, then Cache::set( $cache_key, $results, $cache_group );
```

The follow/unfollow toggle tries to invalidate that cache, but deletes a **different,
un-hashed** key:

`dokan-pro/modules/follow-store/includes/FollowStoreCache.php:37-41`
```php
public function clear_cache( $vendor_id, $follower_id, $status, $current_time ) {
    $cache_group = "followers_{$vendor_id}";
    Cache::delete( 'get_followers', $cache_group );   // ← key never matches get_followers_<md5>
}
```

`Cache::delete( 'get_followers', … )` removes only the literal key `get_followers`; it can
never match the controller's per-argument `get_followers_<md5(args)>` entries. So the list
cache survives the toggle. (`Cache` is `wp_cache_*`-backed with a group-prefix versioning
scheme — see `dokan-lite/includes/Traits/ObjectCache.php`.)

## Suggested fix

Invalidate the whole group instead of one literal key — the group-prefix bump reaches every
hashed entry:

```php
public function clear_cache( $vendor_id, $follower_id, $status, $current_time ) {
    \WeDevs\Dokan\Cache::invalidate_group( "followers_{$vendor_id}" );
}
```

(`ObjectCache::invalidate_group()` exists for exactly this, `dokan-lite/includes/Traits/ObjectCache.php:163-172`.)
The `functions.php` follower helper caches under the un-hashed `get_followers` key, so the
current `delete()` only ever clears that one path, not the REST list path.

## Reproduction

1. As a customer, follow a vendor's store (`POST /dokan/v1/follow-store` `{vendor_id}`).
2. As the vendor, open Followers — the customer appears (cold-cache population).
3. As the customer, unfollow the store.
4. As the vendor, reload Followers — **the customer is still listed** (stale cache).

Confirmed live on the wp-env Docker site (localhost:9999): after `apiUtils.unfollowStore(...)`
and a full page reload, the follower row remained for the entire 15s assertion window.

## Test impact

`tests/e2e/new-followers/newFollowers.spec.ts` — the "unfollowing (REST) removes the follower
from the vendor list (React)" case is marked `test.fixme` referencing this note (the product
does not reflect the unfollow, so a truthful behavioral assertion cannot pass). The follow
direction ("a customer who follows the vendor appears in the list") is a cold-cache population
and is asserted normally. Re-enable the fixme case once the invalidation is fixed.
