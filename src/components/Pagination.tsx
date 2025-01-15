import { __, _n } from '@wordpress/i18n';
import { Table } from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';

type Props<T> = {
    table: Table<T>;
    className?: string;
    isLoading?: boolean;
    btnClasses?: string;
    textClasses?: string;
    inputClasses?: string;
};

function Pagination<T>({ table, isLoading = false, btnClasses = '', textClasses = '', inputClasses = '', className = '' }: Props<T>) {
    return (
        <div className={ twMerge( 'flex flex-1 items-center justify-between sm:justify-end py-3', className ) }>
            <span className={ twMerge( 'font-medium text-sm', textClasses ) }>{table.getRowCount().toLocaleString()}</span>
            <span
                className={ twMerge( 'font-medium text-sm ml-3', textClasses ) }>{_n('Item', 'Items', table.getRowCount(), 'dokan')}</span>
            <button
                className={ twMerge( isLoading ? 'cursor-progress' : 'disabled:cursor-not-allowed cursor-pointer', 'relative ml-3 h-[35px] w-[35px] inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0', btnClasses ) }
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
            >
                {'«'}
            </button>
            <button
                className={ twMerge( isLoading ? 'cursor-progress' : 'disabled:cursor-not-allowed cursor-pointer', 'relative ml-3 h-[35px] w-[35px] inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0', btnClasses ) }
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
            >
                {'‹'}
            </button>
            <div className='text-sm flex flex-row items-center'>
                <input
                    type='number'
                    min='1'
                    max={table.getPageCount()}
                    onChange={e => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0;
                        table.setPageIndex(page);
                    }}
                    className={ twMerge( isLoading ? 'cursor-progress' : 'disabled:cursor-not-allowed cursor-pointer', 'relative ml-3 mr-3 h-[35px] w-auto inline-flex items-center !rounded-md px-3 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0', inputClasses ) }
                    value={table.getState().pagination.pageIndex + 1}
                    disabled={isLoading}
                />
                <span className={ twMerge( 'font-medium', textClasses ) }>{__(' of ', 'dokan')}</span>
                <span className={ twMerge( 'font-medium ml-3', textClasses ) }>{table.getPageCount()}</span>
            </div>
            <button
                className={ twMerge( isLoading ? 'cursor-progress' : 'disabled:cursor-not-allowed cursor-pointer', 'relative ml-3 h-[35px] w-[35px] inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0', btnClasses ) }
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
            >
                {'›'}
            </button>
            <button
                className={ twMerge( isLoading ? 'cursor-progress' : 'disabled:cursor-not-allowed cursor-pointer', 'relative ml-3 h-[35px] w-[35px] inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0', btnClasses ) }
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage() || isLoading}
            >
                {'»'}
            </button>
        </div>
    );
}

export default Pagination;
