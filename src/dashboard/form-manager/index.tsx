import { createRoot } from '@wordpress/element';
import './index.css';
import ProductForm from './ProductForm';

const container = document.getElementById( 'product-form-manager-template' );
if ( container ) {
    const root = createRoot( container );
    root.render( <ProductForm /> );
}
