<template>
    <div class="layout-tag">
        <Tag type="border" v-for="item of bucket.dirs" :key="item"
             :class="{'blue-tag':bucket.currentDir === item}">
            <p v-on:click="doSearch(item)">{{getText(item)}}</p>
        </Tag>
    </div>
</template>
<script>
    import {Constants} from '../service/index';

    export default {
        name: 'Directory',
        props: {
            bucket: {
                type: Object
            }
        },
        data() {
            return {};
        },
        methods: {
            getText(name) {
                switch (name) {
                    case '':
                        return '全部';
                    case Constants.Key.withoutDelimiter:
                        return '其他';
                    default :
                        return name;
                }
            },
            doSearch(tag, event) {
                this.$emit('on-click', tag, event);
            }
        }
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    .layout-tag {
        //flex-grow: 1;
        white-space: nowrap;
        .blue-tag {
            color: $primary !important;
            border: 1px solid $primary !important;
        }
        &::-webkit-scrollbar {
            width: 0;
            height: 0;
            color: transparent;
        }
    }
</style>