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

interface FormManagerData {
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

const getFormEditor = (): FormManagerData | null => {
    return ( window as any ).dokanProductEditor ?? null;
};

const App = () => {
    const formEditor = getFormEditor();

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

    return (
        <div className="dokan-product-product-editor dokan-layout">
            <form onSubmit={ submitHandler }>
                <div className="flex justify-between mb-4">
                    <div className="text-2xl font-semibold flex items-center gap-2">
                        <span>
                            { isNewProduct
                                ? __( 'New Product', 'dokan-lite' )
                                : __( 'Edit Product', 'dokan-lite' ) }
                        </span>
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
                    <div className="flex gap-4">
                        { formEditor.ai_settings.ai_text_enable && (
                            <DokanAI
                                className="p-1"
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
