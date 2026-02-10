import { FormSelect } from '@getdokan/dokan-ui';

export type DokanBaseSelectProps = {
    value?: string | number;
    onChange?: ( value: string | number ) => void;
    id?: string;
    contentClass?: string;
    triggerClass?: string;
    name?: string;
    options: { label: string; value: string | number }[];
    placeholder?: string | null;
    disabled?: boolean;
    isError?: boolean;
    containerClassName?: string;
};
const DokanBaseSelect = ( {
    containerClassName = '',
    ...props
}: DokanBaseSelectProps ) => {
    return (
        <div className={ ` ${ containerClassName }` }>
            <FormSelect
                { ...props }
                portalTarget={ document.querySelector( '.dokan-layout' ) }
            />
        </div>
    );
};

export default DokanBaseSelect;
