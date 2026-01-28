# Breaking Changes Analysis - Status Page Legacy Code Cleanup

## Overview

This document identifies **potential breaking changes** from removing legacy Status page elements (`StatusElementFactory`, `StatusElement` abstract class, and all concrete `StatusElement` classes).

## ✅ Safe (No Breaking Changes)

### 1. **Frontend Compatibility** ✅

- **Status**: No breaking changes
- **Reason**: Frontend receives the same JSON data structure via REST API
- **Verification**: `StatusElementAdapter` converts FieldFactory output to legacy format
- **Files**: `src/Status/*.tsx` - All frontend code works unchanged

### 2. **REST API** ✅

- **Status**: No breaking changes
- **Reason**: `Status::render()` returns the same array format
- **Verification**: `AdminDashboardController::get_status()` works unchanged
- **Files**: `includes/REST/AdminDashboardController.php`

### 3. **WordPress Hooks & Filters** ✅

- **Status**: No breaking changes
- **Hooks Preserved**:
  - `dokan_status_after_describing_elements` - Still fires with `Status` instance
  - `dokan_status_field_factory_elements` - Still works (filter)
  - `dokan_status_element_render_{hook_key}` - Still fires (filter)
- **Files**: `includes/Admin/Status/Status.php`, `includes/FieldFactory/Adapters/StatusElementAdapter.php`

### 4. **VendorNavMenuChecker** ✅

- **Status**: Already migrated
- **Reason**: Uses FieldFactory directly
- **Files**: `includes/VendorNavMenuChecker.php`

---

## ⚠️ Potential Breaking Changes

### 1. **Direct StatusElementFactory Usage** 🔴 **BREAKING**

**Impact**: **HIGH** - Will cause fatal errors

**What Breaks**:

```php
// ❌ This will cause fatal error: Class 'StatusElementFactory' not found
$section = StatusElementFactory::section('id');
$table = StatusElementFactory::table('id');
```

**Affected Code**:

- Any third-party plugins/extensions using `StatusElementFactory` directly
- Any custom code in themes/plugins that creates status elements

**Migration Path**:

```php
// ✅ New way using FieldFactory
$section = FieldFactory::section('id', 'Title');
$table = FieldFactory::create([
    'id' => 'id',
    'type' => 'table',
    'title' => 'Title',
    'headers' => ['Header 1', 'Header 2'],
]);
```

**Detection**:

- Search codebase for `StatusElementFactory::`
- Check third-party plugins for usage

---

### 2. **StatusElement Class Extension** 🔴 **BREAKING**

**Impact**: **HIGH** - Will cause fatal errors

**What Breaks**:

```php
// ❌ This will cause fatal error: Class 'StatusElement' not found
class CustomStatusElement extends StatusElement {
    // ...
}
```

**Affected Code**:

- Any custom classes extending `StatusElement`
- Any third-party extensions that extend status elements

**Migration Path**:

```php
// ✅ New way - extend FieldFactory elements
use WeDevs\Dokan\FieldFactory\Elements\Layouts\Section;

class CustomStatusElement extends Section {
    // ...
}
```

**Detection**:

- Search for `extends StatusElement`
- Check third-party plugins for class extensions

---

### 3. **StatusElement Type Hints** 🔴 **BREAKING**

**Impact**: **MEDIUM** - Will cause type errors

**What Breaks**:

```php
// ❌ This will cause type error
function add_status_element(StatusElement $element) {
    // ...
}
```

**Affected Code**:

- Functions/methods with `StatusElement` type hints
- Type declarations in interfaces

**Migration Path**:

```php
// ✅ New way - use ElementInterface
use WeDevs\Dokan\FieldFactory\Contracts\ElementInterface;

function add_status_element(ElementInterface $element) {
    // ...
}
```

**Detection**:

- Search for `StatusElement` in function signatures
- Check for type hints: `: StatusElement`, `StatusElement $`

---

### 4. **Status::add() Method Signature Change** 🟡 **POTENTIALLY BREAKING**

**Impact**: **MEDIUM** - Type mismatch errors

