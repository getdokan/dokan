import { __ } from '@wordpress/i18n';
import { FileSearch } from 'lucide-react';

interface ListEmptyProps {
    icon?: JSX.Element;
    title?: string;
    description?: string;
}

const ListEmpty = ( { icon, description, title }: ListEmptyProps ) => {
    const desc = description ?? '';
    const heading = title ?? __( 'No data found', 'dokan-lite' );

    return (
        <div className="w-full flex items-center justify-center py-40">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center text-[#7047EB] rounded-full bg-[#EFEAFF]">
                    { icon || <FileSearch size={ 52 } /> }
                </div>
                <div className="text-[#111827] text-lg font-semibold">
                    { heading }
                </div>
                { desc && (
                    <div className="mt-1 text-sm text-[#6B7280]">{ desc }</div>
                ) }
            </div>
        </div>
    );
};

export default ListEmpty;
