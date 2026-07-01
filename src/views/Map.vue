<template>
  <div class="map-page">

    <!-- 헤더 -->
    <header class="header">
      <div class="header-logo">sizzle</div>
      <span class="header-title">맛집 지도</span>
      <div style="width:60px"></div>
    </header>

    <!-- 검색바 -->
    <div class="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a8579" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input v-model="searchQuery" placeholder="레스토랑 또는 지역 검색" class="search-input" />
    </div>

    <!-- 카카오맵 -->
    <div class="map-wrap">
      <div id="kakao-map" ref="mapEl"></div>

      <!-- API 키 미설정 시 안내 -->
      <div v-if="!mapReady" class="map-placeholder">
        <div class="map-placeholder-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
          </svg>
          <p class="placeholder-title">카카오맵 연동 예정</p>
          <p class="placeholder-desc">Kakao Maps API 키를<br>설정하면 지도가 표시됩니다.</p>
        </div>
      </div>
    </div>

    <!-- 레스토랑 리스트 -->
    <div class="restaurant-list">
      <div class="list-header">
        <span class="list-title">근처 맛집</span>
        <span class="list-count">{{ filteredRestaurants.length }}곳</span>
      </div>

      <div
        v-for="(item, i) in filteredRestaurants"
        :key="i"
        class="restaurant-card"
        :class="{ selected: selectedIndex === i }"
        @click="selectedIndex = i"
      >
        <div class="restaurant-thumb">
          <img :src="item.imgUrl || item.img" :alt="item.dish" />
          <div class="restaurant-cat">{{ item.cat }}</div>
        </div>
        <div class="restaurant-info">
          <div class="restaurant-name">{{ item.restaurant }}</div>
          <div class="restaurant-area">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
            </svg>
            {{ item.area }}
          </div>
          <div class="restaurant-dish">{{ item.dish }}</div>
          <div class="restaurant-likes">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#F4442E" stroke="#F4442E" stroke-width="1.5" stroke-linejoin="round">
              <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
            <span>{{ (item.likedBy?.length ?? item.likes ?? 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <BottomNav active="map" />
  </div>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

const SAMPLE_PLACES = [
  { id: 's1',  restaurant: '멘야하나비 을지로',  dish: '마제소바',           cat: '일식',       area: '을지로3가', lat: 37.5662, lng: 126.9937, imgUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200', likedBy: [] },
  { id: 's2',  restaurant: '버터레코드 연남',    dish: '리코타 팬케이크',    cat: '카페·디저트', area: '연남동',    lat: 37.5585, lng: 126.9267, imgUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200', likedBy: [] },
  { id: 's3',  restaurant: '부처스컷 한남',      dish: '드라이에이징 스테이크', cat: '양식',    area: '한남동',    lat: 37.5349, lng: 126.9995, imgUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=200', likedBy: [] },
  { id: 's4',  restaurant: '광장시장 순희네',    dish: '마약김밥',           cat: '한식',       area: '종로4가',   lat: 37.5699, lng: 126.9997, imgUrl: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=200', likedBy: [] },
  { id: 's5',  restaurant: '스시 사이토',        dish: '오마카세',           cat: '일식',       area: '청담동',    lat: 37.5246, lng: 127.0481, imgUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200', likedBy: [] },
  { id: 's6',  restaurant: '온지음 맛 공부',     dish: '한정식 코스',        cat: '한식',       area: '익선동',    lat: 37.5744, lng: 126.9972, imgUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200', likedBy: [] },
  { id: 's7',  restaurant: '망원동 육회자매',    dish: '육회비빔밥',         cat: '한식',       area: '망원동',    lat: 37.5554, lng: 126.9026, imgUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=200', likedBy: [] },
  { id: 's8',  restaurant: '카페 어니언 성수',   dish: '앙버터',             cat: '카페·디저트', area: '성수동',    lat: 37.5444, lng: 127.0557, imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200', likedBy: [] },
  { id: 's9',  restaurant: '라멘 이치란 홍대',   dish: '시오라멘',           cat: '일식',       area: '홍대',      lat: 37.5572, lng: 126.9248, imgUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200', likedBy: [] },
  { id: 's10', restaurant: '떡볶이 신당동 마복림', dish: '즉석 떡볶이',      cat: '분식',       area: '신당동',    lat: 37.5635, lng: 127.0199, imgUrl: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200', likedBy: [] },
  { id: 's11', restaurant: '파스타 아이 이태원', dish: '까르보나라',         cat: '양식',       area: '이태원',    lat: 37.5340, lng: 126.9940, imgUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=200', likedBy: [] },
  { id: 's12', restaurant: '압구정 로데오 수제버거', dish: '스모키 바베큐 버거', cat: '양식',   area: '압구정',    lat: 37.5271, lng: 127.0391, imgUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200', likedBy: [] },
  { id: 's13', restaurant: '삼청동 수제비',      dish: '감자수제비',         cat: '한식',       area: '삼청동',    lat: 37.5822, lng: 126.9808, imgUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200', likedBy: [] },
  { id: 's14', restaurant: '연트럴파크 브런치',  dish: '에그베네딕트',       cat: '카페·디저트', area: '연남동',    lat: 37.5610, lng: 126.9230, imgUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200', likedBy: [] },
  { id: 's15', restaurant: '을지로 노가리골목',  dish: '노가리 안주',        cat: '한식',       area: '을지로4가', lat: 37.5668, lng: 126.9968, imgUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200', likedBy: [] },
]

export default {
  name: 'MapPage',
  components: { BottomNav },
  data() {
    return {
      searchQuery: '',
      selectedIndex: null,
      mapReady: false,
      posts: [],
      unsubscribe: null,
    }
  },
  computed: {
    allPlaces() {
      const firestoreIds = new Set(this.posts.map(p => p.restaurant).filter(Boolean))
      const samples = SAMPLE_PLACES.filter(s => !firestoreIds.has(s.restaurant))
      return [...this.posts, ...samples]
    },
    filteredRestaurants() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return this.allPlaces
      return this.allPlaces.filter(p =>
        p.restaurant?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.cat?.toLowerCase().includes(q)
      )
    },
  },
  mounted() {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    this.unsubscribe = onSnapshot(q, (snap) => {
      this.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (this.mapReady) this.refreshMarkers()
    })

    const load = () => {
      if (typeof window.kakao !== 'undefined') {
        window.kakao.maps.load(() => this.initMap())
      } else {
        setTimeout(load, 300)
      }
    }
    load()
  },
  beforeUnmount() {
    this.unsubscribe?.()
  },
  methods: {
    initMap() {
      this.mapReady = true
      const container = this.$refs.mapEl
      const options = {
        center: new window.kakao.maps.LatLng(37.5500, 126.9800),
        level: 7,
      }
      this.map = new window.kakao.maps.Map(container, options)
      this.markers = []
      this.refreshMarkers()
    },
    refreshMarkers() {
      if (!this.map) return
      this.markers?.forEach(m => m.setMap(null))
      this.markers = []

      this.allPlaces.forEach(post => {
        if (!post.lat || !post.lng) return

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(post.lat, post.lng),
          map: this.map,
        })

        const infoContent = `
          <div style="padding:10px 14px;font-family:Pretendard,sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:14px;color:#241a14;">${post.restaurant || post.dish}</div>
            <div style="font-size:12px;color:#C25A2E;margin-top:2px;">${post.dish} · ${post.cat}</div>
          </div>
        `
        const infoWindow = new window.kakao.maps.InfoWindow({ content: infoContent })
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker)
        })
        this.markers.push(marker)
      })
    },
  },
}
</script>

<style scoped>
.map-page {
  min-height: 100vh;
  background: #FFFDFB;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  background: #FFFDFB;
  border-bottom: 1px solid #F4ECE4;
}

.header-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -0.5px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #241a14;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 16px;
  background: #FFF6EF;
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  padding: 0 16px;
  height: 46px;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 14px;
  color: #241a14;
  outline: none;
}

.search-input::placeholder {
  color: #c0a898;
}

/* 지도 */
.map-wrap {
  position: relative;
  height: 240px;
  background: #F4ECE4;
  margin: 0 16px;
  border-radius: 18px;
  overflow: hidden;
}

#kakao-map {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF6EF;
}

.map-placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-title {
  font-size: 15px;
  font-weight: 700;
  color: #241a14;
}

.placeholder-desc {
  font-size: 13px;
  color: #9a8579;
  text-align: center;
  line-height: 1.6;
}

/* 레스토랑 리스트 */
.restaurant-list {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 90px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.list-title {
  font-size: 16px;
  font-weight: 800;
  color: #241a14;
}

.list-count {
  font-size: 13px;
  color: #9a8579;
}

.restaurant-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #F1E4D8;
  cursor: pointer;
  transition: border-color 0.15s;
}

.restaurant-card.selected {
  border-color: #FF6A3D;
}

.restaurant-thumb {
  position: relative;
  width: 90px;
  flex-shrink: 0;
}

.restaurant-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.restaurant-cat {
  position: absolute;
  bottom: 6px;
  left: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: rgba(31,20,14,0.55);
  backdrop-filter: blur(4px);
  padding: 3px 7px;
  border-radius: 999px;
}

.restaurant-info {
  padding: 12px 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.restaurant-name {
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
}

.restaurant-area {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #C25A2E;
  font-weight: 600;
}

.restaurant-dish {
  font-size: 12px;
  color: #9a8579;
}

.restaurant-palette {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.restaurant-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #F4442E;
  margin-top: 4px;
}
</style>
