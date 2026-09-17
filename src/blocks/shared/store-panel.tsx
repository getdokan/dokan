import { InspectorControls } from '@wordpress/block-editor';
import { ComboboxControl, PanelBody, Notice } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';

type StorePanelProps = {
    attributes: { storeId?: number };
    setAttributes: ( attrs: { storeId?: number } ) => void;
};

type StoreOption = { value: number; label: string };

/**
 * Vendor picker shared by every single store block.
 *
 * Store blocks follow the vendor whose store page is being viewed. Choosing a
 * vendor here pins the block to that store instead, which is what makes the
 * blocks usable on ordinary pages, where there is no store context to follow.
 *
 * @since DOKAN_SINCE
 *
 * @param root0
 * @param root0.attributes
 * @param root0.setAttributes
 */
const StorePanel = ( { attributes, setAttributes }: StorePanelProps ) => {
    const storeId = attributes?.storeId ? Number( attributes.storeId ) : 0;
    const [ options, setOptions ] = useState< StoreOption[] >( [] );
    const [ search, setSearch ] = useState( '' );

    useEffect( () => {
        let cancelled = false;

        apiFetch<
            Array< { id: number; store_name?: string; email?: string } >
        >( {
            path: addQueryArgs( '/dokan/v1/stores', {
                per_page: 20,
                search,
                status: 'approved',
            } ),
        } )
            .then( ( stores ) => {
                if ( cancelled ) {
                    return;
                }

                setOptions(
                    ( stores || [] ).map( ( store ) => ( {
                        value: Number( store.id ),
                        label:
                            store.store_name || store.email || `#${ store.id }`,
                    } ) )
                );
            } )
            .catch( () => {
                if ( ! cancelled ) {
                    setOptions( [] );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ search ] );

    // Keep the pinned vendor visible in the list even when it is outside the current search results.
    const knownOptions =
        storeId && ! options.some( ( option ) => option.value === storeId )
            ? [ { value: storeId, label: `#${ storeId }` }, ...options ]
            : options;

    return (
        <InspectorControls>
            <PanelBody
                title={ __( 'Store', 'dokan-lite' ) }
                initialOpen={ false }
            >
                <ComboboxControl
                    label={ __( 'Show store', 'dokan-lite' ) }
                    help={ __(
                        'Leave empty to follow the store page being viewed. Pick a vendor to always show that store — needed when this block is used outside a store page.',
                        'dokan-lite'
                    ) }
                    value={ storeId || null }
                    options={ [
                        {
                            value: 0,
                            label: __(
                                'Current store (automatic)',
                                'dokan-lite'
                            ),
                        },
                        ...knownOptions,
                    ] }
                    onFilterValueChange={ ( value: string ) =>
                        setSearch( value ?? '' )
                    }
                    onChange={ ( value: number | null ) =>
                        setAttributes( {
                            storeId: value ? Number( value ) : 0,
                        } )
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />

                { ! storeId && (
                    <Notice status="warning" isDismissible={ false }>
                        { __(
                            'On a regular page this block stays empty until you pick a vendor above.',
                            'dokan-lite'
                        ) }
                    </Notice>
                ) }
            </PanelBody>
        </InspectorControls>
    );
};

export default StorePanel;
