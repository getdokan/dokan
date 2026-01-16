import { DokanToaster } from '@getdokan/dokan-ui';
import { DokanButton, DokanTooltip } from '@src/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import { FormProvider, useFormContext } from './context/FormContext';
import useLayouts from './hooks/useLayouts';

const FormManager = () => {
    const {
        product,
        fields,
        isLoading,
        submitHandler,
        onChange,
        isNewProduct,
        sections,
        productUrl,
    } = useFormContext();

    const { formLayouts } = useLayouts( sections, fields, product );

    return (
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
                                content={ __( 'Visit Product', 'dokan-lite' ) }
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
                    variant="secondary"
                    loading={ isLoading }
                    disabled={ isLoading }
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
                form={ { fields: formLayouts } }
                onChange={ onChange }
            />
        </form>
    );
};

const App = () => {
    return (
        <div className="dokan-product-form-manager dokan-layout">
            <FormProvider>
                <FormManager />
            </FormProvider>
            <DokanToaster />
        </div>
    );
};

export default App;
