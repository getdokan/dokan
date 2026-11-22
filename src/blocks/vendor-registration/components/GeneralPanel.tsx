import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
    Notice,
    PanelBody,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { useEditorContext } from '../context';
import { useCurrentPostId } from '../hooks';
import { setSplitSteps } from '../mutations';

const SHORTCODES = [
    '[dokan-vendor-onboarding-registration',
    '[dokan-vendor-registration',
];

// Text keys the General panel edits, per view.
const VIEW_TEXTS: Record< string, { key: string; label: string }[] > = {
    visitor: [
        { key: 'visitorHeading', label: __( 'Heading', 'dokan-lite' ) },
        { key: 'visitorButton', label: __( 'Button', 'dokan-lite' ) },
    ],
    social: [
        { key: 'socialHeading', label: __( 'Heading', 'dokan-lite' ) },
        { key: 'socialNote', label: __( 'Note under heading', 'dokan-lite' ) },
        { key: 'socialButton', label: __( 'Button', 'dokan-lite' ) },
    ],
    customer: [
        { key: 'customerHeading', label: __( 'Heading', 'dokan-lite' ) },
        { key: 'customerButton', label: __( 'Button', 'dokan-lite' ) },
    ],
};

export default function GeneralPanel() {
    const { data, attributes, setAttributes, setup, updateSetup, view } =
        useEditorContext();
    const postId = useCurrentPostId();
    // Only blocks that can hold a shortcode are checked, so typing elsewhere stays fast.
    const hasShortcode = useSelect( ( select ) => {
        const editor = select( 'core/block-editor' ) as {
            getBlocksByName: ( name: string ) => string[];
            getBlockAttributes: (
                id: string
            ) => Record< string, unknown > | null;
        };

        return [
            'core/shortcode',
            'core/freeform',
            'core/paragraph',
            'core/html',
        ]
            .flatMap( ( name ) => editor.getBlocksByName( name ) )
            .some( ( id ) => {
                const blockAttributes = editor.getBlockAttributes( id ) || {};
                const text = String(
                    blockAttributes.text ?? blockAttributes.content ?? ''
                );

                return SHORTCODES.some( ( shortcode ) =>
                    text.includes( shortcode )
                );
            } );
    }, [] );
    const texts = { ...data.texts, ...attributes.texts };
    const setText = ( key: string, value: string ) =>
        setAttributes( { texts: { ...attributes.texts, [ key ]: value } } );

    return (
        <PanelBody title={ __( 'General', 'dokan-lite' ) } initialOpen>
            <p className="dokan-vreg-editor__help">
                { __(
                    'Shows the right form to visitors and customers. Vendors go to their dashboard.',
                    'dokan-lite'
                ) }
            </p>

            { postId && postId === String( data.dokan.onboardingPageId ) && (
                <Notice status="info" isDismissible={ false }>
                    { __(
                        'This is your Vendor Onboarding page. Dokan’s links and My Account use this form.',
                        'dokan-lite'
                    ) }
                </Notice>
            ) }

            { hasShortcode && (
                <Notice status="warning" isDismissible={ false }>
                    { __(
                        'This page also has the old shortcode. It’s ignored, so you can remove it.',
                        'dokan-lite'
                    ) }
                </Notice>
            ) }

            <ToggleControl
                __nextHasNoMarginBottom
                label={
                    setup.splitSteps
                        ? sprintf(
                              /* translators: %d: number of steps */
                              __( 'Split into steps (%d)', 'dokan-lite' ),
                              setup.steps.length
                          )
                        : __( 'Split into steps', 'dokan-lite' )
                }
                checked={ setup.splitSteps }
                onChange={ ( on ) =>
                    updateSetup( setSplitSteps( setup, on, data ) )
                }
            />

            <div className="dokan-vreg-editor__texts">
                { VIEW_TEXTS[ view ].map( ( { key, label } ) => (
                    <TextControl
                        key={ key }
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label={ label }
                        value={ texts[ key ] || '' }
                        placeholder={ data.texts[ key ] }
                        help={
                            'socialNote' === key
                                ? __(
                                      '{platform} becomes the provider’s name, e.g. Google.',
                                      'dokan-lite'
                                  )
                                : undefined
                        }
                        onChange={ ( value ) => setText( key, value ) }
                    />
                ) ) }
                { setup.splitSteps && (
                    <>
                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label={ __( 'Next button', 'dokan-lite' ) }
                            value={ texts.nextButton || '' }
                            onChange={ ( value ) =>
                                setText( 'nextButton', value )
                            }
                        />
                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label={ __( 'Back button', 'dokan-lite' ) }
                            value={ texts.backButton || '' }
                            onChange={ ( value ) =>
                                setText( 'backButton', value )
                            }
                        />
                    </>
                ) }
            </div>
        </PanelBody>
    );
}
