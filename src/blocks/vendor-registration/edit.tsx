import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';
import {
    InspectorControls,
    useBlockProps,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import { Notice } from '@wordpress/components';
import { EditorContext, type EditorContextValue } from './context';
import { getEditorData } from './data';
import { buildSetup, toAttributes } from './setup';
import { setSectionHidden } from './mutations';
import FieldsPanel from './components/FieldsPanel';
import GeneralPanel from './components/GeneralPanel';
import LoginPanel from './components/LoginPanel';
import Preview from './components/Preview';
import StylesPanels, { styleVariables } from './components/StylesPanels';
import ViewingAs from './components/ViewingAs';
import type { ReactNode } from 'react';
import type { SavedField } from './metaKeys';
import type { BlockAttributes, Setup, View } from './types';

interface EditProps {
    attributes: BlockAttributes;
    setAttributes: ( attributes: Partial< BlockAttributes > ) => void;
    clientId: string;
}

export default function Edit( {
    attributes,
    setAttributes,
    clientId,
}: EditProps ) {
    const data = getEditorData();
    const [ view, setView ] = useState< View >( 'visitor' );
    const [ savedFields, setSavedFields ] = useState< SavedField[] >( [] );
    // Until the list loads (or if it can't), keys other forms use are unknown.
    const [ savedFieldsLoaded, setSavedFieldsLoaded ] = useState( false );

    const setup = useMemo(
        () => buildSetup( attributes, data ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ attributes.sections, attributes.steps, attributes.splitSteps ]
    );
    const updateSetup = ( next: Setup ) =>
        setAttributes( toAttributes( next ) );

    // The first block on the page counts; others show a note.
    const isDuplicate = useSelect(
        ( select ) => {
            const ids = (
                select( blockEditorStore ) as {
                    getBlocksByName: ( name: string ) => string[];
                }
             ).getBlocksByName( 'dokan/vendor-registration' );
            return ids.length > 1 && ids[ 0 ] !== clientId;
        },
        [ clientId ]
    );

    // A new block starts from Dokan's Address Fields and Terms and Condition settings, then keeps its own.
    useEffect( () => {
        if ( undefined !== attributes.termsPageId ) {
            return;
        }

        const start: Partial< BlockAttributes > = {
            termsPageId: data.dokan.termsEnabled ? data.dokan.termsPageId : 0,
        };

        if ( data.dokan.addressEnabled && ! attributes.sections.length ) {
            Object.assign(
                start,
                toAttributes( setSectionHidden( setup, 'address', false ) )
            );
        }

        setAttributes( start );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    useEffect( () => {
        apiFetch< SavedField[] >( {
            path: `/${ data.dokan.restNamespace }/vendor-registration/fields`,
        } )
            .then( ( fields ) => {
                setSavedFields( fields );
                setSavedFieldsLoaded( true );
            } )
            .catch( () => setSavedFields( [] ) );
    }, [ data.dokan.restNamespace ] );

    const context: EditorContextValue = {
        data,
        attributes,
        setAttributes,
        setup,
        updateSetup,
        view,
        setView,
        savedFields,
        savedFieldsLoaded,
        hasTermsPage: ( attributes.termsPageId || 0 ) > 0,
    };

    const login = { ...data.login, ...attributes.login };
    const classes = [
        'dokan-vreg',
        'is-step-style-' +
            ( ( attributes.styles?.stepStyle as string ) || 'bars' ),
        'is-social-' +
            ( ( attributes.styles?.socialLayout as string ) || 'brand' ),
    ];

    if ( login.enabled && 'visitor' === view ) {
        classes.push( 'has-login-' + login.position );
    }

    const blockProps = useBlockProps( {
        className: classes.join( ' ' ),
        style: styleVariables( attributes.styles ),
    } );

    return (
        <EditorContext.Provider value={ context }>
            <InspectorControls>
                <GeneralPanel />
                <FieldsPanel />
                <LoginPanel />
                {
                    applyFilters(
                        'dokan_vendor_registration_settings_panels',
                        null,
                        context
                    ) as ReactNode
                }
            </InspectorControls>
            <InspectorControls group="styles">
                <StylesPanels />
            </InspectorControls>
            <div { ...blockProps }>
                <ViewingAs />
                { isDuplicate && (
                    <Notice status="warning" isDismissible={ false }>
                        { __(
                            'This page already has a Vendor Registration Form block. Only the first one shows on the site.',
                            'dokan-lite'
                        ) }
                    </Notice>
                ) }
                <Preview />
            </div>
        </EditorContext.Provider>
    );
}
