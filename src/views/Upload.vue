<template>
  <div class="upload-page">

    <!-- 헤더 -->
    <header class="header">
      <button class="header-btn" @click="$router.back()">취소</button>
      <span class="header-title">새 게시물</span>
      <button class="header-btn publish-btn" @click="publish" :disabled="!canPublish || loading">
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else>게시</span>
      </button>
    </header>

    <!-- 사진 선택 -->
    <div class="photo-section">
      <div v-if="!previewUrl" class="photo-placeholder" @click="triggerFileInput">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C25A2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <p class="photo-placeholder-text">사진을 선택해 주세요</p>
        <span class="photo-placeholder-sub">탭해서 업로드</span>
      </div>

      <div v-else class="photo-preview-wrap" @click="triggerFileInput">
        <img :src="previewUrl" class="photo-preview" />
        <div class="photo-change-hint">탭해서 변경</div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="file-input"
        @change="onFileChange"
      />
    </div>

    <!-- 폼 -->
    <div class="form-area">

      <!-- 요리명 -->
      <div class="field">
        <label class="field-label">요리명 <span class="required">*</span></label>
        <input
          v-model="dish"
          type="text"
          placeholder="예) 마제소바, 리코타 팬케이크"
          class="input-field"
          maxlength="30"
        />
      </div>

      <!-- 식당 검색 -->
      <div class="field">
        <label class="field-label">식당 검색</label>
        <div class="place-search-wrap">
          <input
            v-model="placeQuery"
            type="text"
            placeholder="식당 이름으로 검색"
            class="input-field"
            @input="onPlaceInput"
            @keyup.enter="searchPlace"
          />
          <button class="place-search-btn" @click="searchPlace">검색</button>
        </div>
        <div v-if="placeResults.length" class="place-results">
          <div
            v-for="p in placeResults"
            :key="p.id"
            class="place-result-item"
            @click="selectPlace(p)"
          >
            <div class="place-result-name">{{ p.place_name }}</div>
            <div class="place-result-addr">{{ p.road_address_name || p.address_name }}</div>
          </div>
        </div>
        <div v-if="selectedPlace" class="place-selected">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2.5" stroke-linecap="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          {{ selectedPlace.place_name }} · {{ area }}
        </div>
      </div>

      <!-- 카테고리 -->
      <div class="field">
        <label class="field-label">카테고리 <span class="required">*</span></label>
        <div class="cat-chips">
          <button
            v-for="cat in categories"
            :key="cat"
            class="cat-chip"
            :class="{ active: selectedCat === cat }"
            @click="selectedCat = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 한줄 설명 -->
      <div class="field">
        <label class="field-label">한줄 설명</label>
        <textarea
          v-model="caption"
          placeholder="이 음식의 맛을 한 줄로 표현해보세요"
          class="input-textarea"
          maxlength="150"
          rows="3"
        ></textarea>
        <span class="char-count">{{ caption.length }} / 150</span>
      </div>

      <!-- 해시태그 -->
      <div class="field">
        <label class="field-label">해시태그</label>
        <input
          v-model="tags"
          type="text"
          placeholder="#맛집 #추천 #점심"
          class="input-field"
          maxlength="80"
        />
      </div>

      <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    </div>
  </div>
</template>

