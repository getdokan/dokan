<?php

namespace WeDevs\Dokan\ProductForm;

defined( 'ABSPATH' ) || exit;

/**
 * Product Form Elements
 *
 * @since DOKAN_SINCE
 */
class Elements {
    const ID = 'id';
    const TYPE = 'type';
    const NAME = 'name';
    const DESCRIPTION = 'description';
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
    const WEIGHT = 'weight';
    const DIMENSIONS = 'dimensions';
    const DIMENSIONS_HEIGHT = 'height';
    const DIMENSIONS_WIDTH = 'width';
    const DIMENSIONS_LENGTH = 'length';
    const SHIPPING_CLASS = 'shipping_class_id';
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
    const CATEGORIES = 'categories';
    const TAGS = 'tags';
    const DOWNLOADABLE = 'downloadable';
    const DOWNLOADS = 'downloads';
    const DOWNLOAD_LIMIT = 'download_limit';
    const DOWNLOAD_EXPIRY = 'download_expiry';
    const EXTERNAL_URL = 'product_url';
    const BUTTON_TEXT = 'button_text';
    const GROUP_PRODUCTS = 'children';
    const FEATURED_IMAGE_ID = 'featured_image_id';
    const GALLERY_IMAGE_IDS = 'gallery_image_ids';
    const META_DATA = 'meta_data';
    const DISABLE_SHIPPING_META = '_disable_shipping';
    const OVERWRITE_SHIPPING_META = '_overwrite_shipping';
    const ADDITIONAL_SHIPPING_COST_META = '_additional_price';
    const ADDITIONAL_SHIPPING_QUANTITY_META = '_additional_qty';
    const ADDITIONAL_SHIPPING_PROCESSING_TIME_META = '_dps_processing_time';
}
