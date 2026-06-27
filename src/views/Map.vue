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
          <img :src="item.img" :alt="item.dish" />
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
            <span>{{ item.likes.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <BottomNav active="map" />
  </div>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import postdata from '@/assets/postdata.js'

// 서울 주요 지역 좌표 (geocoding 대신 hardcode)
const COORDS = {
  '멘야하나비 을지로': { lat: 37.5662, lng: 126.9937 },
  '버터레코드 연남':   { lat: 37.5585, lng: 126.9267 },
  '부처스컷 한남':     { lat: 37.5349, lng: 126.9995 },
}

export default {
  name: 'MapPage',
  components: { BottomNav },
  data() {
    return {
      searchQuery: '',
      selectedIndex: null,
      mapReady: false,
    }
  },
  computed: {
    filteredRestaurants() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return postdata
      return postdata.filter(p =>
        p.restaurant.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q)
      )
    },
  },
  mounted() {
    const load = () => {
      if (typeof window.kakao !== 'undefined') {
        window.kakao.maps.load(() => this.initMap())
      } else {
        setTimeout(load, 300)
      }
    }
    load()
  },
  methods: {
    initMap() {
      this.mapReady = true
      const container = this.$refs.mapEl
      const options = {
        center: new window.kakao.maps.LatLng(37.5500, 126.9800),
        level: 5,
      }
      const map = new window.kakao.maps.Map(container, options)

      postdata.forEach(post => {
        const coords = COORDS[post.restaurant]
        if (!coords) return

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
          map,
        })

        const infoContent = `
          <div style="padding:10px 14px;font-family:Pretendard,sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:14px;color:#241a14;">${post.restaurant}</div>
            <div style="font-size:12px;color:#C25A2E;margin-top:2px;">${post.dish} · ${post.cat}</div>
          </div>
        `
        const infoWindow = new window.kakao.maps.InfoWindow({ content: infoContent })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker)
        })
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
