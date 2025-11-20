import { ReactSelect } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

const Control = ( controlProps: any ) => {
    const { children, selectProps } = controlProps as {
        children: React.ReactNode;
        selectProps: {
            icon?: React.ReactNode;
            iconPosition?: 'left' | 'right';
        };
    };
    const { components } = ReactSelect;

    const icon = selectProps.icon;
    const iconPosition = selectProps.iconPosition ?? 'left';

    return (
        <components.Control { ...controlProps }>
            { icon && iconPosition === 'left' ? (
                <span className="!flex !items-center !ml-[15px]">{ icon }</span>
            ) : null }
            <div
                className={ twMerge(
                    'flex flex-1',
                    icon && iconPosition === 'left' ? 'ml-1.5' : 'ml-0',
                    icon && iconPosition === 'right' ? 'mr-1.5' : 'mr-0'
                ) }
            >
                { children }
            </div>
            { icon && iconPosition === 'right' ? (
                <span className="!flex !items-center !mr-[15px]">{ icon }</span>
            ) : null }
        </components.Control>
    );
};

export default Control;
