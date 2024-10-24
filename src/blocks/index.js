import { registerBlockType } from '@wordpress/blocks';
import * as storeAddress from './store-address';
import * as storeName from './store-name';

const blocks = [ storeAddress, storeName ];

blocks.forEach( ( block ) => {
    const { metadata, settings, name } = block;
    registerBlockType( name, {
        ...metadata,
        ...settings,
    } );
} );