**What Changed**:

```php
// ❌ Old signature (no longer works)
public function add(StatusElement $element): self

// ✅ New signature
public function add(ElementInterface $element): self
```

**Affected Code**:

- Code passing `StatusElement` instances to `Status::add()`
- Type-checked code expecting `StatusElement`

**Migration Path**:

```php
// ✅ Convert StatusElement to FieldFactory element first
// Or use FieldFactory directly
$status->add(FieldFactory::section('id', 'Title'));
```

**Note**: This is already broken since we removed `StatusElement`, but worth documenting.

---

### 5. **Filter Hook Parameter Type Change** 🟡 **POTENTIALLY BREAKING**

**Impact**: **LOW** - May cause type-checking issues

**What Changed**:

```php
// Filter: dokan_status_element_render_{hook_key}
// ❌ Old: Received StatusElement instance
// ✅ New: Receives ElementInterface instance
apply_filters('dokan_status_element_render_' . $hook_key, $status_format, $element);
```

**Affected Code**:

- Filter callbacks that type-check the `$element` parameter
- Code expecting `StatusElement` methods/properties

**Migration Path**:

```php
// ✅ Use ElementInterface methods
add_filter('dokan_status_element_render_my_hook', function($status_format, $element) {
    // $element is now ElementInterface, not StatusElement
    // Use $element->get_id(), $element->to_array(), etc.
    return $status_format;
}, 10, 2);
```

**Note**: Most filters only modify the array format, so this is low risk.

---

### 6. **Class Autoloading** 🟡 **POTENTIALLY BREAKING**

**Impact**: **LOW** - Only if classes are referenced but not used

**What Breaks**:

- Any code that references deleted classes (even if not instantiated)
- Reflection code checking for class existence

**Detection**:

- Search for `class_exists('StatusElement')`
- Check for `is_subclass_of($obj, 'StatusElement')`

---

## 🔍 Detection Checklist

Use these commands to find potential breaking changes:

```bash
# Find StatusElementFactory usage
grep -r "StatusElementFactory::" /path/to/plugins

# Find StatusElement extensions
grep -r "extends StatusElement" /path/to/plugins

# Find StatusElement type hints
grep -r "StatusElement \$" /path/to/plugins
grep -r ": StatusElement" /path/to/plugins

# Find instanceof checks
grep -r "instanceof.*StatusElement" /path/to/plugins

# Find class_exists checks
grep -r "class_exists.*StatusElement" /path/to/plugins
```

---

## 📋 Migration Guide for Third-Party Developers

### Before (Legacy)

```php
use WeDevs\Dokan\Admin\Status\StatusElementFactory;
use WeDevs\Dokan\Abstracts\StatusElement;

// Create elements
$section = StatusElementFactory::section('id')
    ->set_title('Title')
    ->set_description('Description');

$table = StatusElementFactory::table('table_id')
    ->set_headers(['Col1', 'Col2']);

// Add to status
$status = new Status();
$status->add($section);
$status->add($table);
```

### After (FieldFactory)

```php
use WeDevs\Dokan\FieldFactory\FieldFactory;
use WeDevs\Dokan\Admin\Status\Status;

// Create elements
$section = FieldFactory::section('id', 'Title', [
    'description' => 'Description',
]);

$table = FieldFactory::create([
    'id' => 'table_id',
    'type' => 'table',
    'title' => 'Table Title',
    'headers' => ['Col1', 'Col2'],
]);

// Add to status
$status = new Status();
$status->add($section);
$status->add($table);
```

---

## 🛡️ Mitigation Strategies

### 1. **Version Check**

Add version checks in your code:

```php
if (version_compare(dokan()->version, '4.0.0', '>=')) {
    // Use FieldFactory
} else {
    // Use legacy StatusElementFactory (if still available)
}
```

### 2. **Graceful Degradation**

Check for class existence:

```php
if (class_exists('WeDevs\Dokan\FieldFactory\FieldFactory')) {
    // Use FieldFactory
} else {
    // Fallback or error message
}
```

### 3. **Documentation**

