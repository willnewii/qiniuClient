export default [
    {
        path: '/',
        name: 'main',
        components: require('pages/Main.vue'),
        children: [
            {
                path: 'bucketPage',
                name: 'bucketPage',
                components: require('pages/bucketPage.vue')
            },
            {
                path: 'setup',
                name: 'setup',
                components: require('pages/Setup.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        components: require('pages/Login.vue')
    },
    {
        path: '/tray',
        name: 'tray',
        components: require('pages/Tray.vue')
    }
]
