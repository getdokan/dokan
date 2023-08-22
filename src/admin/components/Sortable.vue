<template>
    <draggable
        :component-data="getComponentData()"
        @change="onChangeData"
        tag="div"
        @start="dragging = true"
        @end="dragging = false"
    >
        <div
            v-for="item in menuList"
            :key="item.pos"
            class='menu-item'
        >
            <div class='first-part'>
                <div class='svg-pull-wrapper'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9.97011 9.26885C9.97011 8.88392 9.65807 8.57188 9.27314 8.57188C8.88822 8.57188 8.57617 8.88392 8.57617 9.26885C8.57617 9.65378 8.88822 9.96582 9.27314 9.96582C9.65807 9.96582 9.97011 9.65378 9.97011 9.26885Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.97011 4.38994C9.97011 4.00502 9.65807 3.69297 9.27314 3.69297C8.88822 3.69297 8.57617 4.00502 8.57617 4.38994C8.57617 4.77487 8.88822 5.08691 9.27314 5.08691C9.65807 5.08691 9.97011 4.77487 9.97011 4.38994Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.97011 14.1473C9.97011 13.7623 9.65807 13.4503 9.27314 13.4503C8.88822 13.4503 8.57617 13.7623 8.57617 14.1473C8.57617 14.5322 8.88822 14.8442 9.27314 14.8442C9.65807 14.8442 9.97011 14.5322 9.97011 14.1473Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9.69765 9.26934C9.69765 8.88441 9.38561 8.57237 9.00068 8.57237C8.61575 8.57237 8.30371 8.88441 8.30371 9.26934C8.30371 9.65426 8.61575 9.96631 9.00068 9.96631C9.38561 9.96631 9.69765 9.65426 9.69765 9.26934Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.69765 4.39043C9.69765 4.00551 9.38561 3.69346 9.00068 3.69346C8.61575 3.69346 8.30371 4.00551 8.30371 4.39043C8.30371 4.77536 8.61575 5.0874 9.00068 5.0874C9.38561 5.0874 9.69765 4.77536 9.69765 4.39043Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9.69765 14.1478C9.69765 13.7628 9.38561 13.4508 9.00068 13.4508C8.61575 13.4508 8.30371 13.7628 8.30371 14.1478C8.30371 14.5327 8.61575 14.8447 9.00068 14.8447C9.38561 14.8447 9.69765 14.5327 9.69765 14.1478Z" stroke="#828282" stroke-width="1.39394" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                {{ ! item.edit_now || ! item.is_switched_on ?  item.title : '' }}
                <input
                    v-if='item.edit_now && item.is_switched_on'
                    v-model='item.title'
                    type='text'
                />
            </div>
            <div class='second-part'>
                <svg
                    v-if="(item.editable && item.editable === true) && !item.edit_now && ! item.temporary_disable_edit"
                    v-on:click='item.edit_now = true'
                    xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6168 4.33053C11.221 3.72576 12.2047 3.72576 12.8094 4.33053C13.1022 4.6232 13.2634 5.01275 13.2634 5.42705C13.2634 5.84136 13.1022 6.23091 12.8094 6.52301L11.951 7.3815L9.7584 5.1889L10.6168 4.33053ZM4.10762 10.9119C4.12 10.8524 4.14919 10.7972 4.19257 10.7538L9.10065 5.84639L11.2933 8.03887L6.38585 12.9463C6.34304 12.9898 6.28784 13.0188 6.22708 13.0313L4.03448 13.4698C4.01404 13.4742 3.99348 13.476 3.97372 13.476C3.8924 13.476 3.81302 13.4444 3.75407 13.3855C3.68093 13.3116 3.64868 13.2068 3.66912 13.1052L4.10762 10.9119Z" fill="#828282"/>
                </svg>
                <switches
                    @input="switchToggle"
                    v-if='(item.switchable && item.switchable === true)'
                    :enabled='item.is_switched_on'
                    :value='item.menu_key'
                ></switches>
            </div>
        </div>
    </draggable>
</template>

<script>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import switches from './Switches.vue';
export default {
    title: "Sortable",
    components: {
        ref,
        draggable,
        switches
    },
    props: {
        list: Object
    },
    data() {
        return {
            menuList: Object.assign( {}, this.list ),
            dragging: false,
        }
    },
    created() {
        /**
         * Additional fields for different frontend effects
         */
        let additional_fields = {
            menu_key: '',
            previous_title: '',
            edit_now: false,
            editable: true,
            temporary_disable_edit: false,
            switchable: true,
            is_switched_on: true,
            menu_manager_position: 0, // Dashboard menu manager position
        };
        Object.keys(this.menuList).map( ( key ) => {
            let _new_object = { ...additional_fields, ...this.menuList[key] };
            _new_object.menu_key = key;
            _new_object.previous_title = _new_object.title;
            this.menuList[key] = _new_object;
        } );
        // console.log(this.menuList);

        // Sorting like in position at backend
        this.menuList = Object.fromEntries(
            Object.entries(this.menuList).sort(([, a], [, b]) => {
                let position_a = a.menu_manager_position || a.pos;
                let position_b = b.menu_manager_position || b.pos;
                return position_a - position_b;
            })
        );
        // console.log(this.menuList);

        Object.keys(this.menuList).map( ( value, index ) => {
            this.menuList[value].menu_manager_position = index
            console.log(this.menuList[value].menu_key + ": " + this.menuList[value].pos + "[" + this.menuList[value].menu_manager_position + "]" );
        } )


        // console.log(this.menuList);
        // Object.entries( this.menuList ).map((value, key) => {
        //     console.log(key);
        //     console.log(value);
            // console.log(`${value.menu_key}: ${value.pos}`)
        // });
    },
    methods: {
        getComponentData() {
            return {
                on: {
                    change: ( e ) => {
                        console.log('Changed');
                        console.log(e);
                        let new_drag_index = e.newDraggableIndex;
                        let new_index = e.newIndex;
                        let old_drag_index = e.oldDraggableIndex;
                        let old_index = e.oldIndex;

                        // Update Index
                        Object.keys( this.menuList ).map( (value, index ) => {
                            this.menuList[key].menu_manager_position == new_drag_index
                        });

                        // console.log(e.newDraggableIndex);
                        // console.log(this.menuList);
                        // @TODO Swap Values
                    },
                    // move: ( e ) => {
                    //   console.log('Moved');
                    //   console.log(e);
                    //   return false;
                    // }
                  // input: function() {
                  //       console.log('input')
                  // }
                },
                // props: {
                //   value: this.activeNames
                // }
            }
        },
        onChangeData(e) {
            console.log('Changed');
        },
        switchToggle(checked, value) {

            this.menuList[value].temporary_disable_edit = !checked;

            if( checked &&  this.menuList[value].edit_now) {
                this.menuList[value].edit_now = false;
            } else {
                this.menuList[value].title = this.menuList[value].previous_title;
            }
            this.menuList[value].is_switched_on = checked;
            console.log([checked, value]);
        },
        checkMove: (e) => {
            console.log("Move");
        }
    },
    computed: {
        onChangeDatac() {
            console.log( 'OnChangeDataC' )
        }
    },
    watch: {
        menuList : {
            handler() {
                // console.log("menuList changed");
                // console.log(this.menuList);
            },
            deep : true
        }
    },
}

</script>
