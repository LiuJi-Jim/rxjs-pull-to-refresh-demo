import Vue from 'vue'
import App from './App'
import pullToRefresh from './directives/pull-to-refresh'

Vue.config.debug = true
Vue.directive('pull-to-refresh', pullToRefresh)

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})