- Update plugin documentation
- Add migration notices
- Provide upgrade guides

---

## 📊 Risk Assessment Summary

| Breaking Change | Impact | Likelihood | Risk Level |
|----------------|--------|------------|------------|
| Direct StatusElementFactory usage | HIGH | MEDIUM | 🔴 **HIGH** |
| StatusElement class extension | HIGH | LOW | 🟡 **MEDIUM** |
| StatusElement type hints | MEDIUM | LOW | 🟡 **MEDIUM** |
| Status::add() signature | MEDIUM | LOW | 🟡 **MEDIUM** |
| Filter hook parameter type | LOW | LOW | 🟢 **LOW** |
| Class autoloading | LOW | VERY LOW | 🟢 **LOW** |

---

## ✅ Recommendations

1. **Before Release**:
   - Search entire codebase (including third-party plugins) for `StatusElementFactory` and `StatusElement`
   - Test with popular Dokan extensions
   - Add deprecation notices if needed

2. **Documentation**:
   - Update developer documentation
   - Create migration guide
   - Add changelog entry

3. **Communication**:
   - Notify extension developers
   - Provide migration examples
   - Offer support for migration

4. **Testing**:
   - Test with clean install
   - Test with existing installations
   - Test third-party extensions

---

## 📝 Notes

- **Frontend is safe**: No changes to frontend code needed
- **REST API is safe**: Same data structure returned
- **Hooks are safe**: All hooks still work
- **Core functionality is safe**: Status page works as before

**Main Risk**: Third-party code using legacy classes directly will break.

---

## 🚨 Critical Path Analysis

### Critical Paths That MUST Work

These are the **most critical paths** that could cause site-wide failures if broken:

#### 1. **REST API Endpoint: `/wp-json/dokan/v1/admin/dashboard/status`** 🔴 **CRITICAL**

**Why Critical**:

- Frontend depends entirely on this endpoint
- Admin dashboard status page will fail to load
- No fallback mechanism exists

**Current Implementation**:

```php
// includes/REST/AdminDashboardController.php
public function get_status( $request ) {
    $status = dokan_get_container()->get( Status::class );
    $content = $status->render();
    return rest_ensure_response( $content );
}
```

**Potential Failure Points**:

1. ❌ **Fatal Error**: If `Status` class fails to instantiate
2. ❌ **Fatal Error**: If `Status::render()` throws exception
3. ❌ **Empty Response**: If `StatusElementAdapter` fails
4. ❌ **Wrong Format**: If adapter returns wrong structure

**Detection**:

```bash
# Test REST endpoint
curl -X GET "https://example.com/wp-json/dokan/v1/admin/dashboard/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected: JSON array with status elements
# Failure: 500 error, empty array, or wrong structure
```

**Mitigation**:

```php
// Add error handling in REST controller
public function get_status( $request ) {
    try {
        $status = dokan_get_container()->get( Status::class );
        $content = $status->render();
        
        // Validate response structure
        if ( ! is_array( $content ) ) {
            return new WP_Error( 
                'invalid_status_format', 
                'Status data format is invalid',
                [ 'status' => 500 ]
            );
        }
        
        return rest_ensure_response( $content );
    } catch ( Exception $e ) {
        dokan_log( 'Status endpoint error: ' . $e->getMessage() );
        return new WP_Error( 
            'status_endpoint_error', 
            'Failed to retrieve status data',
            [ 'status' => 500 ]
        );
    }
}
```

**Rollback Plan**:

1. Revert `Status.php` to previous version
2. Restore deleted `StatusElement` classes
3. Clear object cache
4. Test endpoint immediately

---

#### 2. **Frontend Status Page Loading** 🔴 **CRITICAL**

**Why Critical**:

- Admin users cannot access status page
- No error recovery in frontend
- Breaks admin workflow

**Current Implementation**:

```typescript
// src/Status/Status.tsx
apiFetch< Array< StatusElement > >( {
    path: 'dokan/v1/admin/dashboard/status',
} )
    .then( ( data ) => {
        setAllSettings( data );
        setLoading( false );
    } )
    .catch( ( error ) => {
        setLoading( false );
        // ⚠️ No error handling - page just shows empty
    } );
```

