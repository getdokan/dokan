Source: https://github.com/getdokan/plugin-internal-tasks/issues/349#issuecomment-2735270004

### Apply Coupon to Cart & Order:
Filepath: [includes/Vendor/Coupon.php (Lite)](../includes/Vendor/Coupon.php#L21)

```mermaid
flowchart TD
    %% Filepath: includes/Vendor/Coupon.php (Lite)
    A["Hooked into woocommerce_coupon_get_apply_quantity"] --> B["Remove current filter to prevent infinite recursion"]
    B --> C["Clone WC_Discounts object and reapply the coupon"]
    C --> D["Trigger dokan_wc_coupon_applied action"]
    D --> E{"Is context a Cart or an Order?"}
    E -- "Cart" --> F["Store associated discount data into Cart items"]
    E -- "Order" --> G["Store associated discount data into Order items"]
    G --> H["Reattach the coupon filter"]
    F --> H
```

### Remove Coupon From Order:
Filepath: [includes/Vendor/Coupon.php (Lite)](../includes/Vendor/Coupon.php#L23)

```mermaid
graph TD;
    A[Triggered by deleting a WC_Order_Item_Coupon] --> B[Initialize WC_Order_Item_Coupon with $item_id];
    B --> C{Does it have an Order ID?};
    C -- No --> Z[Return early];
    C -- Yes --> D[Get coupon code & order];
    D --> E[Remove coupon discount from order items];
    E --> F{Order has sub-orders?};

    F -- Yes --> G[Remove coupon from all child orders];

    F -- No --> H{Has it parent?};
    H -- Yes --> I[Get parent order];
    I --> J[Filter parent items with matching product IDs];
    J --> K[Remove coupon discount from matching parent items];
    H -- No --> Z1[No parent order — nothing else to do];
```

### Validation Flowchart
```mermaid
flowchart TD

%% Main Wrapper
subgraph Dokan_Coupon_Validation_Flow
    direction TB

    %% Lite Edition Flow
    subgraph Lite_Edition["Lite Edition (includes/Orders/Coupon.php)"]
        direction TB
        WCCPIV["Hook: woocommerce_coupon_is_valid"]
        IS_FIXED_CART{"Is it a Fixed Cart Coupon?"}
        THROW_FIXED["Throw Exception: Dokan does not support fixed cart coupons"]
        APPLY_DOKAN_FILTER["Apply Filter: dokan_coupon_is_valid"]
        FORWARD_TO_PRO["Forward Validation to PRO"]
    end

    %% PRO Edition Flow
    subgraph Pro_Edition["PRO Edition (includes/Coupons/ValidationHandler.php)"]
        direction TB
        DOKAN_COUPON_VALID["Hook: dokan_coupon_is_valid"]
        WC_IS_VALID_FOR_PRODUCT["Hook: woocommerce_coupon_is_valid_for_product"]
        WC_VALIDATE_MIN["Hook: woocommerce_coupon_validate_minimum_amount"]
        WC_VALIDATE_MAX["Hook: woocommerce_coupon_validate_maximum_amount"]
        BYPASS_WC_VALIDATION["Bypass WC min/max hooks and validate via Dokan filters"]
        
        DOKAN_MIN_VALID["Filter: dokan_coupon_is_minimum_amount_valid"]
        DOKAN_MAX_VALID["Filter: dokan_coupon_is_maximum_amount_valid"]
        VALIDATION_RESULT{"Are both Min & Max Valid?"}
        THROW_MIN_MAX["Throw Exception: Min/Max Spend not satisfied"]
        RETURN_VALID["Return: Coupon is valid"]
        VALIDATOR_IS_VALID["Call: Validator::is_valid_for_product"]
    end

    %% Spend Rule (Marketplace Coupon Logic)
    subgraph Spend_Validation["Marketplace/Vendor Coupon Spend Validation"]
        direction TB
        IS_MARKETPLACE{"Is it a Marketplace Coupon?"}
        ENABLED_ALL_VENDORS["Enabled for All Vendors?"]
        VENDOR_COUPON["Vendor-Specific Coupon"]
        GET_ELIGIBLE_VENDORS["Identify Eligible Vendors"]
        V1["Vendor 1"]
        V2["Vendor 2"]
        Vn["Vendor n"]
        SUM_TOTALS["Sum item totals from eligible vendors"]
        VALIDATE_TOTALS["Validate Min & Max Spend on combined total"]
    end
end

%% Lite Flow
WCCPIV --> IS_FIXED_CART
IS_FIXED_CART -- Yes --> THROW_FIXED
IS_FIXED_CART -- No --> APPLY_DOKAN_FILTER --> FORWARD_TO_PRO

%% Transition to PRO
FORWARD_TO_PRO --> DOKAN_COUPON_VALID

%% PRO Validation Flow
DOKAN_COUPON_VALID --> DOKAN_MIN_VALID --> VALIDATION_RESULT
DOKAN_COUPON_VALID --> DOKAN_MAX_VALID --> VALIDATION_RESULT
WC_VALIDATE_MIN --> BYPASS_WC_VALIDATION
WC_VALIDATE_MAX --> BYPASS_WC_VALIDATION
WC_IS_VALID_FOR_PRODUCT --> VALIDATOR_IS_VALID

VALIDATION_RESULT -- No --> THROW_MIN_MAX
VALIDATION_RESULT -- Yes --> RETURN_VALID

%% Marketplace/Vendor Spend Rule Logic
DOKAN_MIN_VALID & DOKAN_MAX_VALID --> IS_MARKETPLACE
IS_MARKETPLACE -- Yes --> ENABLED_ALL_VENDORS --> GET_ELIGIBLE_VENDORS
IS_MARKETPLACE -- No --> VENDOR_COUPON --> GET_ELIGIBLE_VENDORS
GET_ELIGIBLE_VENDORS --> V1 & V2 & Vn --> SUM_TOTALS --> VALIDATE_TOTALS --> VALIDATION_RESULT
```
