/**
 * External dependencies
 */
import { __, _n, sprintf } from "@wordpress/i18n";
import { Component, Fragment } from "@wordpress/element";
import { map } from "lodash";
import { Date, Link, OrderStatus, ViewMoreList } from "@woocommerce/components";
import { formatValue } from "@woocommerce/number";
import { getNewPath, getPersistedQuery } from "@woocommerce/navigation";
import { defaultTableDateFormat } from "@woocommerce/date";
import { CurrencyContext } from "@woocommerce/currency";

/**
 * Internal dependencies
 */
import ReportTable from "../../components/report-table";
import { getAdminSetting } from "reports/utils/admin-settings";

const capitalizeFirstLetter = (expr) =>
  expr.charAt(0).toUpperCase() + expr.slice(1);

class OrdersReportTable extends Component {
  constructor() {
    super();

    this.getHeadersContent = this.getHeadersContent.bind(this);
    this.getRowsContent = this.getRowsContent.bind(this);
    this.getSummary = this.getSummary.bind(this);
  }

  getHeadersContent() {
    return [
      {
        label: __("Date", 'dokan-lite'),
        key: "date",
        required: true,
        defaultSort: true,
        isLeftAligned: true,
        isSortable: true,
      },
      {
        label: __("Order #", 'dokan-lite'),
        screenReaderLabel: __("Order Number", 'dokan-lite'),
        key: "order_number",
        required: true,
      },
      {
        label: __("Status", 'dokan-lite'),
        key: "status",
        required: false,
        isSortable: false,
      },
      {
        label: __("Customer", 'dokan-lite'),
        key: "customer_id",
        required: false,
        isSortable: false,
      },
      {
        label: __("Customer type", 'dokan-lite'),
        key: "customer_type",
        required: false,
        isSortable: false,
      },
      {
        label: __("Product(s)", 'dokan-lite'),
        screenReaderLabel: __("Products", 'dokan-lite'),
        key: "products",
        required: false,
        isSortable: false,
      },
      {
        label: __("Items sold", 'dokan-lite'),
        key: "num_items_sold",
        required: false,
        isSortable: true,
        isNumeric: true,
      },
      {
        label: __("Coupon(s)", 'dokan-lite'),
        screenReaderLabel: __("Coupons", 'dokan-lite'),
        key: "coupons",
        required: false,
        isSortable: false,
      },
      {
        label: __("Net sales", 'dokan-lite'),
        screenReaderLabel: __("Net sales", 'dokan-lite'),
        key: "net_total",
        required: true,
        isSortable: true,
        isNumeric: true,
      },
      {
        label: __("Attribution", 'dokan-lite'),
        screenReaderLabel: __("Attribution", 'dokan-lite'),
        key: "attribution",
        required: false,
        isSortable: false,
      },
    ];
  }

  getCustomerName(customer) {
    const { first_name: firstName, last_name: lastName } = customer || {};

    if (!firstName && !lastName) {
      return "";
    }

    return [firstName, lastName].join(" ");
  }

