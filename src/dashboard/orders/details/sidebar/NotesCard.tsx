import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { Plus, Trash2 } from 'lucide-react';
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
import { SidebarCard } from './SidebarCard';
import useOrderNotes from '../useOrderNotes';
import { timeAgo } from '../dateTime';
import { useOrderDetailsContext } from '../OrderDetailsContext';

type NoteType = 'private' | 'customer';

const noteTypeLabel = ( type: NoteType ): string =>
    'customer' === type
        ? __( 'Customer Note', 'dokan-lite' )
        : __( 'Private Note', 'dokan-lite' );

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
    const [ noteType, setNoteType ] = useState< NoteType >( 'customer' );
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
        <SidebarCard title={ __( 'Order Note', 'dokan-lite' ) }>
            { isLoading && (
                <div className="mx-5 mt-5 h-16 animate-pulse rounded bg-gray-100" />
            ) }

            { ! isLoading && ! error && ! notes.length && (
                <p className="mt-5 border-t border-[#E9E9E9] px-5 pt-5 text-sm leading-[1.4] text-[#828282]">
                    { __( 'No notes for this order yet.', 'dokan-lite' ) }
                </p>
            ) }

            { ! isLoading && error && (
                <p className="mt-5 border-t border-[#E9E9E9] px-5 pt-5 text-sm leading-[1.4] text-[#828282]">
                    { error }
                </p>
            ) }

            { ! isLoading && notes.length > 0 && (
                <ul className="flex flex-col">
                    { notes.map( ( note ) => (
                        <li
                            key={ note.id }
                            className="mt-5 border-t border-[#E9E9E9] px-5 pt-5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold leading-[1.3] text-[#393939]">
                                    { noteTypeLabel(
                                        note.customer_note
                                            ? 'customer'
                                            : 'private'
                                    ) }
                                </span>
                                { confirmingDelete === note.id ? (
                                    <span className="flex items-center gap-2 text-xs">
                                        <button
                                            type="button"
                                            className="border-0! bg-transparent! p-0! font-medium shadow-none! text-red-600!"
                                            onClick={ () =>
                                                handleDelete( note.id )
                                            }
                                        >
                                            { __( 'Confirm', 'dokan-lite' ) }
                                        </button>
                                        <button
                                            type="button"
                                            className="border-0! bg-transparent! p-0! text-gray-500! shadow-none!"
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
                                        className="border-0! bg-transparent! p-0! text-[#A5A5AA]! shadow-none! hover:text-red-500!"
                                        onClick={ () =>
                                            setConfirmingDelete( note.id )
                                        }
                                    >
                                        <Trash2 size={ 16 } />
                                    </button>
                                ) }
                            </div>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-[1.4] text-[#575757]">
                                { decodeEntities( note.note ) }
                            </p>
                            <p className="mt-2 text-xs leading-[1.4] text-[#A5A5AA]">
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
                <div className="mt-5 border-t border-[#E9E9E9] px-5 pt-5">
                    <Select
                        value={ noteType }
                        onValueChange={ ( value ) =>
                            setNoteType( value as NoteType )
                        }
                    >
                        { /* Without explicit children the trigger prints the
                             raw value ("customer") instead of its label. */ }
                        <SelectTrigger className="h-8! w-auto gap-2 rounded-[5px]! border-[#E9E9E9]! px-3! text-xs font-medium text-[#25252d]! shadow-none!">
                            <SelectValue>
                                { noteTypeLabel( noteType ) }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-50">
                            <SelectItem value="customer">
                                { noteTypeLabel( 'customer' ) }
                            </SelectItem>
                            <SelectItem value="private">
                                { noteTypeLabel( 'private' ) }
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        rows={ 3 }
                        className="mt-2.5 rounded-[5px] border-[#E9E9E9] text-sm shadow-none"
                        placeholder={ __( 'Write here', 'dokan-lite' ) }
                        value={ noteText }
                        onChange={ ( event ) =>
                            setNoteText( event.target.value )
                        }
                    />
                    <div className="mt-3 flex justify-end">
                        <DokanButton
                            variant="secondary"
                            onClick={ handleAdd }
                            disabled={ isSaving || ! noteText.trim() }
                            loading={ isSaving }
                        >
                            { __( 'Add Note', 'dokan-lite' ) }
                            <Plus size={ 16 } />
                        </DokanButton>
                    </div>
                </div>
            ) }
        </SidebarCard>
    );
};

export default NotesCard;
