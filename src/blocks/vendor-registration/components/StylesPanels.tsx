import { __ } from '@wordpress/i18n';
import { PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { useEditorContext } from '../context';
import type { CSSProperties } from 'react';

// Style attribute => CSS custom property. Mirrors FormRenderer::get_style_variables().
export const STYLE_VARIABLES: Record<
    string,
    { variable: string; unit?: string }
> = {
    accentColor: { variable: '--dokan-vreg-accent' },
    labelColor: { variable: '--dokan-vreg-label' },
    inputTextColor: { variable: '--dokan-vreg-input-text' },
    inputBackground: { variable: '--dokan-vreg-input-bg' },
    inputBorderColor: { variable: '--dokan-vreg-input-border' },
    buttonBackground: { variable: '--dokan-vreg-button-bg' },
    buttonTextColor: { variable: '--dokan-vreg-button-text' },
    inputRadius: { variable: '--dokan-vreg-input-radius', unit: 'px' },
    buttonRadius: { variable: '--dokan-vreg-button-radius', unit: 'px' },
    fieldGap: { variable: '--dokan-vreg-field-gap', unit: 'px' },
    loginGap: { variable: '--dokan-vreg-login-gap', unit: 'px' },
};

export const styleVariables = (
    styles: Record< string, string | number > = {}
): CSSProperties => {
    const css: Record< string, string > = {};

    Object.entries( STYLE_VARIABLES ).forEach(
        ( [ key, { variable, unit } ] ) => {
            const value = styles[ key ];

            if ( value !== undefined && value !== '' ) {
                css[ variable ] = unit
                    ? `${ value }${ unit }`
                    : String( value );
            }
        }
    );

    return css as CSSProperties;
};

export default function StylesPanels() {
    const { data, attributes, setAttributes } = useEditorContext();
    const styles = attributes.styles || {};
    const set = ( key: string, value: string | number | undefined ) => {
        const next = { ...styles };

        if ( value === undefined || value === '' ) {
            delete next[ key ];
        } else {
            next[ key ] = value;
        }

        setAttributes( { styles: next } );
    };

    const color = ( key: string, label: string ) => ( {
        label,
        value: ( styles[ key ] as string ) || undefined,
        onChange: ( value?: string ) => set( key, value ),
    } );

    const range = (
        key: string,
        label: string,
        max: number,
        fallback: number
    ) => (
        <RangeControl
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            label={ label }
            value={ ( styles[ key ] as number ) ?? fallback }
            min={ 0 }
            max={ max }
            allowReset
            resetFallbackValue={ undefined }
            onChange={ ( value ) => set( key, value ) }
        />
    );

    return (
        <>
            <PanelBody title={ __( 'Steps', 'dokan-lite' ) }>
                <SelectControl< string >
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label={ __( 'Step style', 'dokan-lite' ) }
                    value={ ( styles.stepStyle as string ) || 'bars' }
                    options={ [
                        { value: 'bars', label: __( 'Bars', 'dokan-lite' ) },
                        {
                            value: 'circles',
                            label: __( 'Circles', 'dokan-lite' ),
                        },
                        { value: 'pills', label: __( 'Pills', 'dokan-lite' ) },
                        {
                            value: 'progress',
                            label: __( 'Progress', 'dokan-lite' ),
                        },
                    ] }
                    onChange={ ( value ) => set( 'stepStyle', value ) }
                />
            </PanelBody>

            { /* Only add-ons print social buttons, e.g. Dokan Pro with social login on. */ }
            { !! data.social && (
                <PanelBody
                    title={ __( 'Social buttons', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    <SelectControl< string >
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label={ __( 'Layout', 'dokan-lite' ) }
                        value={ ( styles.socialLayout as string ) || 'brand' }
                        options={ [
                            {
                                value: 'brand',
                                label: __( 'Brand colors', 'dokan-lite' ),
                            },
                            {
                                value: 'outline',
                                label: __( 'Outline', 'dokan-lite' ),
                            },
                            {
                                value: 'columns',
                                label: __( 'Two columns', 'dokan-lite' ),
                            },
                            {
                                value: 'icons',
                                label: __( 'Icons only', 'dokan-lite' ),
                            },
                        ] }
                        onChange={ ( value ) => set( 'socialLayout', value ) }
                    />
                </PanelBody>
            ) }

            <PanelColorSettings
                title={ __( 'Form colors', 'dokan-lite' ) }
                initialOpen={ false }
                colorSettings={ [
                    color( 'accentColor', __( 'Accent', 'dokan-lite' ) ),
                    color( 'labelColor', __( 'Labels', 'dokan-lite' ) ),
                    color( 'inputTextColor', __( 'Input text', 'dokan-lite' ) ),
                    color(
                        'inputBackground',
                        __( 'Input background', 'dokan-lite' )
                    ),
                    color(
                        'inputBorderColor',
                        __( 'Input border', 'dokan-lite' )
                    ),
                    color(
                        'buttonBackground',
                        __( 'Button background', 'dokan-lite' )
                    ),
                    color(
                        'buttonTextColor',
                        __( 'Button text', 'dokan-lite' )
                    ),
                ] }
            />

            <PanelBody
                title={ __( 'Form shape & spacing', 'dokan-lite' ) }
                initialOpen={ false }
            >
                { range(
                    'inputRadius',
                    __( 'Input radius', 'dokan-lite' ),
                    30,
                    6
                ) }
                { range(
                    'buttonRadius',
                    __( 'Button radius', 'dokan-lite' ),
                    40,
                    6
                ) }
                { range(
                    'fieldGap',
                    __( 'Field spacing', 'dokan-lite' ),
                    48,
                    18
                ) }
                { range(
                    'loginGap',
                    __( 'Login–form gap', 'dokan-lite' ),
                    120,
                    48
                ) }
            </PanelBody>
        </>
    );
}
