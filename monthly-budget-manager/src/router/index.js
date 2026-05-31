import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import BudgetConfig from '../views/BudgetConfig.vue'
import Records from '../views/Records.vue'
import Statistics from '../views/Statistics.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home, meta: { title: '预算总览' } },
  { path: '/budget', component: BudgetConfig, meta: { title: '预算配置' } },
  { path: '/records', component: Records, meta: { title: '收支记录' } },
  { path: '/statistics', component: Statistics, meta: { title: '数据统计' } },
  { path: '/settings', component: Settings, meta: { title: '个人设置' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
