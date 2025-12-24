import { RawHTML, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAdminNotices } from '../hooks/useAdminNotices';
import DokanLogo from './DokanLogo';
import { DokanModal } from '@src/components';
import { ShieldAlert } from 'lucide-react';

interface AdminNoticesProps {
    endpoint?: string;
    scope?: string;
    interval?: number;
}

const AdminNotices = ( {
    endpoint = 'admin',
    scope = 'local',
    interval = 5000,
}: AdminNoticesProps ) => {
    const [ modalOpen, setModalOpen ] = useState( false );
    const [ pendingAction, setPendingAction ] = useState< {
        action: any;
        noticeIndex: number;
    } | null >( null );

    const {
        notices,
        loading,
        error,
        currentNotice,
        nextNotice,
        prevNotice,
        pauseAutoSlide,
        resumeAutoSlide,
        executeAction,
        actionLoading,
    } = useAdminNotices( { endpoint, scope, interval } );

    if ( loading || error || ! notices.length ) {
        return null;
    }

    const handleActionClick = async ( action: any, noticeIndex: number ) => {
        if ( action.confirm_message ) {
            setPendingAction( { action, noticeIndex } );
            setModalOpen( true );
            return;
        }

        await executeAction( action, noticeIndex );
    };

    const handleModalConfirm = async () => {
        if ( pendingAction ) {
            await executeAction(
                pendingAction?.action,
                pendingAction?.noticeIndex
            );
        }
        setModalOpen( false );
        setPendingAction( null );
    };

    const handleModalClose = () => {
        setModalOpen( false );
        setPendingAction( null );
    };

    return (
        <div className="notice dokan-admin-notices-wrap">
            <div className="dokan-admin-notices">
                <div
                    className="dokan-notice-slides leading-[1.5em] box-content"
                    onMouseEnter={ pauseAutoSlide }
                    onMouseLeave={ resumeAutoSlide }
                >
                    { notices.map( ( notice, index ) => (
                        <div
                            key={ index }
                            className={ `dokan-admin-notice dokan-${
                                notice.type
                            } ${
                                index + 1 === currentNotice
                                    ? 'fade-in'
                                    : 'fade-out'
                            }` }
                            style={ {
                                opacity: index + 1 === currentNotice ? 1 : 0,
                                transition: 'opacity 0.3s ease-in-out',
                            } }
                        >
                            <div className="notice-content relative z-10">
                                <div className="logo-wrap">
                                    { ! notice.hide_logo && <DokanLogo /> }
                                </div>

                                <div className="dokan-message">
                                    { notice.title && (
                                        <h3>{ notice.title }</h3>
                                    ) }
                                    { notice.description && (
                                        <RawHTML>
                                            { notice.description }
                                        </RawHTML>
                                    ) }

                                    { notice.actions &&
                                        notice.actions.length > 0 && (
                                            <div>
                                                { notice.actions.map(
                                                    ( action, actionIndex ) =>
                                                        action.action &&
                                                        ! action.ajax_data ? (
                                                            <a
                                                                key={
                                                                    actionIndex
                                                                }
                                                                className={ `dokan-btn-${
                                                                    action.type
                                                                } ${
                                                                    action.class ||
                                                                    ''
                                                                } text-xs font-light leading-4 px-3 py-1.5 mr-1.5 mt-2.5 rounded-sm border border-[#7047EB] cursor-pointer transition-all duration-200 no-underline inline-block ${
                                                                    action.type ===
                                                                    'primary'
                                                                        ? 'text-white bg-[#7047EB] font-normal hover:bg-transparent hover:text-[#7047EB]'
                                                                        : ''
                                                                } ${
                                                                    action.type ===
                                                                    'secondary'
                                                                        ? 'text-[#7047EB] bg-transparent font-normal hover:text-white hover:bg-[#7047EB]'
                                                                        : ''
                                                                }` }
                                                                href={
                                                                    action.action
                                                                }
                                                                target={
                                                                    action.target ||
                                                                    '_self'
                                                                }
                                                            >
                                                                { action.text }
                                                            </a>
                                                        ) : (
                                                            <button
                                                                key={
                                                                    actionIndex
                                                                }
                                                                className={ `dokan-btn-${
                                                                    action.type
                                                                } ${
                                                                    action.class ||
                                                                    ''
                                                                } text-xs font-light leading-4 px-3 py-1.5 mr-1.5 mt-2.5 rounded-sm border border-[#7047EB] cursor-pointer transition-all duration-200 no-underline inline-block ${
                                                                    action.type ===
                                                                    'primary'
                                                                        ? 'text-white bg-[#7047EB] font-normal hover:bg-transparent hover:text-[#7047EB]'
                                                                        : ''
                                                                } ${
                                                                    action.type ===
                                                                    'secondary'
                                                                        ? 'text-[#7047EB] bg-transparent font-normal hover:text-white hover:bg-[#7047EB]'
                                                                        : ''
                                                                }` }
                                                                disabled={
                                                                    actionLoading[
                                                                        index
                                                                    ]
                                                                }
                                                                onClick={ () =>
                                                                    handleActionClick(
                                                                        action,
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                { actionLoading[
                                                                    index
                                                                ]
                                                                    ? action.loading_text ||
                                                                      __(
                                                                          'Loading…',
                                                                          'dokan-lite'
                                                                      )
                                                                    : action.text }
                                                            </button>
                                                        )
                                                ) }
                                            </div>
                                        ) }
                                </div>
                            </div>
                        </div>
                    ) ) }
                </div>

                { notices.length > 1 && (
                    <div className="slide-notice">
                        <button
                            type="button"
                            className={ `prev !mt-0 ${
                                currentNotice > 1 ? 'active' : ''
                            }` }
                            onClick={ prevNotice }
                            aria-label={ __( 'Previous notice', 'dokan-lite' ) }
                        >
                            <svg
                                width="8"
                                height="13"
                                viewBox="0 0 8 13"
                                fill="none"
                            >
                                <path
                                    d="M0.791129 6.10203L6.4798 0.415254C6.72942 0.166269 7.13383 0.166269 7.38408 0.415254C7.63369 0.664239 7.63369 1.06866 7.38408 1.31764L2.14663 6.5532L7.38345 11.7888C7.63306 12.0377 7.63306 12.4422 7.38345 12.6918C7.13383 12.9408 6.72879 12.9408 6.47917 12.6918L0.790498 7.005C0.544665 6.75859 0.544666 6.34781 0.791129 6.10203Z"
                                    fill="#DADFE4"
                                />
                            </svg>
                        </button>

                        <span className="notice-count">
                            <RawHTML>
                                { sprintf(
                                    /* translators: %1$s: current notice number with styling, %2$s: total notices count with styling */
                                    __( '%1$s of %2$s', 'dokan-lite' ),
                                    `<span class="current-notice ${
                                        currentNotice > 1 ? 'active' : ''
                                    }">${ currentNotice }</span>`,
                                    `<span class="total-notice ${
                                        currentNotice < notices.length
                                            ? 'active'
                                            : ''
                                    }">${ notices.length }</span>`
                                ) }
                            </RawHTML>
                        </span>

                        <button
                            type="button"
                            className={ `next !mt-0 ${
                                currentNotice < notices.length ? 'active' : ''
                            }` }
                            onClick={ nextNotice }
                            aria-label={ __( 'Next notice', 'dokan-lite' ) }
                        >
                            <svg
                                width="8"
                                height="13"
                                viewBox="0 0 8 13"
                                fill="none"
                            >
                                <path
                                    d="M7.43934 6.10203L1.75067 0.415254C1.50105 0.166269 1.09664 0.166269 0.846391 0.415254C0.596776 0.664239 0.596776 1.06866 0.846391 1.31764L6.08384 6.5532L0.847021 11.7888C0.597406 12.0377 0.597406 12.4422 0.847021 12.6918C1.09664 12.9408 1.50168 12.9408 1.7513 12.6918L7.43997 7.005C7.6858 6.75859 7.6858 6.34781 7.43934 6.10203Z"
                                    fill="#DADFE4"
                                />
                            </svg>
                        </button>
                    </div>
                ) }
            </div>

            <DokanModal
                isOpen={ modalOpen }
                onClose={ handleModalClose }
                onConfirm={ handleModalConfirm }
                namespace="admin-notice-confirmation"
                dialogTitle={ __( 'Updater Alert!', 'dokan-lite' ) }
                confirmationTitle={ __( 'Are you sure?', 'dokan-lite' ) }
                confirmationDescription={
                    pendingAction?.action?.confirm_message || ''
                }
                dialogIcon={
                    <div
                        className={ `flex items-center justify-center flex-shrink-0 w-14 h-14 bg-[#FBBF24] border border-[#FBBF24] rounded-full` }
                    >
                        <ShieldAlert color="#FFF" size={ 28 } />
                    </div>
                }
                confirmButtonText={
                    pendingAction?.action?.text || __( 'Confirm', 'dokan-lite' )
                }
                cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                confirmButtonVariant="primary"
            />
        </div>
    );
};

export default AdminNotices;
