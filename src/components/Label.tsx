// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';

import { Badge } from '@getdokan/dokan-ui';
import type { BadgeProps } from '@getdokan/dokan-ui/dist/components/Badge';

type LabelVariant = 'info' | 'warning' | 'success' | 'danger';

interface DokanLabelProps extends Partial< BadgeProps > {
    variant?: LabelVariant;
}

const variantConfig = {
    info: {
        color: 'blue',
        className: 'dokan-info',
    },
    warning: {
        color: 'yellow',
        className: 'dokan-warning',
    },
    success: {
        color: 'green',
        className: 'dokan-success',
    },
    danger: {
        color: 'red',
        className: 'dokan-danger',
    },
} as const;

export const DokanLabel = ( {
    label,
    variant = 'info',
    ...props
}: DokanLabelProps ) => {
    const config = variantConfig[ variant ];

    return (
        <Badge
            className={ config.className }
            color={ config.color }
            label={ label }
            { ...props }
        />
    );
};

export default DokanLabel;
