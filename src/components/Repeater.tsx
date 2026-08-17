import { useEffect, useRef, useState } from '@wordpress/element';
import { Input, Switch, cn } from '@wedevs/plugin-ui';
import { GripVertical, Pencil, Trash2, Plus, X, Check } from 'lucide-react';

/**
 * A single repeater row. Extra keys are preserved verbatim so callers can carry
 * their own metadata; only `id` (stable React key) and `title` (the editable
 * label) are required by the component.
 */
export type RepeaterRow = {
    id: string;
    title: string;
    order?: number;
    /** Non-removable rows hide the delete control. */
    required?: boolean;
    /** Activate/deactivate state, used when `rowToggle` is on. */
    enabled?: boolean;
    /** Disable just the activate/deactivate toggle (keeps rename enabled). */
    toggleLocked?: boolean;
    [ key: string ]: unknown;
};

export type RepeaterProps = {
    /** Controlled list of rows. */
    value: RepeaterRow[];
    /** Called with the next rows whenever the list changes (order re-sequenced). */
    onChange: ( rows: RepeaterRow[] ) => void;
    /** Label for the "add" action. */
    addLabel?: string;
    /** Placeholder for the row text input while editing. */
    placeholder?: string;
    /** Badge text shown on `required` rows (e.g. "Must Have"). Omit to hide. */
    requiredLabel?: string;
    /** Render a per-row activate/deactivate toggle bound to `row.enabled`. */
    rowToggle?: boolean;
    /** Show the "add new row" action (default true). */
    addable?: boolean;
    /** Show the per-row delete control (default true). */
    deletable?: boolean;
    disabled?: boolean;
    className?: string;
};

/** Sentinel `editingId` for the not-yet-committed "add new" row. */
const NEW_ROW = '__repeater_new_row__';

const ICON_BUTTON =
    'size-8 shrink-0 inline-flex items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

function makeRowId(): string {
    return `row_${ Math.random().toString( 36 ).slice( 2, 9 ) }`;
}

/**
 * Coerce arbitrary stored data into well-formed rows. Guarantees a stable `id`
 * and a string `title` (falling back to a legacy `value` key), and derives
 * `order` from the visual position.
 * @param raw
 */
function normalizeRows( raw: unknown ): RepeaterRow[] {
    if ( ! Array.isArray( raw ) ) {
        return [];
    }
    return raw.map( ( row, index ) => {
        const obj =
            row && typeof row === 'object'
                ? ( row as Record< string, unknown > )
                : {};
        return {
            ...obj,
            id: String( obj.id ?? makeRowId() ),
            title: String( obj.title ?? obj.value ?? '' ),
            order: index + 1,
        } as RepeaterRow;
    } );
}

