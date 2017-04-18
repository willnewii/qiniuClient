export default [
    {
        path: '/',
        name: 'main',
        component: require('components/Main.vue'),
        children: [
            {
                path: 'table',
                name: 'table',
                component: require('components/Main/RightContent.vue')
            },
            {
                path: 'setup',
                name: 'setup',
                component: require('components/Setup.vue')
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: require('components/SetToken.vue')
    },
    {
        path: '/tray',
        name: 'tray',
        component: require('components/Tray.vue')
    }
]