<script>
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'UploadPage',
  data() {
    return {
      previewUrl: '',
      selectedFile: null,
      dish: '',
      area: '',
      selectedCat: '',
      caption: '',
      tags: '',
      loading: false,
      errorMsg: '',
      categories: ['한식', '일식', '양식', '카페·디저트', '분식', '기타'],
      placeQuery: '',
      placeResults: [],
      selectedPlace: null,
      lat: null,
      lng: null,
    }
  },
  computed: {
    canPublish() {
      return this.selectedFile && this.dish.trim() && this.selectedCat
    },
  },
  methods: {
    compressImage(file) {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const MAX = 600
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
          const canvas = document.createElement('canvas')
          canvas.width  = img.width  * ratio
          canvas.height = img.height * ratio
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.75))
        }
        img.src = URL.createObjectURL(file)
      })
    },
    searchPlace() {
      const ps = new window.kakao.maps.services.Places()
      ps.keywordSearch(this.placeQuery, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          this.placeResults = data.slice(0, 5)
        } else {
          this.placeResults = []
        }
      })
    },
    onPlaceInput() {
      if (!this.placeQuery.trim()) {
        this.placeResults = []
        this.selectedPlace = null
      }
    },
    selectPlace(p) {
      this.selectedPlace = p
      this.placeQuery = p.place_name
      this.placeResults = []
      this.area = p.address_name?.split(' ').slice(1, 3).join(' ') || ''
      this.lat = parseFloat(p.y)
      this.lng = parseFloat(p.x)
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.selectedFile = file
      this.previewUrl = URL.createObjectURL(file)
    },
    async publish() {
      if (!this.canPublish) return
      this.errorMsg = ''
      this.loading = true

      try {
        const user = this.$store.state.currentUser
        const imgUrl = await this.compressImage(this.selectedFile)

        await addDoc(collection(db, 'posts'), {
          uid:         user.uid,
          name:        user.nickname || user.email?.split('@')[0] || '나',
          handle:      '@' + (user.nickname || 'me'),
          initials:    (user.nickname || 'N')[0],
          avBg:        '#FFD8A8',
          avFg:        '#B5642E',
          area:        this.area.trim(),
          restaurant:  this.selectedPlace?.place_name || '',
          lat:         this.lat,
          lng:         this.lng,
          imgUrl,
          dish:        this.dish.trim(),
          cat:         this.selectedCat,
          likedBy:     [],
          savedBy:     [],
          commentList: [],
          caption:     this.caption.trim(),
          tags:        this.tags.trim(),
          createdAt:   serverTimestamp(),
        })

        this.$router.push('/home')
      } catch (e) {
        this.errorMsg = '게시 중 오류가 발생했습니다. 다시 시도해 주세요.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: #FFFDFB;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #FFFDFB;
  border-bottom: 1px solid #F4ECE4;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #241a14;
}

.header-btn {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #9a8579;
  cursor: pointer;
  padding: 4px 0;
  min-width: 40px;
}

.publish-btn {
  color: #E8451F;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.publish-btn:disabled {
  color: #c0a898;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(232,69,31,0.3);
  border-top-color: #E8451F;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 사진 */
.photo-section {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #FFF6EF;
  cursor: pointer;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.photo-placeholder-text {
  font-size: 15px;
  font-weight: 700;
  color: #C25A2E;
}

.photo-placeholder-sub {
  font-size: 12px;
  color: #c0a898;
}

.photo-preview-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-change-hint {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: rgba(31,20,14,0.5);
  backdrop-filter: blur(6px);
  padding: 5px 10px;
  border-radius: 999px;
}

.file-input { display: none; }

/* 폼 */
.form-area {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #6f5e54;
}

.required {
  color: #E8451F;
}

.input-field {
  height: 50px;
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  padding: 0 16px;
  font-family: inherit;
  font-size: 15px;
  color: #241a14;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.input-field::placeholder { color: #c0a898; }
.input-field:focus { border-color: #FF6A3D; }

.input-textarea {
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 15px;
  color: #241a14;
  background: #fff;
  outline: none;
  resize: none;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.input-textarea::placeholder { color: #c0a898; }
.input-textarea:focus { border-color: #FF6A3D; }

.char-count {
  font-size: 11px;
  color: #c0a898;
  text-align: right;
}

/* 카테고리 칩 */
.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #C25A2E;
  background: #FFF1E8;
  border: 1.5px solid transparent;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
}

.cat-chip.active {
  color: #fff;
  background: #FF6A3D;
  box-shadow: 0 4px 12px rgba(255,106,61,.3);
}

.place-search-wrap {
  display: flex;
  gap: 8px;
}

.place-search-wrap .input-field {
  flex: 1;
}

.place-search-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: #E8451F;
  border: none;
  border-radius: 14px;
  padding: 0 16px;
  cursor: pointer;
  white-space: nowrap;
}

.place-results {
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.place-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #F4ECE4;
  transition: background 0.1s;
}

.place-result-item:last-child {
  border-bottom: none;
}

.place-result-item:active {
  background: #FFF6EF;
}

.place-result-name {
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
}

.place-result-addr {
  font-size: 12px;
  color: #9a8579;
  margin-top: 2px;
}

.place-selected {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #E8451F;
  padding: 4px 2px;
}

.error-banner {
  font-size: 13px;
  color: #F4442E;
  background: #FFF1F0;
  border: 1px solid #FFD6D3;
  border-radius: 10px;
  padding: 10px 14px;
  text-align: center;
}
</style>
