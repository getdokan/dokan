import { DokanToaster } from '@getdokan/dokan-ui';
import { DokanButton, DokanTooltip, InternalError } from '@src/components';
import { DataForm, useFormValidity } from '@dokan/product-editor';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { ExternalLink } from 'lucide-react';
import {
    useInitProductEditor,
    useProductEditor,
} from './hooks/useProductEditor';
import useLayouts from './hooks/useLayouts';
import { FormItem, LayoutItem } from './types';
import DokanAI from '../../intelligence/components/DokanAI';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import './index.scss';
import { Fill } from '@wordpress/components';
import { registerPlugin, unregisterPlugin } from '@wordpress/plugins';
import Loading from './Loading';

interface ProductEditorData {
    form_items: FormItem[];
    form_layouts: LayoutItem[];
    product_id: string;
    is_new_product: boolean;
    view_product_url: string;
    vendor_earning: number;
    can_add_new_attribute: boolean;
    products_url: string;
    ai_settings: {
        ai_text_enable: boolean;
        ai_image_enable: boolean;
    };
}

const App = ( {
    params,
    location,
}: {
    params: { productId: string };
    location?: { search?: string };
} ) => {
    const [ formEditor, setFormEditor ] = useState< ProductEditorData | null >(
        null
    );
    const productId = Number( formEditor?.product_id );
    const isNewProduct = formEditor?.is_new_product || false;
    const [ error, setError ] = useState< string | null >( null );
    const [ isInitLoading, setInitLoading ] = useState( true );
    const { product, fields, onChange, formItems, isLoading, submitHandler } =
        useProductEditor( productId, isNewProduct );

    const { formLayouts } = useLayouts(
        formItems,
        product,
        formEditor?.form_layouts
    );

    const { validity, isValid } = useFormValidity(
        product,
        fields,
        formLayouts
    );
    // Initialize the product editor in the store on mount.
    useInitProductEditor(
        productId,
        formEditor?.form_items || [],
        formEditor?.vendor_earning || 0
    );

    const valueForPrompt = useMemo(
        () => ( {
            post_title: [ product.name ],
            post_content: [ product.description ],
            post_excerpt: [ product.short_description ],
        } ),
        [ product.name, product.description, product.short_description ]
    );

    const productUrl = formEditor?.view_product_url;

    const fetchProductFields = useCallback( async () => {
        const id = Number( params.productId );
        setInitLoading( true );

        // For a new product, honor a `?type=` hint in the URL (e.g. the auction
        // list links here with ?type=auction) so the editor opens with that type
        // preselected. Falls back to parsing the hash if the router prop is absent.
        let typeParam = '';
        if ( ! id ) {
            let search = location?.search || '';
            if ( ! search && window.location.hash.includes( '?' ) ) {
                search = window.location.hash.slice(
                    window.location.hash.indexOf( '?' )
                );
            }
            typeParam = new URLSearchParams( search ).get( 'type' ) || '';
        }

        try {
            const response = await apiFetch< ProductEditorData >( {
                path: addQueryArgs( '/dokan/v3/products/init/fields', {
                    id: id || '',
                    ...( typeParam ? { type: typeParam } : {} ),
                } ),
            } );
            setFormEditor( response );
            ( window as any ).dokanProductEditor = response;
        } catch ( err: any ) {
            setError(
                err?.message || __( 'An unknown error occurred', 'dokan-lite' )
            );
            setFormEditor( null );
        } finally {
            setInitLoading( false );
        }
    }, [ params.productId, location?.search ] );

    const ActionButton = useCallback( () => {
        if ( error || isInitLoading ) {
            return null;
        }
        return (
            <>
                <Fill name="dokan-header-after-title">
                    <div className="flex items-center gap-2 ml-2">
                        { ! isNewProduct && productUrl && (
                            <span className="flex gap-3">
                                <DokanTooltip
                                    content={ __(
                                        'Visit Product',
                                        'dokan-lite'
                                    ) }
                                >
                                    <a
                                        href={ productUrl }
                                        target="_blank"
                                        className="font-normal self-center active-title text-xl"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink
                                            className="dokan-link stroke-[2.5]"
                                            size={ 16 }
                                        />
                                    </a>
                                </DokanTooltip>
                            </span>
                        ) }
                    </div>
                </Fill>
                <Fill name="dokan-header-actions">
                    <DokanButton
                        type="button"
                        variant="primary"
                        loading={ isLoading }
                        disabled={ ! isValid || isLoading }
                        onClick={ submitHandler }
                        label={
                            isNewProduct
                                ? __( 'Save Changes', 'dokan-lite' )
                                : __( 'Update Product', 'dokan-lite' )
                        }
                    />
                    { formEditor?.ai_settings.ai_text_enable && (
                        <DokanAI
                            className="px-2"
                            value={ valueForPrompt }
                            onChange={ ( value ) => {
                                onChange( {
                                    name: value.name,
                                    short_description: value.short_description,
                                    description: value.description,
                                } );
                            } }
                        />
                    ) }
                </Fill>
            </>
        );
    }, [
        formEditor?.ai_settings.ai_text_enable,
        isLoading,
        isNewProduct,
        isValid,
        onChange,
        isInitLoading,
        error,
        productUrl,
        submitHandler,
        valueForPrompt,
    ] );

    useEffect( () => {
        registerPlugin( 'dokan-product-editor-create', {
            render: ActionButton,
            scope: 'dokan-product-editor-create',
        } );
        registerPlugin( 'dokan-product-editor-edit', {
            render: ActionButton,
            scope: 'dokan-product-editor-edit',
        } );
        return () => {
            // Cleanup the registered plugin when the component unmounts
            unregisterPlugin( 'dokan-product-editor-create' );
            unregisterPlugin( 'dokan-product-editor-edit' );
        };
    }, [ ActionButton ] );

    useEffect( () => {
        void fetchProductFields();
    }, [ fetchProductFields ] );

    if ( isInitLoading ) {
        return <Loading />;
    }

    if ( error ) {
        return (
            <InternalError
                title={ __( 'Failed to load product data', 'dokan-lite' ) }
                message={ error }
                onRefresh={ fetchProductFields }
            />
        );
    }

    return (
        <div className="dokan-product-product-editor dokan-layout">
            <form onSubmit={ submitHandler }>
                <DataForm
                    data={ product }
                    fields={ fields }
                    form={ formLayouts }
                    onChange={ onChange }
                    validity={ validity }
                />
                <button type="submit" className="hidden">
                    { __( 'Submit', 'dokan-lite' ) }
                </button>
            </form>
            <DokanToaster />
        </div>
    );
};

export default App;
