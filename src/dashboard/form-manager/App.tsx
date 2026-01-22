import { DokanToaster, useToast } from '@getdokan/dokan-ui';
import { DokanButton, DokanTooltip } from '@src/components';
import apiFetch from '@wordpress/api-fetch';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import { FormProvider, useFormContext } from './context/FormContext';
import useLayouts from './hooks/useLayouts';
import { Attribute, DokanFormManagerData } from './types';
import { validateProductForm } from './utils';

const { sections, ...formData } = (
    window as unknown as {
        dokanFormManager: DokanFormManagerData;
    }
 ).dokanFormManager;

const FormManager = () => {
    const { product, fields, isLoading, submitHandler, onChange, sections } =
        useFormContext();

    const { formLayouts } = useLayouts( sections, fields, product );

    const productUrl = formData.view_product_url;
    const isNewProduct = Boolean( formData.is_new_product );

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
                form={ formLayouts }
                onChange={ onChange }
            />
        </form>
    );
};

const preparePayload = ( product: Record< string, any > ) => {
    // 1. convert empty strings to null
    Object.keys( product ).forEach( ( key ) => {
        if ( product[ key ] === '' ) {
            product[ key ] = null;
        }
    } );

    // 2. map categories, tags, brands, images, dimensions
    product.categories = product.category_ids.map( ( category: number ) => ( {
        id: category,
    } ) );
    delete product.category_ids;

    product.tags = product.product_tag.map( ( tag: number ) => ( {
        id: tag,
    } ) );
    delete product.product_tag;

    product.brands = product.product_brand.map( ( brand: number ) => ( {
        id: brand,
    } ) );
    delete product.product_brand;

    product.images = product.image_id ? [ { id: product.image_id } ] : [];
    delete product.image_id;

    const images = product.gallery_image_ids?.map( ( image: number ) => ( {
        id: image,
    } ) );

    product.images = [ ...product.images, ...images ];
    delete product.gallery_image_ids;

    product.dimensions = {
        length: String( product[ 'length' ] ),
        width: String( product[ 'width' ] ),
        height: String( product[ 'height' ] ),
    };
    delete product.length;
    delete product.width;
    delete product.height;

    product.shipping_class = String( product.shipping_class );
    product.product_shipping_class = String( product.shipping_class );
    product._disable_shipping = product._disable_shipping ? 'no' : 'yes';

    product.upsell_ids = product.upsell_ids
        .map( ( u: any ) => Number( u.value ) )
        .filter( Boolean );
    product.cross_sell_ids = product.cross_sell_ids
        .map( ( c: any ) => Number( c.value ) )
        .filter( Boolean );

    // attributes processing
    if ( Array.isArray( product.attributes ) ) {
        product.attributes = product.attributes.map(
            ( attr: Attribute, index ) => {
                return {
                    id: attr.id,
                    name: attr.name,
                    position: Number( attr.position ) || index,
                    visible: Boolean( attr.visible ),
                    variation: Boolean( attr.variation ),
                    options: attr.options.map( ( o: any ) => {
                        return (
                            attr.terms?.find(
                                ( t: any ) => Number( t.value ) === Number( o )
                            )?.label || String( o )
                        );
                    } ),
                };
            }
        );
    }

    return product;
};

const App = () => {
    const toast = useToast();
    const productId = Number( formData.product_id );

    const path = productId
        ? `dokan/v3/products/${ productId }`
        : 'dokan/v3/products';

    const onSubmit = async ( product: Record< string, any > ) => {
        try {
            await apiFetch( {
                path,
                method: productId ? 'PUT' : 'POST',
                data: preparePayload( { ...product } ),
            } );
            toast( {
                type: 'success',
                title: __( 'Product saved successfully.', 'dokan-lite' ),
            } );
        } catch ( err: any ) {
            toast( {
                type: 'error',
                title:
                    err.message || __( 'Error saving product.', 'dokan-lite' ),
            } );
            // eslint-disable-next-line no-console
            console.error( 'Error saving product:', err );
        }
    };

    return (
        <div className="dokan-product-form-manager dokan-layout">
            <FormProvider
                sections={ sections }
                productId={ productId }
                variations={ formData.variations }
                vendorEarning={ formData.vendor_earning }
                validator={ validateProductForm }
                onSubmit={ onSubmit }
            >
                <FormManager />
            </FormProvider>
            <DokanToaster />
        </div>
    );
};

export default App;
