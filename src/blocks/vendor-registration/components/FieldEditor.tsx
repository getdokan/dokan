import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
    Button,
    ComboboxControl,
    ExternalLink,
    Notice,
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { useEditorContext } from '../context';
import { useCurrentPostId } from '../hooks';
import {
    keyFromLabel,
    suggestions,
    takenKeys,
    type SavedField,
} from '../metaKeys';
import OptionsEditor from './OptionsEditor';
import type { Row } from '../types';

interface Props {
    row: Row;
    mode: 'add' | 'edit';
    onChange: ( row: Row ) => void;
    onDone: () => void;
    onCancel?: () => void;
}

const TYPE_LABELS: Record< string, string > = {
    text: __( 'Text', 'dokan-lite' ),
    textarea: __( 'Textarea', 'dokan-lite' ),
    number: __( 'Number', 'dokan-lite' ),
    email: __( 'Email', 'dokan-lite' ),
    phone: __( 'Phone', 'dokan-lite' ),
    url: __( 'URL', 'dokan-lite' ),
    select: __( 'Select', 'dokan-lite' ),
    multiselect: __( 'Multi Select', 'dokan-lite' ),
    radio: __( 'Radio', 'dokan-lite' ),
    checkbox: __( 'Checkbox', 'dokan-lite' ),
    date: __( 'Date', 'dokan-lite' ),
};

