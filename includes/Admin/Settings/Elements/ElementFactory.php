<?php

namespace WeDevs\Dokan\Admin\Settings\Elements;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Checkbox;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Currency;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\DoubleTextField;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\InfoField;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\MultiCheck;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Password;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Radio;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\RadioBox;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Select;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Switcher;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Tel;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Text;
use WeDevs\Dokan\Admin\Settings\Elements\Fields\Number;
use WeDevs\Dokan\Admin\Settings\Elements\FieldGroup;

class ElementFactory {
    /**
     * Get a new Page object.
     *
     * @param string $id ID.
     *
     * @return SubPage
     */
    public static function sub_page( string $id ): SubPage {
        return new SubPage( $id );
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
     * Get a new Field object.
     *
     * @param string $id ID.
     * @param string $type Field Type.
     *
     * @return Text|Number|Checkbox|Radio|Select|Tel|Password|RadioBox|Switcher|MultiCheck|Currency|InfoField|DoubleTextField
     */
    public static function field( string $id, string $type = 'text' ): SettingsElement {
        $field = new Field( $id, $type );

        return $field->get_input();
    }

    /**
     * Get a new FieldGroup object.
     *
     * @param string $id ID.
     *
     * @return FieldGroup
     */
    public static function field_group( string $id ): FieldGroup {
        return new FieldGroup( $id );
    }
}
