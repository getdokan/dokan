<template>
    <div class="home">
        <h1 class="wp-heading-inline">Books</h1>
        <a href="#" class="page-title-action">Add New</a>

        <list-table
            :columns="columns"
            :loading="loading"
            :rows="books"
            :actions="actions"
            :show-cb="showCb"
            :total-items="totalItems"
            :bulk-actions="bulkActions"
            :total-pages="totalPages"
            :per-page="perPage"
            :current-page="currentPage"
            :action-column="actionColumn"

            :sort-by="sortBy"
            :sort-order="sortOrder"
            @sort="sortCallback"

            @pagination="goToPage"
            @action:click="onActionClick"
            @bulk:click="onBulkAction"
        >
            <template slot="title" slot-scope="data">
                <img :src="data.row.image" :alt="data.row.title" width="50">
                <strong><a href="#">{{ data.row.title }}</a></strong>
            </template>

            <template slot="filters">
                <select>
                    <option value="All Dates">All Dates</option>
                </select>

                <button class="button">Filter</button>
            </template>

            <template slot="author" slot-scope="data">
                {{ data.row.author.join(', ') }}
            </template>
        </list-table>
    </div>
</template>

<script>
import ListTable from 'vue-wp-list-table';

export default {

    name: 'Home',

    components: {
        ListTable,
    },

    data () {
        return {
            showCb: true,

            sortBy: 'title',
            sortOrder: 'asc',

            totalItems: 15,
            perPage: 3,
            totalPages: 5,
            currentPage: 1,
            loading: false,

            columns: {
                'title': {
                    label: 'Title',
                    sortable: true
                },
                'author': {
                    label: 'Author',
                    sortable: true
                }
            },
            actionColumn: 'title',
            actions: [
                {
                    key: 'edit',
                    label: 'Edit'
                },
                {
                    key: 'trash',
                    label: 'Delete'
                }
            ],
            bulkActions: [
                {
                    key: 'trash',
                    label: 'Move to Trash'
                }
            ],
            books: [
                // {
                //     id: 1,
                //     title: 'Wings of Fire: An Autobiography',
                //     author: ['A.P.J. Abdul Kalam'],
                //     image: 'https://images.gr-assets.com/books/1295670969l/634583.jpg'
                // },
                // {
                //     id: 2,
                //     title: 'Who Moved My Cheese?',
                //     author: ['Spencer Johnson', 'Kenneth H. Blanchard'],
                //     image: 'https://images.gr-assets.com/books/1388639717l/4894.jpg'
                // },
                // {
                //     id: 3,
                //     title: 'Option B',
                //     author: ['Sheryl Sandberg', 'Adam Grant', 'Adam M. Grant'],
                //     image: 'https://images.gr-assets.com/books/1493998427l/32938155.jpg'
                // }
            ]
        }
    },

    created() {

        this.loadBooks();
    },

    methods: {

        loadBooks(time = 100) {

            let self = this;

            self.loading = true;

            setTimeout(function() {
                self.books = [
                    {
                        id: 1,
                        title: 'Wings of Fire: An Autobiography',
                        author: ['A.P.J. Abdul Kalam'],
                        image: 'https://images.gr-assets.com/books/1295670969l/634583.jpg'
                    },
                    {
                        id: 2,
                        title: 'Who Moved My Cheese?',
                        author: ['Spencer Johnson', 'Kenneth H. Blanchard'],
                        image: 'https://images.gr-assets.com/books/1388639717l/4894.jpg'
                    },
                    {
                        id: 3,
                        title: 'Option B',
                        author: ['Sheryl Sandberg', 'Adam Grant', 'Adam M. Grant'],
                        image: 'https://images.gr-assets.com/books/1493998427l/32938155.jpg'
                    }
                ];

                self.loading = false;
            }, time );
        },

        onActionClick(action, row) {
            if ( 'trash' === action ) {
                if ( confirm('Are you sure to delete?') ) {
                    alert('deleted: ' + row.title);
                }
            }
        },

        goToPage(page) {
            console.log('Going to page: ' + page);
            this.currentPage = page;
            this.loadBooks(1000);
        },

        onBulkAction(action, items) {
            console.log(action, items);
            alert(action + ': ' + items.join(', ') );
        },

        sortCallback(column, order) {
            this.sortBy = column;
            this.sortOrder = order;

            this.loadBooks(1000);
        }
    }
}
</script>

<style lang="less">
.home {
    h1 {
        margin-bottom: 15px;
    }

    .image {
        width: 10%;
    }

    .title {
        width: 30%;
    }

    td.title img {
        float: left;
        margin-right: 10px;
        margin-top: 1px;
    }

    td.title strong {
        display: block;
        margin-bottom: .2em;
        font-size: 14px;
    }
}
</style>
