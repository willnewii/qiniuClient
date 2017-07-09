<style scoped>
    .item {
        padding: 30px 0 0 30px;
    }

    .bucketdir {
        width: 200px;
        margin-right: 20px;
    }
</style>
<template>
    <div>
        <ClientHeader domains="[]"></ClientHeader>
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
            <Input class='bucketdir' v-model="bucketdir" size="small" placeholder="路径"></Input>
            <Button @click="saveDir" size="small">保存</Button>
            提示：默认文件将会被上传到:{{setup_bucket_name}}/{{setup_bucket_dir}}/
        </div>
    </div>
</template>

<script>
    import ClientHeader from '../components/Main/ClientHeader.vue'
    import {mapGetters, mapActions} from 'vuex'
    import * as types from '../vuex/mutation-types'

    export default {
        name: 'setup-page',
        data (){
            return {
                bucketname: '',
                bucketdir: '',
            }
        },
        computed: {
            ...mapGetters({
                buckets: types.APP.app_buckets,
                setup_copyType: types.APP.setup_copyType,
                setup_deleteNoAsk: types.APP.setup_deleteNoAsk,
                setup_bucket_name: types.APP.setup_bucket_name,
                setup_bucket_dir: types.APP.setup_bucket_dir,
            })
        },
        components: {ClientHeader},
        created: function () {
            this.bucketname = this.setup_bucket_name;
            this.bucketdir = this.setup_bucket_dir;
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
            },
            saveDir: function () {
                console.log(this.bucketname + '/' + this.bucketdir);
                this[types.APP.setup_a_savedir]([this.bucketname, this.bucketdir]);
            }
        }
    }
</script>

