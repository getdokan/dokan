<?php

namespace WeDevs\Dokan\Analytics\Reports;

use Automattic\WooCommerce\Admin\API\Reports\SqlQuery;

/**
 * WC SqlQuery class to override the default handling of SQL clauses.
 *
 * @since 3.13.0
 */
class WcSqlQuery extends SqlQuery {
    /**
     * Update the default value of $handling from "unfiltered" to an empty string,
     * allowing filters to be applied to the SQL clauses.
     *
     * @param string $type Type of SQL clause (e.g., SELECT, WHERE).
     * @param string $handling Optional. The handling mode for the clause. Defaults to an empty string.
     * @return string The SQL clause.
     */
    protected function get_sql_clause( $type, $handling = 'filtered' ) {
        return parent::get_sql_clause( $type, $handling );
    }
}
