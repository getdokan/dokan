import { SlotFillProvider } from '@wordpress/components';
import ProductList from './ProductList';

const Index = () => {
    return (
        <SlotFillProvider>
            <div className="dokan-products-wrapper dokan-react-products space-y-6">
                <ProductList />
            </div>
        </SlotFillProvider>
    );
};

export default Index;
