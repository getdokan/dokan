import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

type ColorSetting = {
    label: string;
    value: string | undefined;
    onChange: ( value?: string ) => void;
};

type ColorPanelProps = {
    title: string;
    settings: ColorSetting[];
};

/**
 * A colour panel in the Styles tab for the colours WordPress has no built-in
 * support for — an icon colour, an active tab colour, a card background. Values
 * are plain CSS colours from the theme palette or the picker.
 * @param root0
 * @param root0.title
 * @param root0.settings
 */
const ColorPanel = ( { title, settings }: ColorPanelProps ) => (
    <InspectorControls group="color">
        <PanelColorSettings
            title={ title }
            colorSettings={ settings.map( ( setting ) => ( {
                label: setting.label,
                value: setting.value,
                onChange: ( value?: string ) => setting.onChange( value ?? '' ),
            } ) ) }
            __experimentalIsRenderedInSidebar
            enableAlpha
        />
    </InspectorControls>
);

export default ColorPanel;
