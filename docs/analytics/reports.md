- [Introduction](#introduction)
- [Custom Products Stats Datastore](#custom-products-stats-datastore)

## Introduction
To handle **Dokan Orders**, we followed the [WooCommerce Admin Reports Extension Guidelines](https://github.com/woocommerce/woocommerce/blob/trunk/docs/reporting/extending-woocommerce-admin-reports.md#handle-currency-parameters-on-the-server).

## Custom Stats Datastore

We need to customize the default *WooCommerce Analytics Datastore* for some reports. For example, we replaced the [WC Products Stats DataStore](https://github.com/woocommerce/woocommerce/blob/9297409c5a705d1cd0ae65ec9b058271bd90851e/plugins/woocommerce/src/Admin/API/Reports/Products/Stats/DataStore.php#L170) with the [Dokan Product Stats Store](./../../includes/Analytics/Reports/Products/Stats/WcDataStore.php). This modification involves overriding the `$total_query` and `$interval_query` properties by substituting the `Automattic\WooCommerce\Admin\API\Reports\SqlQuery` class with `WeDevs\Dokan\Analytics\Reports\WcSqlQuery`.

The primary change was to update the `get_sql_clause( $type, $handling = 'unfiltered' )` method to `get_sql_clause( $type, $handling = '' )`, allowing us to apply necessary filters for adding JOIN and WHERE clauses to the `dokan_order_stats` table.

### Implementation Steps

- **Step 1:** Create the [WcSqlQuery](./../../includes/Analytics/Reports/DataStoreModifier.php) class to override the `get_sql_clause( $type, $handling = 'unfiltered' )` method from the [WC SqlQuery](https://github.com/woocommerce/woocommerce/blob/9297409c5a705d1cd0ae65ec9b058271bd90851e/plugins/woocommerce/src/Admin/API/Reports/SqlQuery.php#L87) class. The new method should use `get_sql_clause( $type, $handling = '' )`.

- **Step 2:** Implement the [WcDataStore](https://github.com/woocommerce/woocommerce/blob/9297409c5a705d1cd0ae65ec9b058271bd90851e/plugins/woocommerce/src/Admin/API/Reports/Products/Stats/DataStore.php#L170) class to set the `$total_query` and `$interval_query` properties with instance of **WcSqlQuery**.

- **Step 3:** Use the `woocommerce_data_stores` filter within the [DataStoreModifier](./../../includes/Analytics/Reports/DataStoreModifier.php) class to replace the default WooCommerce Products Stats datastore with the custom Dokan Product Stats Store.