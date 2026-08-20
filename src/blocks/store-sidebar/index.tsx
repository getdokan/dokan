import { registerBlockType } from '@wordpress/blocks';
import {
    InnerBlocks,
    useBlockProps,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
import StorePanel from '../shared/store-panel';
import metadata from './block.json';
import './style.scss';

/*
 * A container block, so it is edited live rather than server-rendered: the
 * merchant arranges real child blocks inside it. render.php only wraps the
 * already-rendered children and fires the two widget-area actions around them.
 */
const TEMPLATE = [
    [ 'dokan/store-category-menu', {} ],
    [ 'dokan/store-location-map', {} ],
    [ 'dokan/store-open-close-hours', {} ],
    [ 'dokan/store-contact-form', {} ],
];

const Edit = ( { attributes, setAttributes } ) => {
    const blockProps = useBlockProps( { className: 'dokan-store-sidebar' } );
    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        template: TEMPLATE,
    } );

    return (
        <>
            <StorePanel
                attributes={ attributes }
                setAttributes={ setAttributes }
            />
            <div { ...innerBlocksProps } />
        </>
    );
};

registerBlockType( metadata.name, {
    edit: Edit,
    save: () => <InnerBlocks.Content />,
} );