**Potential Failure Points**:

1. ❌ **API Error**: REST endpoint returns 500
2. ❌ **Wrong Structure**: Data doesn't match `StatusElement` type
3. ❌ **Missing Fields**: Required fields missing (id, type, etc.)
4. ❌ **Type Mismatch**: TypeScript type errors

**Detection**:

```javascript
// Add to frontend error handling
.catch( ( error ) => {
    console.error( 'Status page error:', error );
    setLoading( false );
    // Show error message to user
    setError( 'Failed to load status page. Please refresh.' );
} );
```

**Validation**:

```typescript
// Validate response structure
const validateStatusData = ( data: any ): data is StatusElement[] => {
    if ( ! Array.isArray( data ) ) return false;
    return data.every( ( item ) => 
        item && 
        typeof item.id === 'string' && 
        typeof item.type === 'string'
    );
};

// Use in API call
.then( ( data ) => {
    if ( ! validateStatusData( data ) ) {
        throw new Error( 'Invalid status data format' );
    }
    setAllSettings( data );
} );
```

**Mitigation**:

- Add error boundaries in React
- Show user-friendly error messages
- Add retry mechanism
- Log errors to monitoring service

---

#### 3. **WordPress Hook: `dokan_status_after_describing_elements`** 🟡 **HIGH PRIORITY**

**Why Critical**:

- `VendorNavMenuChecker` depends on this hook
- Other plugins may use this hook
- Missing elements break functionality

**Current Implementation**:

```php
// includes/VendorNavMenuChecker.php
add_action( 'dokan_status_after_describing_elements', [ $this, 'add_status_section' ] );
```

**Potential Failure Points**:

1. ❌ **Hook Not Fired**: If `Status::describe()` fails early
2. ❌ **Wrong Parameter Type**: Hook receives wrong object type
3. ❌ **Method Not Found**: `add_status_section()` fails

**Detection**:

```php
// Add hook verification
add_action( 'dokan_status_after_describing_elements', function( $status ) {
    if ( ! $status instanceof Status ) {
        dokan_log( 'ERROR: dokan_status_after_describing_elements received wrong type' );
        return;
    }
    // Hook is working
}, 1 ); // Priority 1 to catch early
```

**Mitigation**:

```php
// In VendorNavMenuChecker
public function add_status_section( $status ) {
    // Validate parameter
    if ( ! $status instanceof Status ) {
        dokan_log( 'VendorNavMenuChecker: Invalid Status instance' );
        return;
    }
    
    try {
        // Existing code...
    } catch ( Exception $e ) {
        dokan_log( 'VendorNavMenuChecker error: ' . $e->getMessage() );
        // Don't break status page if this fails
    }
}
```

---

#### 4. **StatusElementAdapter Conversion** 🟡 **HIGH PRIORITY**

**Why Critical**:

- Converts FieldFactory → Legacy format
- If this fails, frontend receives wrong data
- No fallback mechanism

**Potential Failure Points**:

1. ❌ **Missing Methods**: Element doesn't have required methods
2. ❌ **Type Errors**: Wrong element type passed
3. ❌ **Recursive Errors**: Infinite loop in nested structures
4. ❌ **Memory Issues**: Large nested structures

**Detection**:

```php
// Add validation in adapter
public static function to_status_format( ElementInterface $element, string $parent_hook_key = 'dokan_status' ): array {
    try {
        // Validate element
        if ( ! $element instanceof ElementInterface ) {
            throw new InvalidArgumentException( 'Element must implement ElementInterface' );
        }
        
        // Existing conversion logic...
        
    } catch ( Exception $e ) {
        dokan_log( 'StatusElementAdapter error: ' . $e->getMessage() );
        // Return minimal valid structure
        return [
            'id' => $element->get_id() ?? 'error',
            'type' => 'error',
            'title' => 'Error loading element',
            'description' => '',
            'data' => '',
            'hook_key' => $parent_hook_key . '_error',
            'children' => [],
        ];
    }
}
```