export default function FieldEditor( {
    row,
    mode,
    onChange,
    onDone,
    onCancel,
}: Props ) {
    const {
        data,
        setup,
        savedFields,
        savedFieldsLoaded,
        attributes,
        setAttributes,
    } = useEditorContext();
    const [ reused, setReused ] = useState( false );
    const [ skipped, setSkipped ] = useState( false );

    const postId = useCurrentPostId();
    const saved: SavedField | undefined = savedFields.find(
        ( field ) => field.key === row.metaKey
    );
    const answers = saved?.answers || 0;
    // The key is shared once vendors answered or another page uses it; then it no longer follows the label.
    // Without the list, an existing field may have answers, so its key stays put.
    const keyIsShared = savedFieldsLoaded
        ? !! saved &&
          ( answers > 0 ||
              saved.pages.some( ( page ) => String( page.id ) !== postId ) )
        : row.custom && 'add' !== mode;
    const keyFollowsLabel = row.custom && ! reused && ! keyIsShared;
    const typeLocked = row.custom && ( reused || keyIsShared );

    const taken = useMemo(
        () => takenKeys( setup, savedFields, row.id, postId ),
        [ setup, savedFields, row.id, postId ]
    );
    const matches =
        keyFollowsLabel && ! skipped
            ? suggestions( row.label, savedFields, setup )
            : [];

    const update = ( patch: Partial< Row > ) =>
        onChange( { ...row, ...patch } );

    const setLabel = ( label: string ) => {
        const patch: Partial< Row > = { label };

        if ( keyFollowsLabel ) {
            patch.metaKey = keyFromLabel( label, taken, data );
        }

        update( patch );
    };

    const reuse = ( field: SavedField ) => {
        setReused( true );
        update( {
            metaKey: field.key,
            type: field.type,
            label: field.label,
            options: field.options.length ? field.options : row.options,
        } );
    };

    const unreuse = () => {
        setReused( false );
        update( { metaKey: keyFromLabel( row.label, taken, data ) } );
    };

    const isTerms = 'terms' === row.id;
    const editLabels = row.registry?.edit_labels || {};
    const needsOptions = row.custom && data.optionTypes.includes( row.type );
    const canAdd =
        row.label.trim() &&
        ( ! needsOptions ||
            row.options.some( ( option ) => option.label.trim() ) );

    return (
        <div className="dokan-vreg-editor__field-editor">
            { /* Rows printed through Dokan's hooks have no label of their own; their parts' labels are below. */ }
            { ! row.registry?.hook && (
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label={ __( 'Field label', 'dokan-lite' ) }
                    value={ row.label }
                    onChange={ setLabel }
                />
            ) }

            { matches.length > 0 && (
                <div className="dokan-vreg-editor__suggestions">
                    <div className="dokan-vreg-editor__suggestions-head">
                        <span>{ __( 'Reuse saved field', 'dokan-lite' ) }</span>
                        <Button
                            variant="link"
                            onClick={ () => setSkipped( true ) }
                        >
                            { __( 'Skip', 'dokan-lite' ) }
                        </Button>
                    </div>
                    { matches.map( ( field ) => (
                        <button
                            type="button"
                            key={ field.key }
                            className="dokan-vreg-editor__suggestion"
                            onClick={ () => reuse( field ) }
                        >
                            <span className="dokan-vreg-editor__suggestion-label">
                                { field.label }
                            </span>
                            <span className="dokan-vreg-editor__muted">
                                { field.removed
                                    ? __( 'Removed field', 'dokan-lite' )
                                    : field.pages
                                          .map( ( page ) => page.title )
                                          .join( ', ' ) }
                            </span>
                            <code>{ field.key }</code>
                        </button>
                    ) ) }
                </div>
            ) }

            { row.custom && (
                <SelectControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label={ __( 'Type', 'dokan-lite' ) }
                    value={ row.type }
                    disabled={ typeLocked }
                    options={ data.customTypes.map( ( type ) => ( {
                        value: type,
                        label: TYPE_LABELS[ type ] || type,
                    } ) ) }
                    onChange={ ( type ) =>
                        update( {
                            type,
                            options: data.optionTypes.includes( type )
                                ? row.options
                                : [],
                        } )
                    }
                />
            ) }

            { needsOptions && (
                <OptionsEditor
                    // A reused or shared key already has answers matching its option values, so those stay fixed.
                    allFresh={ 'add' === mode && ! reused && ! keyIsShared }
                    options={ row.options }
                    onChange={ ( options ) => update( { options } ) }
                />
            ) }

            { Object.keys( editLabels ).length > 0 && (
                <div className="dokan-vreg-editor__sub-labels">
                    { Object.entries( editLabels ).map(
                        ( [ key, defaultLabel ] ) => (
                            <TextControl
                                key={ key }
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label={ defaultLabel }
                                placeholder={ defaultLabel }
                                value={ row.labels[ key ] || '' }
                                onChange={ ( value ) =>
                                    update( {
                                        labels: {
                                            ...row.labels,
                                            [ key ]: value,
                                        },
                                    } )
                                }
                            />
                        )
                    ) }
                    <p className="dokan-vreg-editor__help">
                        { __(
                            'Empty means Dokan’s default. Only this form changes; saved answers aren’t affected.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>
            ) }

            { ! isTerms &&
                ! row.registry?.hook &&
                ( row.custom ||
                    ! [ 'country', 'state' ].includes( row.id ) ) && (
                    <TextControl
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label={ __( 'Placeholder', 'dokan-lite' ) }
                        value={ row.placeholder }
                        onChange={ ( placeholder ) =>
                            update( { placeholder } )
                        }
                    />
                ) }

            { ! row.registry?.hook && (
                <TextControl
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    label={ __( 'Help text', 'dokan-lite' ) }
                    value={ row.help }
                    onChange={ ( help ) => update( { help } ) }
                />
            ) }

            { ! row.locked && ! row.registry?.hook && (
                <ToggleControl
                    __nextHasNoMarginBottom
                    label={ __( 'Required', 'dokan-lite' ) }
                    checked={ row.required }
                    onChange={ ( required ) => update( { required } ) }
                />
            ) }

            { isTerms && (
                <TermsPagePicker
                    pageId={ attributes.termsPageId || 0 }
                    onChange={ ( termsPageId ) =>
                        setAttributes( { termsPageId } )
                    }
                />
            ) }

            { row.custom && (
                <div
                    className={
                        'dokan-vreg-editor__meta-key' +
                        ( reused ? ' is-reused' : '' )
                    }
                >
                    <span>{ __( 'Meta key', 'dokan-lite' ) }</span>
                    <code>{ row.metaKey }</code>
                    { reused && (
                        <Button
                            icon="no-alt"
                            size="small"
                            label={ __(
                                'Use a new key instead',
                                'dokan-lite'
                            ) }
                            onClick={ unreuse }
                        />
                    ) }
                </div>
            ) }
            { row.custom && ! savedFieldsLoaded && (
                <p className="dokan-vreg-editor__help">
                    { __(
                        'Fields used on other forms couldn’t be checked, so existing keys stay as they are.',
                        'dokan-lite'
                    ) }
                </p>
            ) }
            { reused && (
                <p className="dokan-vreg-editor__help">
                    { __(
                        'Its old answers come with it. Type is fixed.',
                        'dokan-lite'
                    ) }
                </p>
            ) }
            { row.custom && answers > 0 && (
                <p className="dokan-vreg-editor__help">
                    { sprintf(
                        /* translators: %d: number of vendors */
                        _n(
                            'Locked: %d vendor answered. Renaming won’t change it.',
                            'Locked: %d vendors answered. Renaming won’t change it.',
                            answers,
                            'dokan-lite'
                        ),
                        answers
                    ) }
                </p>
            ) }

            { ! row.custom && row.registry?.saved_in && (
                <p className="dokan-vreg-editor__help">
                    { sprintf(
                        /* translators: %s: where the answer is stored, e.g. "WordPress user → Email" */
                        __( 'Saved in: %s', 'dokan-lite' ),
                        row.registry.saved_in
                    ) }
                </p>
            ) }

            { row.registry?.settings_note && (
                <p className="dokan-vreg-editor__help">
                    { row.registry.settings_note }{ ' ' }
                    { row.registry.settings_link && (
                        <ExternalLink href={ row.registry.settings_link }>
                            { row.registry.settings_link_text ||
                                __( 'Settings', 'dokan-lite' ) }
                        </ExternalLink>
                    ) }
                </p>
            ) }

            <div className="dokan-vreg-editor__field-actions">
                { 'add' === mode ? (
                    <>
                        <Button variant="tertiary" onClick={ onCancel }>
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="primary"
                            disabled={ ! canAdd }
                            onClick={ onDone }
                        >
                            { __( 'Add field', 'dokan-lite' ) }
                        </Button>
                    </>
                ) : (
                    <Button variant="secondary" onClick={ onDone }>
                        { __( 'Done', 'dokan-lite' ) }
                    </Button>
                ) }
            </div>
        </div>
    );
}

interface TermsPagePickerProps {
    pageId: number;
    onChange: ( pageId: number ) => void;
}

// Terms & Conditions page; without one the checkbox is hidden on the live site.
function TermsPagePicker( { pageId, onChange }: TermsPagePickerProps ) {
    const [ search, setSearch ] = useState( '' );
    const pages = useSelect(
        ( select ) =>
            ( select( coreStore ).getEntityRecords( 'postType', 'page', {
                per_page: 20,
                status: 'publish',
                search: search || undefined,
                _fields: 'id,title',
            } ) as { id: number; title: { rendered: string } }[] | null ) || [],
        [ search ]
    );
    const current = useSelect(
        ( select ) =>
            pageId
                ? ( select( coreStore ).getEntityRecord(
                      'postType',
                      'page',
                      pageId
                  ) as { id: number; title: { rendered: string } } | undefined )
                : undefined,
        [ pageId ]
    );

    const options = [
        ...pages,
        ...( current && ! pages.some( ( page ) => page.id === current.id )
            ? [ current ]
            : [] ),
    ].map( ( page ) => ( {
        value: String( page.id ),
        label: page.title.rendered || __( '(no title)', 'dokan-lite' ),
    } ) );

    return (
        <>
            <ComboboxControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={ __( 'Terms & Conditions page', 'dokan-lite' ) }
                value={ pageId ? String( pageId ) : null }
                options={ options }
                onFilterValueChange={ setSearch }
                onChange={ ( value ) =>
                    onChange( value ? Number( value ) : 0 )
                }
            />
            { ! pageId && (
                <Notice status="warning" isDismissible={ false }>
                    { __(
                        'No page chosen, so the checkbox is hidden on the live site.',
                        'dokan-lite'
                    ) }
                </Notice>
            ) }
        </>
    );
}
