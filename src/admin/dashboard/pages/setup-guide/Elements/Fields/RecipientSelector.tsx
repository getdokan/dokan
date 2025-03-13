import SelectorCard from './SelectorCard';
import AdminIcon from '../../components/icons/AdminIcon';
import VendorIcon from '../../components/icons/VendorIcon';

const RecipientSelector = ( {
    type,
    selectedValue,
    onChange,
    title,
    description,
} ) => {
    return (
        <div>
            <div className="mb-3">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <div className="flex flex-wrap gap-4">
                <SelectorCard
                    type={ type }
                    value="admin"
                    selected={ selectedValue === 'admin' }
                    onChange={ onChange }
                    icon={
                        <AdminIcon selected={ selectedValue === 'admin' } />
                    }
                />
                <SelectorCard
                    type={ type }
                    value="vendor"
                    selected={ selectedValue === 'vendor' }
                    onChange={ onChange }
                    icon={
                        <VendorIcon selected={ selectedValue === 'vendor' } />
                    }
                />
            </div>
        </div>
    );
};

export default RecipientSelector;
