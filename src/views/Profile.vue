<template>
  <div class="profile-page">

    <!-- 헤더 -->
    <header class="header">
      <div class="header-logo">sizzle</div>
      <button class="icon-btn" @click="logout">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>

    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="avatar-wrap">
        <div class="avatar">{{ user?.nickname?.[0] ?? '?' }}</div>
        <button class="avatar-edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
          </svg>
        </button>
      </div>

      <div class="profile-name">{{ user?.nickname }}</div>
      <div class="profile-handle">{{ user?.email }}</div>
      <div class="profile-bio">맛있는 순간을 기록합니다 🍜 서울 · 맛집 탐험가</div>

      <!-- 통계 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-num">{{ posts.length }}</span>
          <span class="stat-label">게시물</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ followersCount }}</span>
          <span class="stat-label">팔로워</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ followingCount }}</span>
          <span class="stat-label">팔로잉</span>
        </div>
      </div>

      <button class="edit-profile-btn">프로필 편집</button>
    </div>

    <!-- 탭 바 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">🍽 게시물</button>
      <button class="tab-btn" :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">🔖 저장됨</button>
    </div>

    <!-- 게시물 그리드 -->
    <div class="post-grid">
      <template v-if="activeTab === 'posts'">
        <div v-for="(post, i) in posts" :key="'p'+i" class="grid-item">
          <img :src="post.imgUrl" :alt="post.dish" />
          <div class="grid-overlay">
            <span class="grid-dish">{{ post.dish }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="savedPosts.length === 0" class="saved-empty">
          <span>저장한 게시물이 없어요</span>
        </div>
        <div v-for="(post, i) in savedPosts" :key="'s'+i" class="grid-item">
          <img :src="post.imgUrl" :alt="post.dish" />
          <div class="grid-overlay">
            <span class="grid-dish">{{ post.dish }}</span>
          </div>
        </div>
      </template>
    </div>

    <BottomNav active="profile" />
  </div>
</template>

<script>
import { signOut } from 'firebase/auth'
import { doc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'ProfilePage',
  components: { BottomNav },
  data() {
    return {
      posts: [],
      savedPosts: [],
      profileData: null,
      unsubProfile: null,
      unsubPosts: null,
      unsubSaved: null,
      activeTab: 'posts',
    }
  },
  computed: {
    user() {
      return this.$store.state.currentUser
    },
    followersCount() {
      return this.profileData?.followers?.length ?? 0
    },
    followingCount() {
      return this.profileData?.following?.length ?? 0
    },
  },
  mounted() {
    const uid = this.$store.state.currentUser?.uid
    if (!uid) return

    // 프로필 실시간
    this.unsubProfile = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) this.profileData = snap.data()
    })

    // 내 게시물
    const myPostsQ = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
    this.unsubPosts = onSnapshot(myPostsQ, (snap) => {
      this.posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })

    // 저장한 게시물
    const savedQ = query(collection(db, 'posts'), where('savedBy', 'array-contains', uid))
    this.unsubSaved = onSnapshot(savedQ, (snap) => {
      this.savedPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  },
  beforeUnmount() {
    this.unsubProfile?.()
    this.unsubPosts?.()
    this.unsubSaved?.()
  },
  methods: {
    async logout() {
      await signOut(auth)
      this.$store.commit('logout')
      this.$router.push('/home')
    },
  },
}
</script>

<style scoped>
.profile-page {
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
  position: relative;
}

.header-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -0.5px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #241a14;
  padding: 0;
  display: flex;
}

.settings-dropdown {
  position: absolute;
  top: 100%;
  right: 16px;
  background: #fff;
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(120,60,20,.12);
  z-index: 200;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #F4442E;
  cursor: pointer;
  white-space: nowrap;
}

/* 프로필 섹션 */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px 20px;
  gap: 8px;
}

.avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7A45, #F4442E);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Baloo 2', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 8px 20px rgba(244, 68, 46, 0.3);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #241a14;
  border: 2px solid #FFFDFB;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  font-size: 18px;
  font-weight: 800;
  color: #241a14;
  margin-top: 4px;
}

.profile-handle {
  font-size: 14px;
  color: #9a8579;
}

.profile-bio {
  font-size: 13px;
  color: #6f5e54;
  text-align: center;
  line-height: 1.6;
}

/* 통계 */
.stats-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: #FFF6EF;
  border: 1px solid #F1E4D8;
  border-radius: 16px;
  padding: 14px 0;
  width: 100%;
  margin-top: 8px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-family: 'Baloo 2', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #E8451F;
}

.stat-label {
  font-size: 11px;
  color: #9a8579;
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #F1E4D8;
}

.edit-profile-btn {
  width: 100%;
  height: 44px;
  border: 1.5px solid #F1E4D8;
  border-radius: 12px;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
  cursor: pointer;
  transition: border-color 0.15s;
}

.edit-profile-btn:hover {
  border-color: #FF6A3D;
}

/* 탭 바 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #F1E4D8;
}

.tab-btn {
  flex: 1;
  height: 44px;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #9a8579;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn.active {
  color: #E8451F;
  border-bottom-color: #E8451F;
}

.saved-empty {
  grid-column: 1 / -1;
  padding: 60px 20px;
  text-align: center;
  font-size: 14px;
  color: #c0a898;
}

/* 게시물 그리드 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding-bottom: 80px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.grid-item:hover img {
  transform: scale(1.04);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31,20,14,0.55) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-item:hover .grid-overlay {
  opacity: 1;
}

.grid-dish {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.grid-palette {
  display: flex;
  gap: 3px;
  margin-top: 4px;
}

.grid-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

/* 색감 분석 탭 */
.palette-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px;
}

.palette-row {
  display: flex;
  gap: 14px;
  background: #fff;
  border: 1.5px solid #F1E4D8;
  border-radius: 16px;
  overflow: hidden;
}

.palette-thumb {
  width: 90px;
  height: 90px;
  object-fit: cover;
  flex-shrink: 0;
}

.palette-detail {
  padding: 12px 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.palette-restaurant {
  font-size: 13px;
  font-weight: 700;
  color: #241a14;
}

.palette-dish-name {
  font-size: 12px;
  color: #9a8579;
}

.palette-chips {
  display: flex;
  gap: 5px;
}

.palette-chip {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.07);
}

.appetite-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.appetite-bar-bg {
  flex: 1;
  height: 6px;
  background: #F4ECE4;
  border-radius: 999px;
  overflow: hidden;
}

.appetite-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFB627, #FF6A3D, #F4442E);
  border-radius: 999px;
}

.appetite-num {
  font-size: 12px;
  font-weight: 800;
  color: #E8451F;
}
</style>
