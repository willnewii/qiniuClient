<template>
    <div class="layout-header">
        <div class="full">
            <Select class="input no-drag" v-model="bucket.domain"
                    v-if="bucket.name && bucket.domains && bucket.domains.length > 0" @on-change="onChangeDomain">
                <Option v-for="item of bucket.domains" :value="item" :key="item">{{ item }}</Option>
            </Select>
            <!-- TODO:添加自定义域名功能-->
            <Input class="input no-drag" v-model="bucket.domain" v-if="bucket.domains.length === 0 && isSupportDomain"
                   :placeholder="domainPlaceholder" @on-blur="saveDomain" placeholder="自定义域名" error="链接不合法"/>
        </div>

        <template v-if="bucket.name">
            <div v-if="isMac" @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
                <i-button class="button" type="text" @click="actionBtn(0)">
                    <Tooltip content="文件、文件夹上传(支持多选)" placement="bottom">
                        <Icon type="md-cloud-upload" size="24"/>
                    </Tooltip>
                </i-button>
            </div>

            <div v-if="isWin" style="display: flex;">
                <i-button class="button" type="text" @click="actionBtn(3)">
                    <Tooltip content="文件上传(支持多选)" placement="bottom">
                        <Icon type="md-document" size="24"/>
                    </Tooltip>
                </i-button>
                <i-button class="button" type="text" @click="actionBtn(4)">
                    <Tooltip content="文件夹上传(支持多选)" placement="bottom">
                        <Icon type="md-folder" size="24"></Icon>
                    </Tooltip>
                </i-button>
            </div>

            <div v-if="isSupportUrlUpload" @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
                <i-button class="button" type="text" @click="actionBtn(1)">
                    <Tooltip content="通过url直接上传文件" placement="bottom">
                        <Icon type="md-link" size="24"/>
                    </Tooltip>
                </i-button>
            </div>

            <div @mouseenter="toggleShow($event)" @mouseleave="toggleShow($event)">
                <i-button class="button" type="text" @click="actionBtn(5)">
                    <Tooltip :content="`刷新bucket：${bucket.name}`" placement="bottom">
                        <Icon type="md-refresh" size="24"/>
                    </Tooltip>
                </i-button>
            </div>
        </template>

        <Dropdown @on-click="clickMore">
            <i-button class="button" type="text" v-if="bucket.name">
                <Icon type="md-more" size="24"/>
            </i-button>
            <DropdownMenu slot="list">
                <DropdownItem name="7">
                    <div @click="actionBtn(7)">
                        {{`批量导出资源URL`}}
                    </div>
                </DropdownItem>
                <DropdownItem name="6">
                    <div @click="actionBtn(6)">
                        同步bucket
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>

        <Input class="input-search no-drag" v-model="search" placeholder="搜索" :icon="search.length > 0 ? 'md-close-circle' : ''"
               @on-enter="actionBtn(2)" @on-click="clearSearch"
               v-show="bucket.name"/>

        <!-- 同步对话框-->
        <Modal v-model="model_merge.show" title="请选择同步方式" class-name="vertical-center-modal"
               @on-ok="syncFolder">
            <template>
                <RadioGroup v-model="model_merge.mode" vertical>
                    <Radio :label="0">
                        <span>合并</span>
                    </Radio>
                    <Radio :label="1">
                        <span>覆盖云盘(以本地文件为基准,云盘未对应的文件会被删除)</span>
                    </Radio>
                    <Radio :label="2">
                        <span>覆盖本地(以云盘文件为基准,本地未对应的文件会被删除)</span>
                    </Radio>
                </RadioGroup>
            </template>
        </Modal>

        <!-- 上传对话框-->
        <upload-modal :bucket="bucket" ref="uploadModal"></upload-modal>
    </div>
