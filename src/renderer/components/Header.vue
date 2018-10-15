<style lang="scss" scoped>
    .layout-header {
        background: #fff;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .1);
        display: flex;
        align-items: center;
        padding-right: 15px;
        -webkit-app-region: drag;

        .full {
            flex-grow: 1;
            margin-left: 16px;
        }

        .input-search {
            width: 165px;
            margin: 8px 0;
        }
    }
</style>
<template>
    <div class="layout-header">
        <div class="full">
            <Select style="width:250px" v-model="bucket.domain"
                    v-if="bucket.name && bucket.domains && bucket.domains.length > 0">
                <Option v-for="item of bucket.domains" :value="item" :key="item">{{ item }}</Option>
            </Select>
            <Input style="width:250px" v-model="bucket.domain" v-if="bucket.domains.length === 0"
                   placeholder="请填入空间域名"/>
        </div>

        <div @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
            <i-button type="text" @click="actionBtn(0)" v-if="bucket.name">
                <Tooltip content="文件上传(支持多选)" placement="bottom">
                    <Icon type="ios-plus-outline" size="24"/>
                </Tooltip>
            </i-button>
        </div>

        <div @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
            <i-button type="text" @click="actionBtn(1)" v-if="bucket.name">
                <Tooltip content="通过url直接上传文件" placement="bottom">
                    <Icon type="ios-cloud-upload-outline" size="24"/>
                </Tooltip>
            </i-button>
        </div>

        <Input class="input-search" v-model="search" :placeholder="placeholder" icon="ios-close-outline"
               @on-enter="actionBtn(2)" @on-click="clearSearch"
               v-show="bucket.name"/>

        <upload-modal :bucket="bucket" ref="uploadModal"></upload-modal>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import UploadModal from "./UploadModal";

    export default {
        components: {UploadModal},
        name: 'Header',
        data() {
            return {
                search: '',
            };
        },
        computed: {
            placeholder() {
                if (this.bucket.getCurrentDir()) {
                    return '搜索' + this.bucket.getCurrentDir() + '目录下文件';
                } else {
                    return '搜索';
                }
            },
        },
        watch: {
            'bucket.domain': function (val) {//在domains为空时,保存 bucket.domain
                if (this.bucket && this.bucket.domains.length === 0 && val) {
                    let obj = {};
                    obj[this.bucket.name] = val;
                    this[types.setup.setup_a_customedomain](obj);
                }
            },
        },
        props: {
            bucket: {
                type: Object
            },
        },
        created() {
        },
        methods: {
            ...mapActions([
                types.setup.setup_a_customedomain,
            ]),
            clearSearch() {
                this.search = '';
                this.$emit('on-search', this.bucket.getCurrentDir(), this.search, event);
            },
            toggleShow($event) {//鼠标移入/移出动画,没有实际用途
                let target = $event.target.getElementsByClassName('ivu-tooltip-rel')[0];
                let className = target.className;

                let animationIn = 'animated _rotateIn';
                let animationOut = 'animated _rotateOut';

                if (className.indexOf(animationIn) !== -1) {
                    target.className = target.className.replace(animationIn, animationOut);
                } else if (className.indexOf(animationOut) !== -1) {
                    target.className = target.className.replace(animationOut, animationIn);
                } else {
                    target.className += ' ' + animationIn;
                }
            },
            actionBtn(index) {
                switch (index) {
                    case 0://调用文件选取对话框
                    case 1://抓取文件
                        this.$refs['uploadModal'].uploadAction(index);
                        break;
                    case 2://搜索事件
                        this.$emit('on-search', this.bucket.getCurrentDir(), this.search, event);
                        break;
                }
            }
        }
    };
</script>