/**
 * Created by zhangweiwei on 2017/2/28.
 */
let eventBus = {
  $emit: () => {},
}
if (typeof window !== 'undefined') {
  const Vue = require('vue').default
  eventBus = new Vue()
}

export default eventBus
