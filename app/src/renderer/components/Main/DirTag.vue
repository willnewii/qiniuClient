<style lang="scss" scoped>
    .layout-tag {
        flex-grow: 1;
        overflow-x: scroll;
        white-space: nowrap;
        margin-right: 10px;
        .blue-tag {
            color: #39f !important;
            border: 1px solid #39f !important;
        }
    }
</style>
<template>
    <div class="layout-tag">
        <Tag type="border" v-for="item of bucket.dirs" :key="item" :class="bucket.currentDir == item ? 'blue-tag' : ''">
            <p v-on:click="doSearch(item)">{{item == '' ? '全部' : item == '__withoutDelimiter__' ? '其他' : item}}</p>
        </Tag>
    </div>
</template>
<script>
    export default {
        name: 'DirTag',
        props: {
            bucket: {
                type: Object
            }
        },
        methods: {
            doSearch(tag, event) {
                this.$emit('on-click', tag, event);
            }
        }
    };
</script>