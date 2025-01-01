<?php

namespace WeDevs\Dokan\Admin\Status;

use Exception;
use WeDevs\Dokan\Abstracts\StatusElement;

class Status extends StatusElement {

    protected bool $support_children = true;

    public function __construct() {
        parent::__construct( 'dokan-status' );

        try {
            $this->describe();
        } catch ( Exception $e ) {
            dokan_log( $e->getMessage() );
        }
    }

    /**
     * Get a new Page object.
     *
     * @param string $id ID.
     *
     * @return Page
     */
    public static function page( string $id ): Page {
        return new Page( $id );
    }

    /**
     * Get a new tab object.
     *
     * @param string $id ID.
     *
     * @return Tab
     */
    public static function tab( string $id ): Tab {
        return new Tab( $id );
    }

    /**
     * Get a new Section object.
     *
     * @param string $id ID.
     *
     * @return Section
     */
    public static function section( string $id ): Section {
        return new Section( $id );
    }

    /**
     * Get a new SubSection object.
     *
     * @param string $id ID.
     *
     * @return SubSection
     */
    public static function sub_section( string $id ): SubSection {
        return new SubSection( $id );
    }

    /**
     * Get a new Table object.
     *
     * @param string $id ID.
     *
     * @return Table
     */
    public static function table( string $id ): Table {
        return new Table( $id );
    }

    public static function table_row( string $id ): TableRow {
        return new TableRow( $id );
    }

    public static function table_column( string $id ): TableColumn {
        return new TableColumn( $id );
    }

    public static function paragraph( string $id ): Paragraph {
        return new Paragraph( $id );
    }

    public static function heading( string $id ): Heading {
        return new Heading( $id );
    }

    public static function link( string $id ): Link {
        return new Link( $id );
    }

    public static function button( string $id ): Button {
        return new Button( $id );
    }

    /**
     * @inheritDoc
     */
    public function escape_data( string $data ): string {
        return $data;
    }

    public function render(): array {
        return parent::render()['children'];
    }

    /**
     * Describe the settings options
     *
     * @return void
     * @throws Exception
     */
    public function describe() {
        $this->add(
            self::page( 'general' )
        );
    }
}
