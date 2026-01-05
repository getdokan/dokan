<?php

namespace WeDevs\PluginSettings\Elements;

use WeDevs\PluginSettings\Abstracts\SettingsElement;
use WeDevs\PluginSettings\Elements\Fields\Text;
use WeDevs\PluginSettings\Elements\Fields\Number;
use WeDevs\PluginSettings\Elements\Fields\Select;
use WeDevs\PluginSettings\Elements\Fields\Switcher;
use WeDevs\PluginSettings\Elements\Fields\Checkbox;
use WeDevs\PluginSettings\Elements\Fields\Radio;
use WeDevs\PluginSettings\Elements\Fields\TextArea;
use WeDevs\PluginSettings\Elements\Fields\Password;

/**
 * Element Factory Class.
 *
 * Factory for creating settings elements.
 *
 * @since 1.0.0
 */
class ElementFactory {

    /**
     * Create a new SubPage object.
     *
     * @param string $id SubPage ID.
     *
     * @return SubPage
     */
    public static function sub_page( string $id ): SubPage {
        return new SubPage( $id );
    }

    /**
     * Create a new Tab object.
     *
     * @param string $id Tab ID.
     *
     * @return Tab
     */
    public static function tab( string $id ): Tab {
        return new Tab( $id );
    }

    /**
     * Create a new Section object.
     *
     * @param string $id Section ID.
     *
     * @return Section
     */
    public static function section( string $id ): Section {
        return new Section( $id );
    }

    /**
     * Create a new SubSection object.
     *
     * @param string $id SubSection ID.
     *
     * @return SubSection
     */
    public static function sub_section( string $id ): SubSection {
        return new SubSection( $id );
    }

    /**
     * Create a new Field object.
     *
     * @param string $id   Field ID.
     * @param string $type Field Type.
     *
     * @return SettingsElement
     */
    public static function field( string $id, string $type = 'text' ): SettingsElement {
        $field = new Field( $id, $type );

        return $field->get_input();
    }

    /**
     * Create a new FieldGroup object.
     *
     * @param string $id FieldGroup ID.
     *
     * @return FieldGroup
     */
    public static function field_group( string $id ): FieldGroup {
        return new FieldGroup( $id );
    }

    /**
     * Create a text field.
     *
     * @param string $id Field ID.
     *
     * @return Text
     */
    public static function text( string $id ): Text {
        return new Text( $id );
    }

    /**
     * Create a number field.
     *
     * @param string $id Field ID.
     *
     * @return Number
     */
    public static function number( string $id ): Number {
        return new Number( $id );
    }

    /**
     * Create a select field.
     *
     * @param string $id Field ID.
     *
     * @return Select
     */
    public static function select( string $id ): Select {
        return new Select( $id );
    }

    /**
     * Create a switch field.
     *
     * @param string $id Field ID.
     *
     * @return Switcher
     */
    public static function switcher( string $id ): Switcher {
        return new Switcher( $id );
    }

    /**
     * Create a checkbox field.
     *
     * @param string $id Field ID.
     *
     * @return Checkbox
     */
    public static function checkbox( string $id ): Checkbox {
        return new Checkbox( $id );
    }

    /**
     * Create a radio field.
     *
     * @param string $id Field ID.
     *
     * @return Radio
     */
    public static function radio( string $id ): Radio {
        return new Radio( $id );
    }

    /**
     * Create a textarea field.
     *
     * @param string $id Field ID.
     *
     * @return TextArea
     */
    public static function textarea( string $id ): TextArea {
        return new TextArea( $id );
    }

    /**
     * Create a password field.
     *
     * @param string $id Field ID.
     *
     * @return Password
     */
    public static function password( string $id ): Password {
        return new Password( $id );
    }
}