export default function Repeater( {
    value,
    onChange,
    addLabel = 'Add Item',
    placeholder,
    requiredLabel,
    rowToggle = false,
    addable = true,
    deletable = true,
    disabled = false,
    className,
}: RepeaterProps ) {
    const rows = normalizeRows( value );

    // `editingId` is the row id being edited, the NEW_ROW sentinel while adding,
    // or null. `draft` holds the in-progress title so edits only land on confirm.
    // `dragIndex` tracks the row being reordered via its grip handle.
    const [ editingId, setEditingId ] = useState< string | null >( null );
    const [ draft, setDraft ] = useState( '' );
    const [ dragIndex, setDragIndex ] = useState< number | null >( null );
    const containerRef = useRef< HTMLDivElement >( null );

    // Focus the row input whenever edit/add mode opens (accessible alternative
    // to autoFocus — only fires in response to a user action).
    useEffect( () => {
        if ( editingId !== null ) {
            containerRef.current
                ?.querySelector< HTMLInputElement >( 'input' )
                ?.focus();
        }
    }, [ editingId ] );

    const commit = ( next: RepeaterRow[] ): void =>
        onChange(
            next.map( ( row, index ) => ( { ...row, order: index + 1 } ) )
        );

    const startEdit = ( row: RepeaterRow ): void => {
        setEditingId( row.id );
        setDraft( row.title );
    };

    const startAdd = (): void => {
        setEditingId( NEW_ROW );
        setDraft( '' );
    };

    const cancelEdit = (): void => {
        setEditingId( null );
        setDraft( '' );
    };

    const confirmEdit = (): void => {
        const title = draft.trim();
        if ( editingId === NEW_ROW ) {
            if ( title.length > 0 ) {
                commit( [
                    ...rows,
                    { id: makeRowId(), title, order: rows.length + 1 },
                ] );
            }
        } else if ( title.length > 0 ) {
            commit(
                rows.map( ( row ) =>
                    row.id === editingId ? { ...row, title } : row
                )
            );
        } else {
            // Clearing the title removes the row.
            commit( rows.filter( ( row ) => row.id !== editingId ) );
        }
        cancelEdit();
    };

    const removeRow = ( id: string ): void => {
        if ( editingId === id ) {
            cancelEdit();
        }
        commit( rows.filter( ( row ) => row.id !== id ) );
    };

    const setRowEnabled = ( id: string, enabled: boolean ): void => {
        commit(
            rows.map( ( row ) => ( row.id === id ? { ...row, enabled } : row ) )
        );
    };

    const onDrop = ( dropIndex: number ): void => {
        if ( dragIndex === null || dragIndex === dropIndex ) {
            setDragIndex( null );
            return;
        }
        const next = rows.slice();
        const [ moved ] = next.splice( dragIndex, 1 );
        next.splice( dropIndex, 0, moved );
        setDragIndex( null );
        commit( next );
    };

    const reorderable = editingId === null && ! disabled;

    const draftInput = (
        <Input
            type="text"
            value={ draft }
            onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
                setDraft( e.target.value )
            }
            onKeyDown={ ( e: React.KeyboardEvent< HTMLInputElement > ) => {
                if ( e.key === 'Enter' ) {
                    e.preventDefault();
                    confirmEdit();
                } else if ( e.key === 'Escape' ) {
                    cancelEdit();
                }
            } }
            placeholder={ placeholder }
            disabled={ disabled }
            className="flex-1"
        />
    );

    const editControls = (
        <>
            <button
                type="button"
                aria-label="Cancel"
                onClick={ cancelEdit }
                className={ ICON_BUTTON }
            >
                <X className="size-4" />
            </button>
            <button
                type="button"
                aria-label="Confirm"
                onClick={ confirmEdit }
                className={ ICON_BUTTON }
            >
                <Check className="size-4" />
            </button>
        </>
    );

    return (
        <div
            ref={ containerRef }
            className={ cn(
                'flex flex-col w-full divide-y divide-border',
                className
            ) }
        >
            { rows.map( ( row, index ) => {
                const isEditing = editingId === row.id;
                return (
                    <div
                        key={ row.id }
                        draggable={ reorderable }
                        onDragStart={ () => setDragIndex( index ) }
                        onDragOver={ ( e ) => e.preventDefault() }
                        onDrop={ () => onDrop( index ) }
                        onDragEnd={ () => setDragIndex( null ) }
                        className={ cn(
                            'flex items-center gap-3 py-3',
                            dragIndex === index && 'opacity-50'
                        ) }
                    >
                        <GripVertical
                            className={ cn(
                                'size-4 shrink-0 text-muted-foreground',
                                reorderable ? 'cursor-grab' : 'opacity-40'
                            ) }
                        />
                        { isEditing ? (
                            <>
                                { draftInput }
                                { editControls }
                            </>
                        ) : (
                            <>
                                <span className="flex-1 flex items-center gap-2 text-sm text-foreground">
                                    <span>{ row.title }</span>
                                    { row.required && requiredLabel && (
                                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                            { requiredLabel }
                                        </span>
                                    ) }
                                </span>
                                <button
                                    type="button"
                                    aria-label="Edit"
                                    onClick={ () => startEdit( row ) }
                                    disabled={
                                        disabled ||
                                        editingId !== null ||
                                        Boolean( row.required )
                                    }
                                    className={ ICON_BUTTON }
                                >
                                    <Pencil className="size-4" />
                                </button>
                                { rowToggle && (
                                    <Switch
                                        aria-label="Toggle"
                                        checked={ row.enabled !== false }
                                        onCheckedChange={ (
                                            checked: boolean
                                        ) => setRowEnabled( row.id, checked ) }
                                        disabled={
                                            disabled ||
                                            Boolean( row.toggleLocked )
                                        }
                                    />
                                ) }
                            </>
                        ) }
                        { deletable && (
                            <button
                                type="button"
                                aria-label="Remove item"
                                onClick={ () => removeRow( row.id ) }
                                disabled={ disabled || Boolean( row.required ) }
                                className={ ICON_BUTTON }
                            >
                                <Trash2 className="size-4" />
                            </button>
                        ) }
                    </div>
                );
            } ) }

            { editingId === NEW_ROW && (
                <div className="flex items-center gap-3 py-3">
                    <GripVertical className="size-4 shrink-0 text-muted-foreground opacity-40" />
                    { draftInput }
                    { editControls }
                </div>
            ) }

            { addable && (
                <button
                    type="button"
                    onClick={ startAdd }
                    disabled={ disabled || editingId !== null }
                    className="flex items-center gap-1.5 self-start py-3 text-sm font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="size-4" /> { addLabel }
                </button>
            ) }
        </div>
    );
}
