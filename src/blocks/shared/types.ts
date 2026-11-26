/**
 * Props the block editor passes to a store block's `edit` callback, typed with
 * the block's own attributes from its block.json.
 */
export type StoreBlockEditProps< T > = {
    attributes: T;
    setAttributes: ( attrs: Partial< T > ) => void;
};
