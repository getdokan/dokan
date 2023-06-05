<template>
    <div class='dokan-radio-fields'>
        <label v-for='( item, index ) in items' :class="item.value === value ? 'checked' : ''" :key="`${index}-${item.value}`" :for="`${index}-${item.value}`">
            <span class='dashicons dashicons-yes'></span>
            <input
                type='radio'
                class='radio'
                :name="'dokan-group-radio-input'"
                :value="item.value"
                :id="`${index}-${item.value}`"
                @change="$emit('onChange', $event.target.value)"
            />
            {{ item.label }}
        </label>
    </div>
</template>

<script>

export default {
    name: 'DokanRadioGroup',
    props: ['items','value'],
    emits: ['onChange']
}
</script>

<style lang='less'>
.dokan-radio-fields {
    display: flex;
    flex: 2;
    align-self: center;

    label {
        border: 0.882967px solid #b0a7a7;
        padding: 10px 15px;
        display: inline-block;
        overflow: hidden;
        font-size: 12px;
        box-shadow: 0 3.53187px 3.53187px rgba(0,0,0,.1);
        font-family: Roboto,sans-serif;
        font-weight: 400;
        line-height: 14px;
        border-right: 0;

        .dashicons-yes {
            color: #fff;
            width: 15px;
            height: 15px;
            margin: -1px 3px 0 0;
            cursor: pointer;
            display: none;
            font-size: 15px;
            background: #1aa0f7;
            padding-top: 0;
            border-radius: 50%;
        }

        input[type=radio] {
            display: none;
        }

        &:hover {
            color: rgba(3,58,163,.85);
            background: rgba(182,206,254,.38);
            box-sizing: border-box;
            box-shadow: 0 4px 4px rgba(0,0,0,.1);
        }

        &.checked {
            color: rgba(3,58,163,.85);
            border: 1px solid rgba(3,58,163,.81) !important;
            background: rgba(182,206,254,.38);
            box-sizing: border-box;
            box-shadow: 0 4px 4px rgba(0,0,0,.1);

            .dashicons-yes {
                display: inline-block;
            }
        }
        &:first-child {
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
        }
        &:last-child {
            border-right: 0.882967px solid #b0a7a7;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
        }
    }
}
</style>
