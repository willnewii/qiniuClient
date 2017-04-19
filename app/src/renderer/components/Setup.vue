<style scoped>
    .item {
        padding: 20px 0 0 20px;
    }
</style>
<template>
    <div>
        <div class="item">
            直接删除,不需要确认：
            <i-switch v-model="setup_deleteNoAsk" size="small" @on-change="deleteNoAskChange"></i-switch>
        </div>
        <div class="item">
            默认复制格式：
            <Radio-group v-model="setup_copyType" @on-change="copyTypeChange">
                <Radio label="url"></Radio>
                <Radio label="markdown"></Radio>
            </Radio-group>
        </div>
        <div class="item">
            默认上传位置：
            <Select v-model="bucketname" size="small" style="width:100px">
                <Option v-for="item in buckets" :value="item" :key="item">{{ item }}</Option>
            </Select>
            /
            {{setup_savedir}}
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'

    export default {
        name: 'setup-page',
        data (){
            return {
                bucketname: ''
            }
        },
        computed: {
            ...mapGetters({
                setup_copyType: types.APP.setup_copyType,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
                setup_savedir: types.APP.setup_savedir,
                buckets: types.APP.app_buckets
            })
        },
        methods: {
            ...mapActions([
                types.APP.setup_a_copyType,
                types.APP.setup_a_deleteNoAsk,
                types.APP.setup_a_savedir,
            ]),
            deleteNoAskChange: function (state) {
                this[types.APP.setup_a_deleteNoAsk](state);
            },
            copyTypeChange: function (model) {
                console.log(model);
                this[types.APP.setup_a_copyType](model);
            }
        }
    }
</script>

