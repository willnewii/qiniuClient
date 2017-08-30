export const protocol = 'http://';

export const method = {
    //列举一个账号的所有空间
    getBuckets: 'http://rs.qbox.me/buckets',
    //获取一个空间绑定的域名列表
    getDomains: 'http://api.qiniu.com/v6/domain/list',
    //获取目录(是通过公共前缀模拟出的效果)
    getResources: 'http://rsf.qbox.me/list',
};

export const URL = {
    github: 'https://github.com/willnewii/qiniuClient',
    issue: 'https://github.com/willnewii/qiniuClient/issues',
    releases: 'https://api.github.com/repos/willnewii/qiniuClient/releases/latest'
};

export const Event = {
    removes: 'removes',
    download: 'download'
};

export const CopyType = {
    URL: 'url',
    MARKDOWN: 'markdown'
};