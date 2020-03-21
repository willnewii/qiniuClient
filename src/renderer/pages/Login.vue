<style lang="scss" scoped>
    @import "../style/params";

    .layout {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .title {
        width: 100%;
        text-align: center;
        padding: 10px;
    }

    .table {
        width: 60%;
    }

    .buttons {
        margin-top: 50px;
    }

    .item {
        padding: 5px 10px;
        display: flex;
        flex-direction: row;
        align-items: center;

        .name {
            font-size: 14px;
            margin-left: 20px;
        }

        .long {
            flex-grow: 1;
        }

        &:nth-child(2n) {
            background-color: $bg-item-selected;
        }

        &:hover {
            background: rgba(28, 36, 56, 0.20);
        }
    }
</style>
<style>
    .ivu-select-dropdown {
        max-height: 100px;
    }
</style>
<template>
    <div class="layout drag">
        <Tabs class="no-drag table" type="card" ref="tabs" @on-click="onTabClick">
            <TabPane :disabled="!(this.coses && this.coses.length > 0)" name="已登录" label="已登录">
                <div class="item" v-for="(item,index) in this.coses" :key="index" @click="openCOS(item)">
                    <span :class="`iconfont icon-${item.key}`" style="font-size: 20px"></span>
                    <span class="name long">{{item.name}}</span>
                    <Icon type="ios-trash-outline" size="20" @click.stop="removeCOS(item)"/>
                </div>
            </TabPane>
            <TabPane v-for="(item) in brands" :key="item.key" :name="item.key" :label="item.name">
                <h3 class="title">设置{{item.name}}密钥</h3>
                <Form :model="formItem" :ref="item.key" :rules="ruleItem" :label-width="150">
                    <template v-if="item.key === brands.upyun.key">
                        <Form-item label="别名" prop="name">
                            <Input v-model="formItem.name" placeholder="别名"/>
                        </Form-item>
                        <Form-item label="服务名称" prop="service_name">
                            <Input v-model="formItem.service_name" placeholder="请填入服务名称"/>
                        </Form-item>
                        <Form-item label="操作员名" prop="access_key">
                            <Input v-model="formItem.access_key" placeholder="请填入操作员名"/>
                        </Form-item>
                        <Form-item label="操作员密码" prop="secret_key">
                            <Input v-model="formItem.secret_key" placeholder="请填入操作员密码"/>
                        </Form-item>
                    </template>
                    <template v-else>
                        <Form-item label="别名" prop="name">
                            <Input v-model="formItem.name" placeholder="别名"/>
                        </Form-item>
                        <Form-item label="ACCESS_KEY" prop="access_key">
                            <Input v-model="formItem.access_key" placeholder="请填入你的ACCESS_KEY"/>
                        </Form-item>
                        <Form-item label="SECRET_KEY" prop="secret_key">
                            <Input v-model="formItem.secret_key" placeholder="请填入你的SECRET_KEY"/>
                        </Form-item>
                        <Form-item label="ENDPOINT" prop="endpoint" v-if="item.key === brands.minio.key">
                            <Input v-model="formItem.endpoint" placeholder="请填入服务的endpoint"/>
                        </Form-item>
                        <Form-item label="区域" prop="region" v-if="item.key === brands.aws.key || item.key === brands.jd.key">
                            <Select v-model="formItem.region">
                                <Option v-for="item in regions" :value="item.region" :key="item.region">{{ item.name }}
                                </Option>
                            </Select>
                        </Form-item>
                        <Form-item label="内网访问" prop="internal" v-if="item.key === brands.aliyun.key">
                            <i-switch v-model="formItem.internal"/>
                        </Form-item>
                    </template>

                    <Form-item>
                        <div class="buttons">
                            <Button type="primary" @click="handleSubmit(item.key)">设置</Button>
                            <Button @click="handleReset(item.key)" style="margin-left: 8px">重置</Button>
                        </div>
                    </Form-item>
                    <div style="margin-left: 150px">＊如何获取密钥信息:登录
                        <template v-if="item.key === brands.qiniu.key">
                            <a @click="openBrowser('https://portal.qiniu.com/user/key')">{{item.name}}</a>->个人面板->密钥管理
                        </template>
                        <template v-else-if="item.key === brands.tencent.key">
                            <a @click="openBrowser('https://console.cloud.tencent.com/cos5')">{{item.name}}</a>->密钥管理
                        </template>
                        <template v-else-if="item.key === brands.qingstor.key">
                            <a @click="openBrowser('https://console.qingcloud.com/')">{{item.name}}</a>->头像->API密钥
                        </template>
                        <template v-else-if="item.key === brands.aliyun.key">
                            <a @click="openBrowser('https://oss.console.aliyun.com/')">{{item.name}}</a>->Access
                            Key
                        </template>
                        <template v-else-if="item.key === brands.upyun.key">
                            <a @click="openBrowser('https://console.upyun.com/dashboard/')">{{item.name}}</a>->Access
                            Key
                        </template>
                    </div>
                </Form>
            </TabPane>
        </Tabs>
    </div>
</template>
<script>
    import {Constants, mixins, util} from '../service';
    import brand from '@/cos/brand';
    import Regions from '@/cos/Regions';

    export default {
        mixins: [mixins.base],
        data() {
            return {
                selectBrand: brand.qiniu,
                formItem: {
                    service_name: '',
                    access_key: '',
                    secret_key: '',
                    region: '',
                    endpoint: '',
                    internal: false,
                    name: '',
                },
                ruleItem: {
                    access_key: [{required: true, message: 'access_key不能为空', trigger: 'blur'}],
                    secret_key: [{required: true, message: 'secret_key不能为空', trigger: 'blur'}],
                    region: [{required: true, message: 'region不能为空', trigger: 'blur'}],
                    service_name: [{required: true, message: 'service_name不能为空', trigger: 'blur'}]
                },
                brands: brand,
                coses: [],
                regions: [],
            };
        },
        computed: {},
        created: function () {
            this.getCOS();
            this.handleReset();
        },
        mounted() {
        },
        methods: {
            onTabClick(key) {
                if (key !== '已登录') {
                    this.selectBrand = this.brands[key];
                    this.handleReset();
                }
                if (key === this.brands.aws.key) {
                    this.regions = Regions.s3;
                } else if (key === this.brands.jd.key) {
                    this.regions = Regions.jd;
                }
            },
            handleSubmit(key) {
                if (key !== brand.upyun.key) {
                    this.formItem.service_name = '-';
                }
                this.$refs[key][0].validate((valid) => {
                    if (valid) {
                        this.validateKey();
                    } else {
                        console.log('表单不能提交');
                    }
                });
            },
            handleReset() {
                this.formItem = this.$options.data().formItem;
                this.formItem.name = this.selectBrand.name;
            },
            validateKey() {
                let item = Object.assign({
                    key: this.selectBrand.key
                }, this.formItem);

                this.$storage.initCOS(item);
                this.$storage.getBuckets((error) => {
                    if (error) {
                        util.notification({
                            title: this.selectBrand.name,
                            body: error.message
                        });
                    } else {
                        this.$storage.saveCosKey(item, () => {
                            this.openCOS(item);
                        });
                    }
                });
            },
            openCOS(item) {
                this.$router.push({name: Constants.PageName.main, params: {cos: item}});
            },
            removeCOS(item) {
                this.$storage.cleanCosKey(item, () => {
                    this.getCOS();
                });
            },
            getCOS() {
                this.$storage.getBindCoses(({coses}) => {
                    this.coses = coses;
                    if (this.coses.length === 0) {
                        this.$refs['tabs'].activeKey = this.$refs['tabs'].getTabs()[1].name;
                    }
                });
            },
            openBrowser(url) {
                this.$electron.shell.openExternal(url);
            }
        }
    };
</script>
