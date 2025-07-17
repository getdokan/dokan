import { FormSelect } from '@getdokan/dokan-ui';

export type DokanSelectProps = {
    value?: string | number;
    onChange?: ( value: string | number ) => void;
    id?: string;
    contentClass?: string;
    triggerClass?: string;
    name?: string;
    options: { label: string; value: string | number }[];
    placeholder?: string;
    disabled?: boolean;
    isError?: boolean;
    containerClassName?: string;
};
const DokanSelect = ( {
    containerClassName = '',
    ...props
}: DokanSelectProps ) => {
    return (
        <div className={ `w-full ${ containerClassName }` }>
            <FormSelect { ...props } />
        </div>
    );
};

export default DokanSelect;
