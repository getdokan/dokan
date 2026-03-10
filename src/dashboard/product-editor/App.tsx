import { DokanToaster } from '@getdokan/dokan-ui';
// @ts-ignore
import { DokanButton, DokanTooltip } from '@src/components';
import { DataForm, useFormValidity } from '@dokan/product-editor';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import {
    useInitProductEditor,
    useProductEditor,
} from './hooks/useProductEditor';
import useLayouts from './hooks/useLayouts';
import { FlatFormItem } from './types';
import DokanAI from '../../intelligence/components/DokanAI';

interface ProductEditorData {
    form_items: FlatFormItem[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
    vendor_earning: number;
    ai_settings: {
        ai_text_enable: boolean;
        ai_image_enable: boolean;
    };
}

const App = () => {
    // @ts-ignore
    const formEditor = dokanProductEditor as ProductEditorData | undefined;

    if ( ! formEditor ) {
        return (
            <div className="dokan-product-product-editor dokan-layout">
                <p>
                    { __(
                        'Product editor data is not available.',
                        'dokan-lite'
                    ) }
                </p>
            </div>
        );
    }

    const productId = Number( formEditor.product_id );
    const { product, fields, onChange, formItems, isLoading, submitHandler } =
        useProductEditor( productId );

    const { formLayouts } = useLayouts( formItems, product );

    const productUrl = formEditor.view_product_url;
    const isNewProduct = Boolean( formEditor.is_new_product );

    const { validity, isValid } = useFormValidity(
        product,
        fields,
        formLayouts
    );
    // Initialize the product editor in the store on mount.
    useInitProductEditor(
        productId,
        formEditor.form_items,
        formEditor.vendor_earning
    );

    const valueForPrompt = {
        post_title: [ product.name ],
        post_content: [ product.description ],
        post_excerpt: [ product.short_description ],
    };

    const handleSwitchEditor = () => {
        // get the window.location.href and remove the query parameter `product_editor` if exists, otherwise add `?product_editor` to the url and reload the page
        const legacyUrl = window.location.href.replace( 'product_editor', '' );
        window.location.href = legacyUrl;
    };

    return (
        <div className="dokan-product-product-editor dokan-layout">
            <form onSubmit={ submitHandler }>
                <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-semibold">
                            { isNewProduct
                                ? __( 'New Product', 'dokan-lite' )
                                : __( 'Edit Product', 'dokan-lite' ) }
                        </div>
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
                        { /* add switch button */ }
                        <DokanButton
                            variant="secondary"
                            onClick={ handleSwitchEditor }
                        >
                            { __( 'Switch to Legacy', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                    <div className="flex gap-3">
                        <DokanButton
                            type="submit"
                            variant="primary"
                            loading={ isLoading }
                            disabled={ ! isValid || isLoading }
                            label={
                                isNewProduct
                                    ? __( 'Save Changes', 'dokan-lite' )
                                    : __( 'Update Product', 'dokan-lite' )
                            }
                        />
                        { formEditor.ai_settings.ai_text_enable && (
                            <DokanAI
                                className="px-2"
                                value={ valueForPrompt }
                                onChange={ ( value ) => {
                                    onChange( {
                                        name: value.name,
                                        short_description:
                                            value.short_description,
                                        description: value.description,
                                    } );
                                } }
                            />
                        ) }
                    </div>
                </div>
                <DataForm
                    data={ product }
                    fields={ fields }
                    form={ formLayouts }
                    onChange={ onChange }
                    validity={ validity }
                />
            </form>
            <DokanToaster />
        </div>
    );
};

export default App;
