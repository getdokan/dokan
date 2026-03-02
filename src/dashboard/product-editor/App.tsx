import { DokanToaster } from '@getdokan/dokan-ui';
import { DokanButton, DokanTooltip } from '@src/components';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import {
    useInitProductEditor,
    useProductEditor,
} from './hooks/useProductEditor';
import useLayouts from './hooks/useLayouts';
import { FlatFormItem } from './types';

interface FormManagerData {
    form_items: FlatFormItem[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
    vendor_earning: number;
}

const getFormManager = (): FormManagerData | null => {
    return ( window as any ).dokanFormManager ?? null;
};

const App = () => {
    const formManager = getFormManager();

    if ( ! formManager ) {
        return (
            <div className="dokan-product-product-editor dokan-layout">
                <p>{ __( 'Product editor data is not available.', 'dokan-lite' ) }</p>
            </div>
        );
    }

    const productId = Number( formManager.product_id );
    const { product, fields, onChange, formItems, isLoading, submitHandler } =
        useProductEditor( productId );

    const { formLayouts } = useLayouts( formItems, product );

    const productUrl = formManager.view_product_url;
    const isNewProduct = Boolean( formManager.is_new_product );

    const { validity, isValid } = useFormValidity(
        product,
        fields,
        formLayouts
    );
    // Initialize the product editor in the store on mount.
    useInitProductEditor(
        productId,
        formManager.form_items,
        formManager.vendor_earning
    );

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
