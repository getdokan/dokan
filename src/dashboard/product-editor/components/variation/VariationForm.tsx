import { DokanButton, DokanModal, Select } from '@src/components';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useVariations } from '../../hooks/useVariations';
import { Attribute, VariationType } from '../../types';
import VariationCard from './VariationCard';

const bulkActions = [
    {
        label: __( 'Actions', 'dokan-lite' ),
        options: [
            {
                label: __( 'Add variation', 'dokan-lite' ),
                value: 'add_variation',
            },
            {
                label: __(
                    'Create variations from all attributes',
                    'dokan-lite'
                ),
                value: 'link_all_variations',
            },
            {
                label: __( 'Delete all variations', 'dokan-lite' ),
                value: 'delete_all',
            },
        ],
    },
    {
        label: __( 'Status', 'dokan-lite' ),
        options: [
            {
                label: __( 'Toggle "Enabled"', 'dokan-lite' ),
                value: 'toggle_enabled',
            },
            {
                label: __( 'Toggle "Downloadable"', 'dokan-lite' ),
                value: 'toggle_downloadable',
            },
            {
                label: __( 'Toggle "Virtual"', 'dokan-lite' ),
                value: 'toggle_virtual',
            },
        ],
    },
    {
        label: __( 'Pricing', 'dokan-lite' ),
        options: [
            {
                label: __( 'Set regular prices', 'dokan-lite' ),
                value: 'variable_regular_price',
            },
            {
                label: __(
                    'Increase regular prices (fixed amount or percentage)',
                    'dokan-lite'
                ),
                value: 'variable_regular_price_increase',
            },
            {
                label: __(
                    'Decrease regular prices (fixed amount or percentage)',
                    'dokan-lite'
                ),
                value: 'variable_regular_price_decrease',
            },
            {
                label: __( 'Set sale prices', 'dokan-lite' ),
                value: 'variable_sale_price',
            },
            {
                label: __(
                    'Increase sale prices (fixed amount or percentage)',
                    'dokan-lite'
                ),
                value: 'variable_sale_price_increase',
            },
            {
                label: __(
                    'Decrease sale prices (fixed amount or percentage)',
                    'dokan-lite'
                ),
                value: 'variable_sale_price_decrease',
            },
            {
                label: __( 'Set scheduled sale dates', 'dokan-lite' ),
                value: 'variable_sale_schedule',
            },
        ],
    },
    {
        label: __( 'Inventory', 'dokan-lite' ),
        options: [
            {
                label: __( 'Toggle "Manage stock"', 'dokan-lite' ),
                value: 'toggle_manage_stock',
            },
            {
                label: __( 'Stock', 'dokan-lite' ),
                value: 'variable_stock',
            },
        ],
    },
    {
        label: __( 'Shipping', 'dokan-lite' ),
        options: [
            {
                label: __( 'Length', 'dokan-lite' ),
                value: 'variable_length',
            },
            {
                label: __( 'Width', 'dokan-lite' ),
                value: 'variable_width',
            },
            {
                label: __( 'Height', 'dokan-lite' ),
                value: 'variable_height',
            },
            {
                label: __( 'Weight', 'dokan-lite' ),
                value: 'variable_weight',
            },
        ],
    },
    {
        label: __( 'Downloadable products', 'dokan-lite' ),
        options: [
            {
                label: __( 'Download limit', 'dokan-lite' ),
                value: 'variable_download_limit',
            },
            {
                label: __( 'Download expiry', 'dokan-lite' ),
                value: 'variable_download_expiry',
            },
        ],
    },
];

// Actions that need a single value prompt.
const VALUE_ACTIONS = [
    'variable_regular_price',
    'variable_sale_price',
    'variable_stock',
    'variable_weight',
    'variable_length',
    'variable_width',
    'variable_height',
    'variable_download_limit',
    'variable_download_expiry',
];

