<?php

namespace WeDevs\Dokan\ProductEditor;

defined( 'ABSPATH' ) || exit;

/**
 * Product Form Elements
 *
 * @since 5.0.0
 */
class Elements {
    // Section ids.
    const SECTION_GENERAL = 'general';
    const SECTION_INVENTORY = 'inventory';
    const SECTION_DOWNLOADABLE = 'downloadable_options';
    const SECTION_OTHERS = 'others';
    const SECTION_SHIPPING = 'shipping';
    const SECTION_ATTRIBUTES_AND_VARIATIONS = 'attributes-and-variations';
    const PRODUCT_TYPE_SIMPLE = 'simple';
    const PRODUCT_TYPE_VARIABLE = 'variable';
    const PRODUCT_TYPE_GROUPED = 'grouped';
    const PRODUCT_TYPE_EXTERNAL = 'external';
    const PRODUCT_TYPE_VARIATION = 'variation';
    const SECTION_LINKED = 'linked';

    // Layout IDs.
    const ROOT_LAYOUT               = 'root_layout';
    const PRIMARY_COLUMN            = 'primary_column';
    const SIDEBAR_COLUMN            = 'sidebar_column';
    const SECTION_DIGITAL_OPTIONS   = 'digital_options';
    const SECTION_DISCOUNT_SCHEDULE = 'discount_schedule';
    const SECTION_DESCRIPTION       = 'description_section';
    const SECTION_SHIPPING_DIMENSIONS = 'shipping_dimensions';
    const SECTION_SHIPPING_OVERWRITE  = 'shipping_overwrite';
    const SECTION_PUBLISHING        = 'product_publishing';
    const SECTION_PURCHASE_NOTE     = 'purchase_note_section';
    const ID = 'id';
    const TYPE = 'type';
    const NAME = 'name';
    const DESCRIPTION = 'description';
    const ENABLED = 'enabled';
    const SHORT_DESCRIPTION = 'short_description';
    const STATUS = 'status';
    const SLUG = 'slug';
    const MENU_ORDER = 'menu_order';
    const REVIEWS_ALLOWED = 'reviews_allowed';
    const VIRTUAL = 'virtual';
    const TAX_STATUS = 'tax_status';
    const TAX_CLASS = 'tax_class';
    const CATALOG_VISIBILITY = 'catalog_visibility';
    const PURCHASE_NOTE = 'purchase_note';
    const FEATURED = 'featured';
    const SKU = 'sku';
    const GLOBAL_UNIQUE_ID = 'global_unique_id';
    const WEIGHT = 'weight';
    const DIMENSIONS = 'dimensions';
    const DIMENSIONS_HEIGHT = 'height';
    const DIMENSIONS_WIDTH = 'width';
    const DIMENSIONS_LENGTH = 'length';
    const SHIPPING_CLASS = 'shipping_class';
    const ATTRIBUTES = 'attributes';
    const ATTRIBUTES_ID = 'id';
    const ATTRIBUTES_NAME = 'name';
    const ATTRIBUTES_OPTIONS = 'options';
    const ATTRIBUTES_POSITION = 'position';
    const ATTRIBUTES_VISIBLE = 'visible';
    const ATTRIBUTES_VARIATION = 'variation';
    const DEFAULT_ATTRIBUTES = 'default_attributes';
    const REGULAR_PRICE = 'regular_price';
    const SALE_PRICE = 'sale_price';
    const DATE_CREATED = 'date_created';
    const DATE_CREATED_GMT = 'date_created_gmt';
    const DATE_ON_SALE_FROM = 'date_on_sale_from';
    const DATE_ON_SALE_FROM_GMT = 'date_on_sale_from_gmt';
    const DATE_ON_SALE_TO = 'date_on_sale_to';
    const DATE_ON_SALE_TO_GMT = 'date_on_sale_to_gmt';
    const PARENT_ID = 'parent_id';
    const SOLD_INDIVIDUALLY = 'sold_individually';
    const LOW_STOCK_AMOUNT = 'low_stock_amount';
    const STOCK_STATUS = 'stock_status';
    const MANAGE_STOCK = 'manage_stock';
    const BACKORDERS = 'backorders';
    const STOCK_QUANTITY = 'stock_quantity';
    const INVENTORY_DELTA = 'inventory_delta';
    const UPSELL_IDS = 'upsell_ids';
    const CROSS_SELL_IDS = 'cross_sell_ids';
    const CATEGORIES = 'category_ids';
    const TAGS = 'product_tag';
    const BRANDS = 'product_brand';
    const DOWNLOADABLE = 'downloadable';
    const DOWNLOADS = 'downloads';
    const DOWNLOAD_LIMIT = 'download_limit';
    const DOWNLOAD_EXPIRY = 'download_expiry';
    const EXTERNAL_URL = 'external_url';
    const BUTTON_TEXT = 'button_text';
    const GROUPED_PRODUCTS = 'grouped_products';
    const FEATURED_IMAGE_ID = 'image_id';
    const GALLERY_IMAGE_IDS = 'gallery_image_ids';
    const META_DATA = 'meta_data';
    const DISABLE_SHIPPING_META = '_disable_shipping';
    const OVERWRITE_SHIPPING_META = '_overwrite_shipping';
    const ADDITIONAL_SHIPPING_COST_META = '_additional_price';
    const ADDITIONAL_SHIPPING_QUANTITY_META = '_additional_qty';
    const ADDITIONAL_SHIPPING_PROCESSING_TIME_META = '_dps_processing_time';
    const CREATE_SCHEDULE_FOR_DISCOUNT = 'create_schedule_for_discount';
}
