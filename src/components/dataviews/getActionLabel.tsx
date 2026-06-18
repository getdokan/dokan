import type { ReactNode } from 'react';

const getActionLabel = ( icon: ReactNode, label: string ): JSX.Element => (
    <span className="dokan-layout">
        <span className="inline-flex items-center gap-2.5">
            { icon }
            { label }
        </span>
    </span>
);

export default getActionLabel;
