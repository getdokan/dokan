// Admin Notice Types
export interface AdminNoticeAction {
    type: 'primary' | 'secondary';
    text: string;
    action?: string; // URL for links
    ajax_data?: {
        action: string;
        nonce: string;
        [ key: string ]: any;
    };
    target?: '_self' | '_blank';
    class?: string;
    confirm_message?: string;
    loading_text?: string;
    completed_text?: string;
    reload?: boolean;
}

export interface AdminNotice {
    type: 'success' | 'info' | 'alert' | 'warning' | 'promotion';
    title?: string;
    description?: string;
    actions?: AdminNoticeAction[];
    show_close_button?: boolean;
    close_url?: string;
    ajax_data?: {
        action: string;
        nonce: string;
        [ key: string ]: any;
    };
    priority?: number;
}

export type AdminNoticesData = AdminNotice[];