**Mitigation**:

- Add try-catch around conversion
- Validate element structure before conversion
- Return error element instead of failing
- Log errors for debugging

---

### Critical Path Testing Checklist

Before deploying, test these critical paths:

#### ✅ Pre-Deployment Tests

1. **REST API Test**:

   ```bash
   # Test endpoint returns valid JSON
   curl -X GET "/wp-json/dokan/v1/admin/dashboard/status" \
     -H "Authorization: Bearer TOKEN" | jq .
   
   # Verify structure
   # Should return array of objects with: id, type, title, etc.
   ```

2. **Frontend Test**:
   - [ ] Load admin dashboard
   - [ ] Navigate to Status page
   - [ ] Verify all sections render
   - [ ] Check browser console for errors
   - [ ] Test with different user roles

3. **Hook Test**:

   ```php
   // Add test hook
   add_action( 'dokan_status_after_describing_elements', function( $status ) {
       error_log( 'Hook fired: ' . get_class( $status ) );
   } );
   ```

4. **Error Handling Test**:
   - [ ] Simulate missing class (rename temporarily)
   - [ ] Verify graceful error handling
   - [ ] Check error logs

#### ✅ Post-Deployment Monitoring

1. **Error Monitoring**:
   - Monitor PHP error logs for `StatusElement` references
   - Monitor REST API error rates
   - Track frontend JavaScript errors

2. **Performance Monitoring**:
   - Monitor REST endpoint response time
   - Check for memory leaks in adapter
   - Monitor database queries

3. **User Feedback**:
   - Monitor support tickets
   - Check for "status page not loading" reports
   - Track admin dashboard usage

---

### Rollback Procedure

If critical paths break:

#### Step 1: Immediate Rollback

```bash
# Revert Status.php
git checkout HEAD~1 includes/Admin/Status/Status.php

# Restore deleted classes
git checkout HEAD~1 includes/Admin/Status/StatusElementFactory.php
git checkout HEAD~1 includes/Abstracts/StatusElement.php
# ... restore all deleted files

# Clear caches
wp cache flush
```

#### Step 2: Verify Rollback

```bash
# Test REST endpoint
curl -X GET "/wp-json/dokan/v1/admin/dashboard/status"

# Test frontend
# Load admin dashboard status page
```

#### Step 3: Investigate

- Check error logs
- Identify which critical path failed
- Document issue
- Plan fix

#### Step 4: Re-deploy (After Fix)

- Fix identified issues
- Re-run critical path tests
- Deploy during low-traffic period
- Monitor closely

---

### Emergency Contacts & Escalation

**If Critical Paths Break**:

1. **Immediate Actions**:
   - [ ] Check error logs
   - [ ] Test REST endpoint
   - [ ] Verify frontend loads
   - [ ] Check hook execution

2. **If REST API Fails**:
   - [ ] Rollback `Status.php`
   - [ ] Restore `StatusElement` classes
   - [ ] Clear object cache
   - [ ] Notify team

3. **If Frontend Fails**:
   - [ ] Check browser console
   - [ ] Verify API response format
   - [ ] Check TypeScript types
   - [ ] Rollback if needed

4. **If Hooks Fail**:
   - [ ] Check hook registration
   - [ ] Verify hook parameters
   - [ ] Check `VendorNavMenuChecker`
   - [ ] Review error logs

---

### Critical Path Summary

| Path | Risk Level | Detection | Mitigation | Rollback Time |
|------|-----------|-----------|------------|---------------|
| REST API Endpoint | 🔴 **CRITICAL** | API test | Error handling | < 5 min |
| Frontend Loading | 🔴 **CRITICAL** | UI test | Error boundaries | < 5 min |
| WordPress Hooks | 🟡 **HIGH** | Hook test | Validation | < 10 min |
| Adapter Conversion | 🟡 **HIGH** | Unit test | Try-catch | < 10 min |

**Total Estimated Rollback Time**: < 15 minutes

---

**Last Updated**: 2026-01-28
**Version**: 4.0.0