// Actions that need a value or percentage prompt.
const PERCENT_ACTIONS = [
    'variable_regular_price_increase',
    'variable_regular_price_decrease',
    'variable_sale_price_increase',
    'variable_sale_price_decrease',
];

type ModalType = 'confirm' | 'value' | 'percent' | 'schedule';

type ModalConfig = {
    type: ModalType;
    action: string;
} | null;

const getModalTitle = ( action: string ): string => {
    const option = bulkActions
        .flatMap( ( g: any ) => g.options )
        .find( ( o ) => o.value === action );
    return option?.label || __( 'Bulk Edit', 'dokan-lite' );
};

const VariationForm = ( {
    productId,
    attributes,
}: {
    productId: number;
    attributes: Attribute[];
} ) => {
    const { generateVariations, addVariation, bulkEditVariations, variations } =
        useVariations( productId );
    const [ selectedAction, setSelectedAction ] = useState< any >( null );
    const [ isLoading, setIsLoading ] = useState( false );

    // Modal state.
    const [ modalConfig, setModalConfig ] = useState< ModalConfig >( null );
    const [ modalValue, setModalValue ] = useState( '' );
    const [ dateFrom, setDateFrom ] = useState( '' );
    const [ dateTo, setDateTo ] = useState( '' );

    const closeModal = useCallback( () => {
        setModalConfig( null );
        setModalValue( '' );
        setDateFrom( '' );
        setDateTo( '' );
    }, [] );

    const handleModalConfirm = useCallback( async () => {
        if ( ! modalConfig ) {
            return;
        }

        const { type, action } = modalConfig;
        let data: Record< string, any > = {};

        if ( type === 'confirm' ) {
            data = { allowed: 'true' };
        } else if ( type === 'value' || type === 'percent' ) {
            data = { value: modalValue };
        } else if ( type === 'schedule' ) {
            data = {
                date_from: dateFrom || 'false',
                date_to: dateTo || 'false',
            };
        }

        setIsLoading( true );
        try {
            await bulkEditVariations( action, data );
            setSelectedAction( null );
        } finally {
            setIsLoading( false );
        }
    }, [ modalConfig, modalValue, dateFrom, dateTo, bulkEditVariations ] );

    const handleBulkAction = async () => {
        if ( ! selectedAction ) {
            return;
        }

        const localActions: Record< string, () => Promise< void > > = {
            add_variation: addVariation,
            link_all_variations: generateVariations,
        };
        const action = selectedAction.value;
        const actionFunction = localActions[ action ];

        // Local actions — execute directly.
        if ( actionFunction ) {
            setIsLoading( true );
            await actionFunction();
            setSelectedAction( null );
            setIsLoading( false );
            return;
        }

        // Determine modal type and open it.
        if ( action === 'delete_all' ) {
            setModalConfig( { type: 'confirm', action } );
        } else if ( VALUE_ACTIONS.includes( action ) ) {
            setModalConfig( { type: 'value', action } );
        } else if ( PERCENT_ACTIONS.includes( action ) ) {
            setModalConfig( { type: 'percent', action } );
        } else if ( action === 'variable_sale_schedule' ) {
            setModalConfig( { type: 'schedule', action } );
        } else {
            // Toggle actions — no input needed, execute directly.
            setIsLoading( true );
            await bulkEditVariations( action, {} );
            setSelectedAction( null );
            setIsLoading( false );
        }
    };

    const inputClass =
        'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

    const modalProps = useMemo( () => {
        if ( ! modalConfig ) {
            return null;
        }

        const title = getModalTitle( modalConfig.action );

        switch ( modalConfig.type ) {
            case 'confirm':
                return {
                    dialogTitle: title,
                    confirmationTitle: __(
                        'Delete All Variations',
                        'dokan-lite'
                    ),
                    confirmationDescription: __(
                        'Are you sure you want to delete all variations? This cannot be undone.',
                        'dokan-lite'
                    ),
                    confirmButtonText: __( 'Yes, Delete All', 'dokan-lite' ),
                    confirmButtonVariant: 'danger' as const,
                };
            case 'value':
                return {
                    dialogTitle: title,
                    confirmButtonText: __( 'Apply', 'dokan-lite' ),
                };
            case 'percent':
                return {
                    dialogTitle: title,
                    confirmButtonText: __( 'Apply', 'dokan-lite' ),
                };
            case 'schedule':
                return {
                    dialogTitle: title,
                    confirmButtonText: __( 'Apply', 'dokan-lite' ),
                };
            default:
                return null;
        }
    }, [ modalConfig ] );

    const modalContent = useMemo( () => {
        if ( ! modalConfig ) {
            return undefined;
        }

        switch ( modalConfig.type ) {
            case 'value':
                return (
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="bulk-edit-input"
                            className="text-sm font-medium text-gray-700"
                        >
                            { __( 'Enter a value:', 'dokan-lite' ) }
                        </label>
                        <input
                            id="bulk-edit-input"
                            type="text"
                            className={ inputClass }
                            value={ modalValue }
                            onChange={ ( e ) =>
                                setModalValue( e.target.value )
                            }
                            autoFocus
                        />
                    </div>
                );
            case 'percent':
                return (
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="bulk-edit-input"
                            className="text-sm font-medium text-gray-700"
                        >
                            { __(
                                'Enter a value (fixed or %):',
                                'dokan-lite'
                            ) }
                        </label>
                        <input
                            id="bulk-edit-input"
                            type="text"
                            className={ inputClass }
                            value={ modalValue }
                            onChange={ ( e ) =>
                                setModalValue( e.target.value )
                            }
                            placeholder={ __( 'e.g. 10 or 10%', 'dokan-lite' ) }
                            autoFocus
                        />
                    </div>
                );
            case 'schedule':
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="bulk-edit-date-from"
                                className="text-sm font-medium text-gray-700"
                            >
                                { __( 'Sale start date:', 'dokan-lite' ) }
                            </label>
                            <input
                                id="bulk-edit-date-from"
                                type="date"
                                className={ inputClass }
                                value={ dateFrom }
                                onChange={ ( e ) =>
                                    setDateFrom( e.target.value )
                                }
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="bulk-edit-date-to"
                                className="text-sm font-medium text-gray-700"
                            >
                                { __( 'Sale end date:', 'dokan-lite' ) }
                            </label>
                            <input
                                id="bulk-edit-date-to"
                                type="date"
                                className={ inputClass }
                                value={ dateTo }
                                onChange={ ( e ) =>
                                    setDateTo( e.target.value )
                                }
                            />
                        </div>
                    </div>
                );
            default:
                return undefined;
        }
    }, [ modalConfig, modalValue, dateFrom, dateTo, inputClass ] );

    if (
        ! attributes.some( ( attr ) => attr.variation ) &&
        variations.length === 0
    ) {
        return null;
    }

    return (
        <div className="border-t pt-4 flex flex-col gap-4">
            <div className="flex gap-2 items-center">
                <div className="flex-grow">
                    <Select
                        options={ bulkActions }
                        value={ selectedAction }
                        onChange={ ( val: any ) => setSelectedAction( val ) }
                        placeholder={ __( 'Bulk actions', 'dokan-lite' ) }
                        isClearable
                    />
                </div>
                <DokanButton
                    type="button"
                    variant="secondary"
                    onClick={ handleBulkAction }
                    disabled={ ! selectedAction || isLoading }
                    loading={ isLoading }
                    label={ __( 'Go', 'dokan-lite' ) }
                />
            </div>

            { variations.map( ( variation: VariationType, index: number ) => (
                <VariationCard key={ index } variation={ variation } />
            ) ) }

            <DokanModal
                namespace="bulk-edit-variations"
                isOpen={ !! ( modalConfig && modalProps ) }
                onClose={ closeModal }
                onConfirm={ handleModalConfirm }
                loading={ isLoading }
                dialogContent={ modalContent }
                { ...modalProps }
            />
        </div>
    );
};

export default VariationForm;
