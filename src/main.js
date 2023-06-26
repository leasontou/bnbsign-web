import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './assets/css/common.scss'
import plugins from '@/plugins'
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'
import InlineSvg from 'vue-inline-svg';
import pdf from 'vue-pdf'
import VueDragResize from 'vue-drag-resize'

Vue.config.productionTip = false

Vue.use(plugins)
Vue.component('inline-svg', InlineSvg);
Vue.component("VuePdfEmbed", VuePdfEmbed)
Vue.component("pdf", pdf)
Vue.component('VueDragResize', VueDragResize)


new Vue({
  router,
  store,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
