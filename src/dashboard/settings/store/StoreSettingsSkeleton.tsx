import { Skeleton } from '@wedevs/plugin-ui';

// One card shell: grey header strip (title + helper line) over white field rows.
const CardSkeleton = ( {
    rows,
    tall = false,
}: {
    rows: number;
    tall?: boolean;
} ) => (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-5 pb-3 pt-5">
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="divide-y divide-gray-100">
            { Array.from( { length: rows } ).map( ( _, index ) => (
                <div key={ index } className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton
                        className={
                            tall && index === rows - 1
                                ? 'h-40 w-full rounded-md'
                                : 'h-9 w-full rounded-md'
                        }
                    />
                </div>
            ) ) }
        </div>
    </div>
);

/**
 * Loading placeholder mirroring the real Store settings layout — stacked
 * full-width cards and footer actions. The engine's own SettingsSkeleton draws
 * the admin two-column panel (sidebar + bordered frame) this page doesn't have.
 */
const StoreSettingsSkeleton = () => (
    <div
        className="flex flex-col gap-6 pt-1"
        aria-busy="true"
        aria-label="Loading store settings"
    >
        <CardSkeleton rows={ 3 } tall />
        <CardSkeleton rows={ 2 } />
        <CardSkeleton rows={ 1 } tall />
        <div className="flex items-center justify-end gap-2.5">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
        </div>
    </div>
);

export default StoreSettingsSkeleton;
