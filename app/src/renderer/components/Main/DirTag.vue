<style lang="scss" scoped>
    .layout-tag {
        padding: 15px 15px 0 15px;

        .blue-tag {
            color: #39f !important;
            border: 1px solid #39f !important;
        }
    }
</style>
<template>
    <div class="layout-tag">
        <Tag type="border" v-for="item of tags" :class="currentTag == item ? 'blue-tag' : ''">
            <p v-on:click="doSearch(item)">{{item == '' ? '全部' : item == '__withoutDelimiter__' ? '其他' : item}}</p>
        </Tag>
    </div>
</template>
<script>
    export default {
        name: 'DirTag',
        props: {
            tags: {
                type: Array,
                default: ['', '__withoutDelimiter__']
            },
            currentTag: {
                type: String,
                default: ''
            }
        },
        methods: {
            doSearch (tag, event) {
                this.$emit('on-click', tag, event);
            }
        }
    };
</script>