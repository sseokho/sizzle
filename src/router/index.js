import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'
import Explore from '../views/Explore.vue'
import Profile from '../views/Profile.vue'
import Upload from '../views/Upload.vue'

const routes = [
  { path: '/',         redirect: '/home' },
  { path: '/login',    component: Login },
  { path: '/signup',   component: Signup },
  { path: '/home',     component: Home },
  { path: '/map',      component: Map },
  { path: '/explore',  component: Explore },
  { path: '/profile',  component: Profile },
  { path: '/upload',   component: Upload },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
