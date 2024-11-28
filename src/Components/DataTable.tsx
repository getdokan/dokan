import { flexRender, Table } from '@tanstack/react-table';
import { twMerge } from 'tailwind-merge';

type Props<T> = {
    table: Table<T>;
    onRowClick?: (row: T) => void;
};

export function DataTable<T>({ table, onRowClick }: Props<T>) {
    return (
        <>
            <div className="overflow-x-auto rounded border border-[#E9E9E9]">
                <table className="min-w-full table-fixed divide-y divide-[#E9E9E9]">
                    <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    scope="col"
                                    className="px-4 py-4 text-left text-xs font-normal uppercase text-[#828282] last:ps-0 last:text-right"
                                >
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="divide-y divide-[#E9E9E9] bg-white">
                    {table.getRowModel().rows.length
                        ? table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={twMerge('cursor-pointer hover:bg-[#F8F9F8]', row.getIsSelected() && 'bg-[#F8F9F8]')}
                                onClick={() => {
                                    onRowClick && onRowClick(row.original);
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        className={twMerge(
                                            'whitespace-nowrap px-4 py-4 text-left align-middle text-sm text-[#575757] last:pe-8 last:text-right',
                                            cell.column.id === 'select' && 'w-12'
                                        )}
                                        key={cell.id}
                                        onClick={(event) =>
                                            (cell.column.id === 'actions' || cell.column.id === 'select') && event.stopPropagation()
                                        }
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                        : null}
                    </tbody>
                </table>
            </div>
        </>
    );
}
