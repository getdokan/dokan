import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Button, Dashicon, DropdownMenu, Tooltip } from '@wordpress/components';
import { useEditorContext } from '../context';
import { hiddenInViewReason, offInWooCommerce } from '../visibility';
import WooCommerceModal from './WooCommerceModal';
import type { DragEvent, ReactNode } from 'react';
import type { Row } from '../types';

interface Props {
    row: Row;
    dropAt: 'before' | 'after' | null;
    onEdit: () => void;
    onChange: ( patch: Partial< Row > ) => void;
    onRemove: () => void;
    // Unset when the row can't move that way.
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDragStart: ( event: DragEvent< HTMLDivElement > ) => void;
    onDragOver: ( event: DragEvent< HTMLDivElement > ) => void;
    onDragEnd: () => void;
    children?: ReactNode;
}

export default function FieldRow( {
    row,
    dropAt,
    onEdit,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    onDragStart,
    onDragOver,
    onDragEnd,
    children,
}: Props ) {
    const { data, view } = useEditorContext();
    const [ wooModal, setWooModal ] = useState( false );

    const wooOff = offInWooCommerce( row, data );
    const wooManaged = !! row.registry?.woocommerce_setting;
    const viewReason = hiddenInViewReason( row, view );
    const fromSettings = !! row.registry?.keeps_section_visible;
    // Rows Dokan needs, rows Dokan settings switch on, and rows WooCommerce decides can't be hidden from the form.
    const pinned = row.locked || fromSettings || wooManaged;
    const openWoo = () => setWooModal( true );

    const classes = [
        'dokan-vreg-editor__row',
        row.hidden || wooOff ? 'is-off' : '',
        viewReason ? 'is-dimmed' : '',
        dropAt ? 'is-drop-' + dropAt : '',
    ].join( ' ' );

    return (
        <div
            className={ classes }
            data-row={ row.id }
            onDragOver={ onDragOver }
        >
            <div className="dokan-vreg-editor__row-main">
                <div
                    className="dokan-vreg-editor__drag"
                    draggable
                    onDragStart={ onDragStart }
                    onDragEnd={ onDragEnd }
                    title={ __( 'Drag to move', 'dokan-lite' ) }
                    aria-hidden="true"
                >
                    <Dashicon icon="menu" size={ 18 } />
                </div>

                <button
                    type="button"
                    className="dokan-vreg-editor__row-name"
                    onClick={ wooOff ? openWoo : onEdit }
                >
                    <span className="dokan-vreg-editor__row-label">
                        { row.label || __( '(no label)', 'dokan-lite' ) }
                    </span>
                    { row.custom && (
                        <code className="dokan-vreg-editor__row-key">
                            { row.metaKey }
                        </code>
                    ) }
                </button>

                <div className="dokan-vreg-editor__row-icons">
                    { pinned || wooOff ? (
                        <Tooltip
                            text={
                                ( fromSettings &&
                                    __(
                                        'Shown when Dokan settings turn it on',
                                        'dokan-lite'
                                    ) ) ||
                                ( wooManaged &&
                                    __(
                                        'Shown whenever WooCommerce needs it',
                                        'dokan-lite'
                                    ) ) ||
                                __( 'Always on', 'dokan-lite' )
                            }
                        >
                            <span className="dokan-vreg-editor__icon is-lock">
                                <Dashicon icon="lock" size={ 16 } />
                            </span>
                        </Tooltip>
                    ) : (
                        <Button
                            size="small"
                            icon={ row.hidden ? 'hidden' : 'visibility' }
                            label={
                                row.hidden
                                    ? __( 'Show field', 'dokan-lite' )
                                    : __( 'Hide field', 'dokan-lite' )
                            }
                            onClick={ () =>
                                onChange( { hidden: ! row.hidden } )
                            }
                        />
                    ) }

                    { ! pinned && ! wooOff && ! wooManaged && (
                        <Button
                            size="small"
                            className={
                                'dokan-vreg-editor__required' +
                                ( row.required ? ' is-required' : '' )
                            }
                            label={
                                row.required
                                    ? __( 'Make optional', 'dokan-lite' )
                                    : __( 'Make required', 'dokan-lite' )
                            }
                            onClick={ () =>
                                onChange( { required: ! row.required } )
                            }
                        >
                            ✱
                        </Button>
                    ) }

                    <DropdownMenu
                        icon="ellipsis"
                        label={ __( 'Field options', 'dokan-lite' ) }
                        toggleProps={ { size: 'small' } }
                        controls={ [
                            wooOff
                                ? {
                                      title: __(
                                          'Why is this off?',
                                          'dokan-lite'
                                      ),
                                      onClick: openWoo,
                                  }
                                : {
                                      title: __( 'Edit', 'dokan-lite' ),
                                      onClick: onEdit,
                                  },
                            {
                                title: __( 'Move up', 'dokan-lite' ),
                                isDisabled: ! onMoveUp,
                                onClick: () => onMoveUp?.(),
                            },
                            {
                                title: __( 'Move down', 'dokan-lite' ),
                                isDisabled: ! onMoveDown,
                                onClick: () => onMoveDown?.(),
                            },
                            ...( row.custom
                                ? [
                                      {
                                          title: __( 'Remove', 'dokan-lite' ),
                                          onClick: onRemove,
                                      },
                                  ]
                                : [] ),
                        ] }
                    />
                </div>
            </div>

            <div className="dokan-vreg-editor__tags">
                { wooOff && (
                    <button
                        type="button"
                        className="dokan-vreg-editor__tag is-woo"
                        onClick={ openWoo }
                    >
                        { __( 'Off in WooCommerce', 'dokan-lite' ) }
                        <Dashicon icon="info-outline" size={ 14 } />
                    </button>
                ) }
                { wooManaged && ! wooOff && (
                    <span className="dokan-vreg-editor__tag">
                        { __( 'Set by WooCommerce', 'dokan-lite' ) }
                    </span>
                ) }
                { fromSettings && (
                    <span className="dokan-vreg-editor__tag">
                        { __( 'Set in Dokan settings', 'dokan-lite' ) }
                    </span>
                ) }
                { viewReason && ! wooOff && (
                    <Tooltip text={ viewReason }>
                        <span className="dokan-vreg-editor__tag is-view">
                            { __( 'Hidden in this view', 'dokan-lite' ) }
                        </span>
                    </Tooltip>
                ) }
            </div>

            { children }
            { wooModal && (
                <WooCommerceModal
                    row={ row }
                    onClose={ () => setWooModal( false ) }
                />
            ) }
        </div>
    );
}
