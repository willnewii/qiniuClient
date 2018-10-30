/**
* Created by zhangweiwei on 2018/10/30.
*/
<template>
    <!-- 筛选文件-->
    <Modal v-model="model_Query.show" title="请选择你要筛选的范围" @on-ok="filter">
        <span>按文件大小：</span>
        {{tipFormatSize(model_Query.fileSize[0])}} ~ {{tipFormatSize(model_Query.fileSize[1])}}
        <Slider v-model="model_Query.fileSize" range :min='0' :max="model_Query.sizeArray.length -1"
                show-tip="never"></Slider>
        <span>按文件日期：</span>
        {{tipFormatDate(model_Query.fileDate[0])}} ~ {{tipFormatDate(model_Query.fileDate[1])}}
        <Slider v-model="model_Query.fileDate" range :min="0" :max="model_Query.dateArray.length -1"
                show-tip="never"></Slider>
    </Modal>
</template>

<script>
    import {util, mixins, EventBus, Constants} from '../service/index';

    export default {
        name: 'ResourceFilter',
        mixins: [mixins.resource],
        data() {
            return {
                model_Query: {
                    show: false,
                    fileSize: [0, 0],
                    sizeArray: [],
                    fileDate: [0, 0],
                    dateArray: []
                },
            };
        },
        computed: {},
        created() {
        },
        mounted() {
        },
        methods: {
            toggle() {
                this.model_Query.show = !this.model_Query.show;
                if (this.model_Query.show) {
                    this.query();
                }
            },
            query() {
                this.model_Query.show = true;

                this.model_Query.sizeArray = [].concat(this.bucket.files);
                this.model_Query.dateArray = [].concat(this.bucket.files);

                this.model_Query.sizeArray = util.quickSort(this.model_Query.sizeArray, 'fsize');
                this.model_Query.dateArray = util.quickSort(this.model_Query.dateArray, 'putTime');

                this.model_Query.fileSize = [0, this.bucket.files.length - 1];
                this.model_Query.fileDate = [0, this.bucket.files.length - 1];
            },
            filter() {
                let result = [];

                let sizeMin = this.model_Query.sizeArray[this.model_Query.fileSize[0]].fsize;
                let sizeMax = this.model_Query.sizeArray[this.model_Query.fileSize[1]].fsize;

                let dateMin = this.model_Query.dateArray[this.model_Query.fileDate[0]].putTime;
                let dateMax = this.model_Query.dateArray[this.model_Query.fileDate[1]].putTime;

                this.model_Query.sizeArray.forEach((item) => {
                    if (item.fsize >= sizeMin && item.fsize <= sizeMax && item.putTime >= dateMin && item.putTime <= dateMax) {
                        result.push(item);
                    }
                });

                EventBus.$emit(Constants.Event.updateFiles, result);
            },
            tipFormatSize(value) {
                if (this.model_Query.sizeArray && this.model_Query.sizeArray.length > 0) {
                    return util.formatFileSize(this.model_Query.sizeArray[value].fsize);
                } else {
                    return '';
                }
            },
            tipFormatDate(value) {
                if (this.model_Query.dateArray && this.model_Query.dateArray.length > 0) {
                    return util.formatDate(this.model_Query.dateArray[value].putTime);
                } else {
                    return '';
                }
            },
        }
    };
</script>

<style lang="scss" scoped>
</style>