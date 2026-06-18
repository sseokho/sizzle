import { createApp } from 'vue'
import App from './App.vue'
import mitt from 'mitt'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore'

import router from './router'
import store from './store'
import { auth, db } from './firebase'

import './registerServiceWorker'

const emitter = mitt()
const app = createApp(App)
app.config.globalProperties.emitter = emitter

let unsubscribeProfile = null
let mounted = false

function mountApp() {
  if (!mounted) {
    mounted = true
    app.use(store).use(router).mount('#app')
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Auth 확인 즉시 기본 정보로 로그인 처리
    store.commit('login', {
      uid:      user.uid,
      email:    user.email,
      nickname: user.displayName || user.email.split('@')[0],
    })

    // Firestore에서 닉네임/팔로잉 비동기로 보완
    if (unsubscribeProfile) unsubscribeProfile()
    unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const data = snap.exists() ? snap.data() : {}
      store.commit('login', {
        uid:      user.uid,
        email:    user.email,
        nickname: data.nickname || user.displayName || user.email.split('@')[0],
      })
      store.commit('setFollowing', data.following || [])
    })
  } else {
    if (unsubscribeProfile) {
      unsubscribeProfile()
      unsubscribeProfile = null
    }
    store.commit('logout')
  }

  // Auth 상태 확인되면 바로 마운트 (Firestore 응답 기다리지 않음)
  mountApp()
})

async function seedIfEmpty() {
  const snap = await getDocs(collection(db, 'posts'))
  if (!snap.empty) return

  const samples = [
    {
      uid: null, name: '지민', handle: '@jimin_eats', initials: '지',
      avBg: '#FFD8A8', avFg: '#B5642E',
      area: '을지로3가',
      imgUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=80&auto=format&fit=crop',
      dish: '마제소바', cat: '일식',
      likedBy: [], savedBy: [], commentList: [],
      caption: '퇴근길 마제소바 한 그릇 면발이 미쳤다…',
      tags: '#을지로맛집 #마제소바 #직장인점심',
      createdAt: Timestamp.fromDate(new Date('2026-06-15T12:00:00')),
    },
    {
      uid: null, name: '도윤', handle: '@doyoon.food', initials: '도',
      avBg: '#FBD9C2', avFg: '#C0556A',
      area: '연남동',
      imgUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80&auto=format&fit=crop',
      dish: '리코타 팬케이크', cat: '카페·디저트',
      likedBy: [], savedBy: [], commentList: [],
      caption: '주말 브런치는 역시 팬케이크 색감부터 달달했음',
      tags: '#연남동카페 #브런치 #디저트',
      createdAt: Timestamp.fromDate(new Date('2026-06-16T10:00:00')),
    },
    {
      uid: null, name: '서아', handle: '@seoa_table', initials: '서',
      avBg: '#E7C9A6', avFg: '#8A5A2E',
      area: '한남동',
      imgUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=900&q=80&auto=format&fit=crop',
      dish: '드라이에이징 스테이크', cat: '양식',
      likedBy: [], savedBy: [], commentList: [],
      caption: '기념일 디너는 역시 스테이크 미디엄레어 완벽',
      tags: '#한남동맛집 #파인다이닝 #기념일',
      createdAt: Timestamp.fromDate(new Date('2026-06-17T18:00:00')),
    },
  ]

  for (const post of samples) {
    await addDoc(collection(db, 'posts'), post)
  }
}

seedIfEmpty()
