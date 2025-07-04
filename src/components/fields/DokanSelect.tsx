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
};
const DokanSelect = ( {
    wrapperClassName = '',
    ...props
}: DokanSelectProps ) => {
    return (
        <div className={ ` ${ wrapperClassName }` }>
            <FormSelect { ...props } />
        </div>
    );
};

export default DokanSelect;
