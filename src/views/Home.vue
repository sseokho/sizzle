<template>
  <div class="home-page">
    <!-- 상단 헤더 -->
    <header class="header">
      <div class="header-logo" :class="{ hidden: showSearch }">Sizzle</div>

      <!-- 검색창 (확장) -->
      <transition name="search-slide">
        <div v-if="showSearch" class="search-bar-wrap">
          <svg class="search-icon-inner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C25A2E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="요리명, 레스토랑, 지역 검색"
            @keyup.esc="closeSearch"
          />
        </div>
      </transition>

      <div class="header-icons">
        <button class="icon-btn" @click="toggleSearch">
          <svg v-if="!showSearch" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- 검색 결과 배지 -->
    <div v-if="searchQuery" class="search-result-bar">
      <span class="search-keyword">"{{ searchQuery }}"</span>
      <span class="search-count">{{ filteredPosts.length }}개</span>
    </div>

    <!-- 카테고리 필터 -->
    <div v-if="!searchQuery" class="category-bar">
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

    <!-- 피드 -->
    <main class="feed">
      <div v-if="filteredPosts.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F1E4D8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p class="empty-text">검색 결과가 없어요</p>
        <p class="empty-sub">다른 키워드로 검색해보세요</p>
      </div>
      <FeedPost
        v-else
        v-for="(post, i) in filteredPosts"
        :key="post.id || i"
        :post="post"
      />
    </main>

    <BottomNav active="home" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import FeedPost from '@/components/FeedPost.vue'
import BottomNav from '@/components/BottomNav.vue'

const posts          = ref([])
const activeCategory = ref('all')
const showSearch     = ref(false)
const searchQuery    = ref('')
const searchInput    = ref(null)

const categories = [
  { id: 'all',        label: '전체' },
  { id: '한식',       label: '🍚 한식' },
  { id: '일식',       label: '🍣 일식' },
  { id: '양식',       label: '🍝 양식' },
  { id: '카페·디저트', label: '☕ 카페·디저트' },
  { id: '분식',       label: '🍢 분식' },
]

const filteredPosts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    return posts.value.filter(p =>
      p.dish?.toLowerCase().includes(q) ||
      p.area?.toLowerCase().includes(q) ||
      p.tags?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q)
    )
  }
  if (activeCategory.value !== 'all') {
    return posts.value.filter(p => p.cat === activeCategory.value)
  }
  return posts.value
})

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    nextTick(() => searchInput.value?.focus())
  } else {
    searchQuery.value = ''
  }
}

function closeSearch() {
  searchQuery.value = ''
  showSearch.value = false
}

let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  unsubscribe = onSnapshot(q, (snap) => {
    posts.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, (err) => {
    console.error('[Firestore 오류]', err.code, err.message)
  })
})

onBeforeUnmount(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.home-page {
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
  padding: 0 16px;
  height: 62px;
  background: #FFFDFB;
  border-bottom: 1px solid #F4ECE4;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 10px;
}

.header-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -0.5px;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.header-logo.hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.header-icons {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #241a14;
  padding: 4px;
  display: flex;
  align-items: center;
}

/* 검색창 */
.search-bar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFF6EF;
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  padding: 0 12px;
  height: 42px;
}

.search-icon-inner {
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 15px;
  color: #241a14;
  outline: none;
  min-width: 0;
}

.search-input::placeholder {
  color: #c0a898;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 검색 슬라이드 트랜지션 */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: opacity 0.18s, transform 0.18s;
}

.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* 검색 결과 배지 */
.search-result-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #FFF6EF;
  border-bottom: 1px solid #F4ECE4;
}

.search-keyword {
  font-size: 13px;
  font-weight: 700;
  color: #E8451F;
}

.search-count {
  font-size: 13px;
  color: #9a8579;
}

/* 카테고리 필터 */
.category-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #F4ECE4;
}

.category-bar::-webkit-scrollbar { display: none; }

.cat-btn {
  flex-shrink: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #9a8579;
  background: #F4ECE4;
  border: none;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.cat-btn.active {
  color: #fff;
  background: #E8451F;
  box-shadow: 0 4px 10px rgba(232,69,31,.25);
}

/* 피드 */
.feed {
  flex: 1;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px 20px;
}

.empty-text {
  font-size: 16px;
  font-weight: 700;
  color: #9a8579;
}

.empty-sub {
  font-size: 13px;
  color: #c0a898;
}
</style>
