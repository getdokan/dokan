import {
    __experimentalHStack as HStack,
    __experimentalText as Text,
    __experimentalVStack as VStack, Button
} from "@wordpress/components";
import useWindowDimensions from "../Hooks/ViewportDimensions";
import { DataViews } from "./DataViews/index";
import { useEffect, useState } from "@wordpress/element";
import { addQueryArgs } from "@wordpress/url";
import { __, sprintf } from '@wordpress/i18n';

const WPostsDataView = ({ navigate }) => {
    const [ data, setData ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ totalPosts, setTotalPosts ] = useState(0);
    const { width: windowWidth } = useWindowDimensions();

    // Define the available post statuses which will be use for filter.
    const POST_STATUSES = [
        { value: 'publish', label: __( 'Published', 'dokan' ) },
        { value: 'draft', label: __( 'Draft', 'dokan' ) },
        { value: 'pending', label: __( 'Pending Review', 'dokan' ) },
        { value: 'private', label: __( 'Private', 'dokan' ) },
        { value: 'trash', label: __( 'Trash', 'dokan' ) }
    ];

    // Define fields for handle the table columns.
    const fields = [
        {
            id: 'post_id',
            label: __( 'Post ID', 'dokan' ),
            render: ({ item }) => (
                <div>
                    <span
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/posts/${item.id}`)}
                    >{ item.title.rendered }</span>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'title',
            label: __( 'Title', 'dokan' ),
            enableGlobalSearch: true,
            enableSorting: true,
            render: ({ item }) => item.title.rendered,
        },
        {
            id: 'post_status',
            label: __( 'Status', 'dokan' ),
            enableGlobalSearch: true,
            getValue: ({ item }) => // modify value if needed when filter or sorting applied
                POST_STATUSES.find(({ value }) => value === item.status)?.value ??
                item.status,
            elements: POST_STATUSES,
            filterBy: {
                operators: [ 'isAny', 'isNone', 'isAll', 'isNotAll' ],
            },
            render: ({ item }) => capitalizeFirstLetter( item.status ),
        },
        {
            id: 'author',
            label: 'Author',
            enableGlobalSearch: true,
            render: ({ item }) => item.author_name,
        },
        {
            id: 'date',
            label: 'Date',
            enableGlobalSearch: true,
            render: ({ item }) => new Date(item.date).toLocaleDateString(),
        },
    ];

    // Define necessary actions for the table rows.
    const actions = [
        {
            id: 'post-edit',
            label: 'Edit',
            icon: 'edit',
            isPrimary: true,
            callback: (posts) => {
                const post = posts[0];
                navigate(`/posts/${post.id}/edit`);
            },
        },
        {
            id: 'post-delete',
            label: 'Delete',
            icon: 'trash',
            isPrimary: true,
            supportsBulk: true,
            RenderModal: ({ items: [item], closeModal }) => (
                <VStack spacing="5">
                    <Text>
                        { sprintf( __( 'Are you sure you want to delete "%s"?', 'dokan' ), item.title.rendered ) }
                    </Text>
                    <HStack justify="right">
                        <Button
                            variant="outline"
                            onClick={closeModal}
                        >{ __( 'Cancel', 'dokan' ) }</Button>
                        <Button
                            __next40pxDefaultSize
                            variant="primary"
                            onClick={ async () => {
                                try {
                                    const response = await fetch(`/wp-json/wp/v2/posts/${item.id}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'X-WP-Nonce': wpApiSettings.nonce,
                                            'Content-Type': 'application/json'
                                        }
                                    });

                                    if (!response.ok) throw new Error('Failed to delete post');

                                    fetchPosts();
                                    closeModal();
                                } catch (error) {
                                    console.error('Error deleting post:', error);
                                }
                            } }
                        >{ __( 'Delete', 'dokan' ) }</Button>
                    </HStack>
                </VStack>
            ),
        },
    ];

    // Set for handle bulk selection.
    const [selection, setSelection] = useState([]);

    // Use for capitalize the first letter of a word, you can user as per feature requirement.
    const capitalizeFirstLetter = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    // Set data view default layout. We can hide priew by not passing the layout prop.
    const defaultLayouts = {
        table: {},
        grid: {},
        list: {},
        density: 'comfortable', // Use density pre-defined values: comfortable, compact, cozy
    };

    // Set view state for handle the table view, we can take decision based on the view state.
    // We can handle the pagination, search, sort, layout, fields etc.
    const [view, setView] = useState({
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'post_id',
        status: 'publish,pending,draft',
        layout: { ...defaultLayouts },
        fields: fields.map(field => field.id !== 'post_id' ? field.id : ''), // we can ignore the representing title field
    });

    // Handle data fetching from the server.
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            // Set query arguments for the post fetching.
            const queryArgs = {
                per_page: view?.perPage ?? 10,
                page: view?.page ?? 1,
                search: view?.search ?? '',
                status: view?.status ?? 'publish,pending,draft',
                _embed: true,
            }

            // Set sorting arguments for the post order by. Like: title, date, author etc.
            if ( !! view?.sort?.field ) {
                queryArgs.orderby = view?.sort?.field ?? 'title';
            }

            // Set sorting arguments for the post order. Like: asc, desc
            if ( !! view?.sort?.direction ) {
                queryArgs.order = view?.sort?.direction ?? 'desc';
            }

            // Set filter arguments for the post status. Like: publish, draft, pending etc.
            if ( !! view?.filters ) {
                view?.filters?.forEach( filter => {
                    if ( filter.field === 'post_status' && filter.operator === 'isAny' ) {
                        queryArgs.status = filter?.value?.join(',');
                    }
                } )
            }

            // Fetch data from the REST API using the query arguments.
            const response = await fetch(
                addQueryArgs('/wp-json/wp/v2/posts', { ...queryArgs }),
                {
                    headers: {
                        'X-WP-Nonce': wpApiSettings.nonce,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                }
            );

            const posts = await response.json();
            const totalPosts = parseInt(response.headers.get('X-WP-Total')); // Get total posts count from the header.

            const enhancedPosts = posts.map(post => ({
                ...post,
                author_name: post._embedded?.author?.[0]?.name ?? 'Unknown'
            }));

            setTotalPosts(totalPosts); // Set total posts count.
            setData(enhancedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch posts when view changes
    useEffect(() => {
        fetchPosts();
    }, [view]);

    // Set view type `list` for mobile device.
    useEffect(() => setView({
        ...view,
        type: windowWidth <= 768 ? 'list' : 'table',
    }), [windowWidth]);

    return (
        <DataViews
            data={data}
            namespace='dokan-post-data-view'
            defaultLayouts={{ ...defaultLayouts }}
            fields={fields}
            getItemId={(item) => item.id}
            onChangeView={setView}
            paginationInfo={{
                // Set pagination information for the table.
                totalItems: totalPosts,
                totalPages: Math.ceil( totalPosts / view.perPage ),
            }}
            view={view}
            selection={selection}
            onChangeSelection={setSelection}
            actions={actions}
            isLoading={isLoading}
            // Set header for the DataViewTable component.
            header={
                <Button
                    isPrimary
                    onClick={() => navigate('/posts/new')}
                    className={'dokan-btn dokan-btn-theme dokan-btn-hover'}
                >
                    { __( 'Add New Post', 'dokan' ) }
                </Button>
            }
        />
    );
};

export default WPostsDataView;
