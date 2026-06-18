<template>
  <div class="explore-page">

    <!-- 헤더 -->
    <header class="header">
      <div class="header-logo">sizzle</div>
      <div class="live-badge">
        <span class="live-dot"></span>
        LIVE
      </div>
    </header>

    <!-- 타이틀 -->
    <div class="ranking-header">
      <div class="ranking-title-row">
        <h2 class="ranking-title">실시간 인기</h2>
        <span class="ranking-time">{{ currentTime }} 기준</span>
      </div>
      <p class="ranking-subtitle">지금 이 순간 가장 많은 사랑을 받고 있어요</p>
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-bar">
      <button
        v-for="item in categories"
        :key="item.id"
        class="cat-btn"
        :class="{ active: activeCategory === item.id }"
        @click="activeCategory = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 1위 강조 카드 -->
    <div v-if="rankedPosts.length > 0" class="top-card">
      <div class="top-rank-badge">🔥 1위</div>
      <div class="top-img-wrap">
        <img :src="rankedPosts[0].imgUrl" :alt="rankedPosts[0].dish" />
        <div class="top-img-overlay">
          <div class="top-dish">{{ rankedPosts[0].dish }}</div>
          <div class="top-likes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round">
              <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
            {{ (rankedPosts[0].likedBy?.length ?? 0).toLocaleString() }}
          </div>
        </div>
      </div>
      <div class="top-info">
        <div class="top-user">
          <div class="top-avatar" :style="{ background: rankedPosts[0].avBg, color: rankedPosts[0].avFg }">
            {{ rankedPosts[0].initials }}
          </div>
          <div>
            <div class="top-name">{{ rankedPosts[0].name }}</div>
            <div class="top-handle">{{ rankedPosts[0].handle }}</div>
          </div>
        </div>
        <div class="top-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
          </svg>
          <span v-if="rankedPosts[0].area">{{ rankedPosts[0].area }}</span>
        </div>
      </div>
    </div>

    <!-- 2위~ 리스트 -->
    <div class="ranking-list">
      <div
        v-for="(post, i) in rankedPosts.slice(1)"
        :key="i"
        class="ranking-item"
      >
        <div class="rank-num" :class="i === 0 ? 'rank-2' : i === 1 ? 'rank-3' : ''">
          {{ i === 0 ? '🥈' : i === 1 ? '🥉' : i + 2 }}
        </div>

        <img :src="post.imgUrl" :alt="post.dish" class="rank-thumb" />

        <div class="rank-info">
          <div class="rank-dish">{{ post.dish }}</div>
          <div class="rank-place">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
            </svg>
            {{ post.area }}
          </div>
          <div class="rank-user">{{ post.handle }}</div>
        </div>

        <div class="rank-likes">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4442E" stroke="#F4442E" stroke-width="1.5" stroke-linejoin="round">
            <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
          <span>{{ (post.likedBy?.length ?? 0).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div style="height: 80px"></div>
    <BottomNav active="explore" />
  </div>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'ExplorePage',
  components: { BottomNav },
  data() {
    return {
      posts: [],
      unsubscribe: null,
      activeCategory: 'all',
      currentTime: '',
      timer: null,
      categories: [
        { id: 'all',        label: '전체' },
        { id: '한식',       label: '🍚 한식' },
        { id: '일식',       label: '🍣 일식' },
        { id: '양식',       label: '🍝 양식' },
        { id: '카페·디저트', label: '☕ 카페·디저트' },
        { id: '분식',       label: '🍢 분식' },
      ],
    }
  },
  computed: {
    rankedPosts() {
      const filtered = this.activeCategory === 'all'
        ? this.posts
        : this.posts.filter(p => p.cat === this.activeCategory)
      return [...filtered].sort((a, b) => (b.likedBy?.length ?? 0) - (a.likedBy?.length ?? 0))
    },
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 60000)
    this.unsubscribe = onSnapshot(collection(db, 'posts'), (snap) => {
      this.posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  },
  beforeUnmount() {
    clearInterval(this.timer)
    this.unsubscribe?.()
  },
  methods: {
    updateTime() {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      this.currentTime = `${h}:${m}`
    },
  },
}
</script>

<style scoped>
.explore-page {
  min-height: 100vh;
  background: #FFFDFB;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  background: #FFFDFB;
  border-bottom: 1px solid #F4ECE4;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -0.5px;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #fff;
  background: #F4442E;
  padding: 4px 10px;
  border-radius: 999px;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 랭킹 타이틀 */
.ranking-header {
  padding: 20px 18px 6px;
}

.ranking-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.ranking-title {
  font-family: 'Baloo 2', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #241a14;
  letter-spacing: -0.5px;
}

.ranking-time {
  font-size: 12px;
  color: #9a8579;
}

.ranking-subtitle {
  font-size: 13px;
  color: #9a8579;
  margin-top: 4px;
}

/* 카테고리 바 */
.category-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
}
.category-bar::-webkit-scrollbar { display: none; }

.cat-btn {
  white-space: nowrap;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #C25A2E;
  background: #FFF1E8;
  border: none;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.cat-btn.active {
  color: #fff;
  background: #FF6A3D;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255,106,61,.32);
}

/* 1위 카드 */
.top-card {
  margin: 4px 16px 16px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid #F1E4D8;
  box-shadow: 0 8px 24px rgba(120,60,20,.08);
  position: relative;
}

.top-rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  background: rgba(31,20,14,.55);
  backdrop-filter: blur(8px);
  padding: 5px 12px;
  border-radius: 999px;
}

.top-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
}

.top-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.top-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31,20,14,.65) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

.top-dish {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.top-likes {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-top: 4px;
}

.top-info {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}

.top-name {
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
}

.top-handle {
  font-size: 12px;
  color: #9a8579;
}

.top-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #C25A2E;
  font-weight: 600;
}

.top-location .area {
  color: #9a8579;
  font-weight: 400;
}

/* 2위~ 리스트 */
.ranking-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #F1E4D8;
  border-radius: 16px;
  padding: 12px;
}

.rank-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.rank-num:not(.rank-2):not(.rank-3) {
  font-family: 'Baloo 2', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #9a8579;
  background: #F4ECE4;
  border-radius: 50%;
}

.rank-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.rank-dish {
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
}

.rank-place {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #C25A2E;
  font-weight: 600;
}

.rank-user {
  font-size: 11px;
  color: #9a8579;
}

.rank-likes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.rank-likes span {
  font-family: 'Baloo 2', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #F4442E;
}
</style>
