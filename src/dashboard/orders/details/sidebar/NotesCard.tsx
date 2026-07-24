import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { Trash2 } from 'lucide-react';
import { useToast } from '@getdokan/dokan-ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@wedevs/plugin-ui';
import { DokanButton } from '@dokan/components';
import SectionCard from '../SectionCard';
import useOrderNotes from '../useOrderNotes';
import { timeAgo } from '../dateTime';
import { useOrderDetailsContext } from '../OrderDetailsContext';

/**
 * Order Note sidebar card per the mockup: plain note entries with the type
 * label, a trash action, and an "added … ago" stamp — plus the add-note form.
 */
const NotesCard = () => {
    const { orderId, order } = useOrderDetailsContext();
    const toast = useToast();
    const { notes, isLoading, error, addNote, deleteNote } =
        useOrderNotes( orderId );

    const [ noteText, setNoteText ] = useState( '' );
    const [ noteType, setNoteType ] = useState< 'private' | 'customer' >(
        'customer'
    );
    const [ isSaving, setIsSaving ] = useState( false );
    const [ confirmingDelete, setConfirmingDelete ] = useState< number >( 0 );

    const handleAdd = async () => {
        if ( ! noteText.trim() ) {
            return;
        }

        setIsSaving( true );

        try {
            await addNote(
                noteText.trim(),
                'customer' === noteType,
                order?.status ?? 'processing'
            );
            setNoteText( '' );
            toast( {
                type: 'success',
                title: __( 'Note added.', 'dokan-lite' ),
            } );
        } catch ( addError ) {
            toast( {
                type: 'error',
                title:
                    ( addError as { message?: string } )?.message ||
                    __( 'Could not add the note.', 'dokan-lite' ),
            } );
        } finally {
            setIsSaving( false );
        }
    };

    const handleDelete = async ( noteId: number ) => {
        try {
            await deleteNote( noteId );
            toast( {
                type: 'success',
                title: __( 'Note deleted.', 'dokan-lite' ),
            } );
        } catch ( deleteError ) {
            toast( {
                type: 'error',
                title:
                    ( deleteError as { message?: string } )?.message ||
                    __( 'Could not delete the note.', 'dokan-lite' ),
            } );
        } finally {
            setConfirmingDelete( 0 );
        }
    };

    return (
        <SectionCard
            title={ __( 'Order Note', 'dokan-lite' ) }
            contentClassName="px-0"
        >
            { isLoading && (
                <div className="mx-6 h-16 animate-pulse rounded bg-gray-100" />
            ) }

            { ! isLoading && ! error && ! notes.length && (
                <p className="px-6 text-sm text-[#828282]">
                    { __( 'No notes for this order yet.', 'dokan-lite' ) }
                </p>
            ) }

            { ! isLoading && error && (
                <p className="px-6 text-sm text-[#828282]">{ error }</p>
            ) }

            { ! isLoading && notes.length > 0 && (
                <ul className="flex flex-col divide-y divide-[#E9E9E9]">
                    { notes.map( ( note ) => (
                        <li key={ note.id } className="px-6 py-3 first:pt-0">
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-[#828282]">
                                    { note.customer_note
                                        ? __( 'Customer Note', 'dokan-lite' )
                                        : __( 'Private Note', 'dokan-lite' ) }
                                </span>
                                { confirmingDelete === note.id ? (
                                    <span className="flex items-center gap-2 text-xs">
                                        <button
                                            type="button"
                                            className="border-0! bg-transparent! p-0! shadow-none! font-medium text-red-600!"
                                            onClick={ () =>
                                                handleDelete( note.id )
                                            }
                                        >
                                            { __( 'Confirm', 'dokan-lite' ) }
                                        </button>
                                        <button
                                            type="button"
                                            className="border-0! bg-transparent! p-0! shadow-none! text-gray-500!"
                                            onClick={ () =>
                                                setConfirmingDelete( 0 )
                                            }
                                        >
                                            { __( 'Cancel', 'dokan-lite' ) }
                                        </button>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        aria-label={ __(
                                            'Delete note',
                                            'dokan-lite'
                                        ) }
                                        className="border-0! bg-transparent! p-0.5! shadow-none! text-gray-400! hover:text-red-500!"
                                        onClick={ () =>
                                            setConfirmingDelete( note.id )
                                        }
                                    >
                                        <Trash2 size={ 14 } />
                                    </button>
                                ) }
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm text-[#575757]">
                                { decodeEntities( note.note ) }
                            </p>
                            <p className="mt-1 text-[11px] text-gray-400">
                                { sprintf(
                                    /* translators: %s: human readable time difference, e.g. "3 hours ago" */
                                    __( 'added %s', 'dokan-lite' ),
                                    timeAgo( note.date_created )
                                ) }
                            </p>
                        </li>
                    ) ) }
                </ul>
            ) }

            { ! error && (
                <div className="mt-3 border-t border-[#E9E9E9] px-6 pt-4">
                    <Select
                        value={ noteType }
                        onValueChange={ ( value ) =>
                            setNoteType( value as 'private' | 'customer' )
                        }
                    >
                        <SelectTrigger className="mb-2 w-auto gap-2 border-[#E9E9E9] text-sm shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                            <SelectItem value="customer">
                                { __( 'Customer Note', 'dokan-lite' ) }
                            </SelectItem>
                            <SelectItem value="private">
                                { __( 'Private Note', 'dokan-lite' ) }
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        rows={ 3 }
                        className="border-[#E9E9E9] shadow-none"
                        placeholder={ __( 'Write here', 'dokan-lite' ) }
                        value={ noteText }
                        onChange={ ( event ) =>
                            setNoteText( event.target.value )
                        }
                    />
                    <div className="mt-2.5 flex justify-end">
                        <DokanButton
                            variant="secondary"
                            onClick={ handleAdd }
                            disabled={ isSaving || ! noteText.trim() }
                            loading={ isSaving }
                        >
                            { __( 'Add Note +', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                </div>
            ) }
        </SectionCard>
    );
};

export default NotesCard;