  getRowsContent(tableData) {
    const { query } = this.props;
    const persistedQuery = getPersistedQuery(query);
    const dateFormat = getAdminSetting("dateFormat", defaultTableDateFormat);
    const { render: renderCurrency, getCurrencyConfig } = this.context;

    return map(tableData, (row) => {
      const {
        currency,
        date,
        net_total: netTotal,
        num_items_sold: numItemsSold,
        order_id: orderId,
        order_number: orderNumber,
        parent_id: parentId,
        status,
        customer_type: customerType,
      } = row;
      const extendedInfo = row.extended_info || {};
      const { coupons, customer, products } = extendedInfo;

      const formattedProducts = products
        .sort((itemA, itemB) => itemB.quantity - itemA.quantity)
        .map((item) => ({
          label: item.name,
          quantity: item.quantity,
          href: getNewPath(persistedQuery, "/analytics/products", {
            filter: "single_product",
            products: item.id,
          }),
        }));

      const formattedCoupons = coupons.map((coupon) => ({
        label: coupon.code,
        href: getNewPath(persistedQuery, "/analytics/coupons", {
          filter: "single_coupon",
          coupons: coupon.id,
        }),
      }));

      return [
        {
          display: <Date date={date} visibleFormat={dateFormat} />,
          value: date,
        },
        {
          display: (
            <Link
              href={
                "orders?order_id=" +
                (parentId ? parentId : orderId) +
                "&_wpnonce=" +
                dokan?.order_nonce
              }
              type="external"
            >
              {orderNumber}
            </Link>
          ),
          value: orderNumber,
        },
        {
          display: (
            <OrderStatus
              className="woocommerce-orders-table__status"
              order={{ status }}
              labelPositionToLeft={true}
              orderStatusMap={getAdminSetting("orderStatuses", {})}
            />
          ),
          value: status,
        },
        {
          display: this.getCustomerName(customer),
          value: this.getCustomerName(customer),
        },
        {
          display: capitalizeFirstLetter(customerType),
          value: customerType,
        },
        {
          display: this.renderList(
            formattedProducts.length ? [formattedProducts[0]] : [],
            formattedProducts.map((product) => ({
              label: sprintf(
                /* translators: 1: quantity, 2: product name */
                __("%1$s× %2$s", 'dokan-lite'),
                product.quantity,
                product.label
              ),
              href: product.href,
            }))
          ),
          value: formattedProducts
            .map(({ quantity, label }) =>
              sprintf(
                /* translators: %1$s: quantity, %2$s: product name */
                __("%1$s× %2$s", 'dokan-lite'),
                quantity,
                label
              )
            )
            .join(", "),
        },
        {
          display: formatValue(getCurrencyConfig(), "number", numItemsSold),
          value: numItemsSold,
        },
        {
          display: this.renderList(
            formattedCoupons.length ? [formattedCoupons[0]] : [],
            formattedCoupons
          ),
          value: formattedCoupons.map((coupon) => coupon.label).join(", "),
        },
        {
          display: renderCurrency(netTotal, currency),
          value: netTotal,
        },
        {
          display: extendedInfo.attribution.origin,
          value: extendedInfo.attribution.origin,
        },
      ];
    });
  }

  getSummary(totals) {
    const {
      orders_count: ordersCount = 0,
      total_customers: totalCustomers = 0,
      products = 0,
      num_items_sold: numItemsSold = 0,
      coupons_count: couponsCount = 0,
      net_revenue: netRevenue = 0,
    } = totals;
    const { formatAmount, getCurrencyConfig } = this.context;
    const currency = getCurrencyConfig();
    return [
      {
        label: _n("Order", "Orders", ordersCount, 'dokan-lite'),
        value: formatValue(currency, "number", ordersCount),
      },
      {
        label: _n(" Customer", " Customers", totalCustomers, 'dokan-lite'),
        value: formatValue(currency, "number", totalCustomers),
      },
      {
        label: _n("Product", "Products", products, 'dokan-lite'),
        value: formatValue(currency, "number", products),
      },
      {
        label: _n("Item sold", "Items sold", numItemsSold, 'dokan-lite'),
        value: formatValue(currency, "number", numItemsSold),
      },
      {
        label: _n("Coupon", "Coupons", couponsCount, 'dokan-lite'),
        value: formatValue(currency, "number", couponsCount),
      },
      {
        label: __("net sales", 'dokan-lite'),
        value: formatAmount(netRevenue),
      },
    ];
  }

  renderLinks(items = []) {
    return items.map((item, i) => (
      <Link href={item.href.replace("admin.php", "")} key={i} type="wc-admin">
        {item.label}
      </Link>
    ));
  }

  renderList(visibleItems, popoverItems) {
    return (
      <Fragment>
        {this.renderLinks(visibleItems)}
        {popoverItems.length > 1 && (
          <ViewMoreList items={this.renderLinks(popoverItems)} />
        )}
      </Fragment>
    );
  }

  render() {
    const { query, filters, advancedFilters } = this.props;

    return (
      <ReportTable
        endpoint="orders"
        getHeadersContent={this.getHeadersContent}
        getRowsContent={this.getRowsContent}
        getSummary={this.getSummary}
        summaryFields={[
          "orders_count",
          "total_customers",
          "products",
          "num_items_sold",
          "coupons_count",
          "net_revenue",
        ]}
        query={query}
        tableQuery={{
          extended_info: true,
        }}
        title={__("Orders", 'dokan-lite')}
        columnPrefsKey="orders_report_columns"
        filters={filters}
        advancedFilters={advancedFilters}
      />
    );
  }
}

OrdersReportTable.contextType = CurrencyContext;

export default OrdersReportTable;