</template>
<script>
    import {mapGetters, mapActions} from 'vuex';
    import * as types from '../vuex/mutation-types';
    import UploadModal from "./UploadModal";
    import {Constants, EventBus} from '../service';
    import brand from "@/cos/brand";

    export default {
        components: {UploadModal},
        name: 'Header',
        data() {
            return {
                search: '',
                isMac: process.platform === 'darwin',
                isWin: process.platform === 'win32',
                isSupportUrlUpload: false,
                isSupportDomain: false,
                model_merge: {
                    show: false,
                    mode: 0
                }
            };
        },
        computed: {
            ...mapGetters({
                customedomain: types.setup.customedomain,
            }),
            domainPlaceholder() {
                switch (this.$storage.key) {
                    case brand.qiniu.key:
                        return '请填入空间域名';
                    case brand.upyun.key:
                        return '请填入又拍云的加速域名';
                    default:
                        return '';
                }
            },
        },
        props: {
            bucket: {
                type: Object
            },
        },
        watch: {
            'bucket.key': function (val) {
                if (val) {
                    this.updateSupport();
                }
            },
        },
        created() {
            console.log(this.bucket);
            this.updateSupport();
            EventBus.$on(Constants.Event.changePrivate, (data) => {
                this.bucket.getACL();
                this.actionBtn(5);
            });
            this.$once('hook:beforeDestroy', function () {
                EventBus.$off(Constants.Event.changePrivate);
            });
        },
        mounted() {
            if (this.$storage.key === brand.upyun.key && !this.bucket.domain) {
                this.$Message.warning({
                    content: '请先设置又拍云的加速域名.您可以在又拍云控制台查看您的加速域名',
                    duration: 8
                });
            }
        },
        methods: {
            ...mapActions([
                types.setup.a_customedomain,
            ]),
            updateSupport() {
                this.isSupportUrlUpload = [brand.qiniu.key, brand.qingstor.key].indexOf(this.$storage.key) !== -1;
                this.isSupportDomain = [brand.qiniu.key, brand.tencent.key, brand.upyun.key].indexOf(this.$storage.key) !== -1;
            },
            onChangeDomain(e) {
                let obj = Object.create(null);
                obj[this.bucket.name] = e;
                this[types.setup.a_customedomain](obj);
            },
            /**
             * 保存自定义域名
             * 只保存域名host部分
             */
            saveDomain() {
                let val = this.bucket.domain;

                if (val.length === 0) {
                    let obj = Object.create(null);
                    obj[this.bucket.name] = '';
                    this[types.setup.a_customedomain](obj);
                    return;
                }

                try {
                    if (this.bucket && val) {
                        let obj = Object.create(null);
                        obj[this.bucket.name] = val;
                        this[types.setup.a_customedomain](obj);
                        this.bucket.domain = val;
                        this.$Message.success('自定义域名保存成功,请刷新页面');
                    }
                } catch (err) {
                    this.bucket.domain = '';
                    this.$Message.error('自定义域名不合法');
                }
            },
            clearSearch() {
                this.search = '';
                EventBus.$emit(Constants.Event.updateFiles);
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
                    case 0://mac 对话框,选取文件和文件夹多选
                    case 1://抓取文件
                    case 3://win 对话框,选取文件多选
                    case 4://win 对话框,选取文件夹多选
                        this.$refs['uploadModal'].uploadAction(index);
                        break;
                    case 2://搜索事件
                        EventBus.$emit(Constants.Event.updateFiles, {keyWord: this.search, flatten: true});
                        break;
                    case 5://刷新当前bucket
                        this.$parent.getResources();
                        break;
                    case 6:// 同步当前bucket
                        this.showSyncFolder();
                        break;
                    case 7://
                        this.$parent.exportURL();
                        break;
                }
            },
            showSyncFolder() {
                this.model_merge.show = true;
                this.model_merge.mode = 0;
            },
            syncFolder() {
                let files = this.bucket.files;
                files.forEach((item, index) => {
                    files[index].url = this.$parent.$refs['resource-grid'].getResourceUrl(item);
                });

                this.$electron.ipcRenderer.send(Constants.Listener.syncDirectory, {
                    properties: ['openDirectory'],
                    files,
                    type: this.$storage.key,
                    mergeType: this.model_merge.mode,
                });
            },
            clickMore(name) {
                this.actionBtn(name);
            }
        }
    };
</script>
<style lang="scss" scoped>
    @import "../style/params";

    .layout-header {
        background: $bg-header;
        box-shadow: 2px 2px 1px rgba(0, 0, 0, .1);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding-top: 10px;
        padding-right: 15px;
        -webkit-app-region: drag;

        .full {
            flex-grow: 1;
            margin-left: 16px;

            .input {
                width: 250px;
            }
        }

        .input-search {
            width: 165px;
            margin: 8px 0;
        }

        .button {
            color: $fontColor;
        }
    }
</style>
