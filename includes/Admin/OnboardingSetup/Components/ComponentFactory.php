<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Checkbox;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\MultiCheck;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Currency;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Password;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Radio;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\RadioBox;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Select;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Switcher;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Tel;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Text;

class ComponentFactory {
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
     * Get a new Field object.
     *
     * @param string $id ID.
     * @param string $type Field Type.
     *
     * @return Text|Number|Checkbox|Radio|Select|Tel|Password|RadioBox|Switcher|MultiCheck|Currency
     */
    public static function field( string $id, string $type = 'text' ): SettingsElement {
        $field = new Field( $id, $type );

        return $field->get_input();
    }
}
