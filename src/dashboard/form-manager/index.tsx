import { createRoot } from '@wordpress/element';
import './index.scss';
import App from './App';

const container = document.getElementById( 'product-form-manager-template' );
if ( container ) {
    const root = createRoot( container );
    root.render( <App /> );
}
