export default [
    {
        path: '/',
        name: 'main',
        component: require('pages/Main.vue'),
        children: [
            {
                path: 'table',
                name: 'table',
                component: require('components/Main/RightContent.vue')
            },
            {
                path: 'setup',
                name: 'setup',
                component: require('pages/Setup.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: require('pages/Login.vue')
    },
    {
        path: '/tray',
        name: 'tray',
        component: require('pages/Tray.vue')
    }
]
