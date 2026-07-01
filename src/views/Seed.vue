<template>
  <div class="seed-page">
    <h2>예시 데이터 업로드</h2>
    <p>버튼을 누르면 Firestore에 샘플 포스트 {{ SEED_POSTS.length }}개가 추가됩니다.</p>
    <button class="seed-btn" @click="seed" :disabled="loading">
      {{ loading ? `업로드 중... (${done}/${SEED_POSTS.length})` : '업로드 시작' }}
    </button>
    <p v-if="done === SEED_POSTS.length && !loading" class="done-msg">완료! /home 으로 이동하세요.</p>
  </div>
</template>

<script>
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

const SEED_POSTS = [
  { name: '김민준', handle: '@minjun_eats', initials: '김', avBg: '#FFD8A8', avFg: '#B5642E', area: '을지로3가', restaurant: '멘야하나비 을지로', dish: '마제소바', cat: '일식', caption: '진한 타레와 면발의 조화가 최고. 줄 서서 먹을 가치 있음', tags: '#을지로맛집 #마제소바 #일식', imgUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600', lat: 37.5662, lng: 126.9937 },
  { name: '이서연', handle: '@seoyeon_food', initials: '이', avBg: '#D8F0FF', avFg: '#2E6EB5', area: '연남동', restaurant: '버터레코드 연남', dish: '리코타 팬케이크', cat: '카페·디저트', caption: '촉촉하고 폭신한 팬케이크. 커피랑 같이 먹으면 완벽한 브런치', tags: '#연남동카페 #브런치 #팬케이크', imgUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', lat: 37.5585, lng: 126.9267 },
  { name: '박지훈', handle: '@jihoon_grill', initials: '박', avBg: '#FFE8D8', avFg: '#B55A2E', area: '한남동', restaurant: '부처스컷 한남', dish: '드라이에이징 스테이크', cat: '양식', caption: '28일 숙성 채끝. 잡내 없이 깊은 풍미. 소금만으로도 충분', tags: '#한남동맛집 #스테이크 #양식', imgUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600', lat: 37.5349, lng: 126.9995 },
  { name: '최유나', handle: '@yuna_street', initials: '최', avBg: '#D8FFE8', avFg: '#2EB56E', area: '종로4가', restaurant: '광장시장 순희네', dish: '마약김밥', cat: '한식', caption: '겨자소스에 찍어먹는 순간 중독됨. 1줄은 절대 안 됨', tags: '#광장시장 #마약김밥 #분식', imgUrl: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600', lat: 37.5699, lng: 126.9997 },
  { name: '정태양', handle: '@taeyang_omakase', initials: '정', avBg: '#F5D8FF', avFg: '#7B2EB5', area: '청담동', restaurant: '스시 사이토', dish: '오마카세', cat: '일식', caption: '코스 내내 제철 재료만. 군더더기 없는 담백한 맛', tags: '#청담동 #오마카세 #스시', imgUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600', lat: 37.5246, lng: 127.0481 },
  { name: '한소희', handle: '@sohee_익선', initials: '한', avBg: '#FFF8D8', avFg: '#B5942E', area: '익선동', restaurant: '온지음 맛 공부', dish: '한정식 코스', cat: '한식', caption: '전통 한식의 정수. 계절 찬이 매번 달라서 올 때마다 새로움', tags: '#익선동 #한정식 #전통', imgUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600', lat: 37.5744, lng: 126.9972 },
  { name: '윤대현', handle: '@daehyun_meat', initials: '윤', avBg: '#FFD8D8', avFg: '#B52E2E', area: '망원동', restaurant: '망원동 육회자매', dish: '육회비빔밥', cat: '한식', caption: '참기름 두른 육회가 밥이랑 비벼지는 순간 행복. 마망 필수', tags: '#망원동 #육회 #비빔밥', imgUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600', lat: 37.5554, lng: 126.9026 },
  { name: '임채원', handle: '@chaewon_cafe', initials: '임', avBg: '#D8EEFF', avFg: '#2E7AB5', area: '성수동', restaurant: '카페 어니언 성수', dish: '앙버터', cat: '카페·디저트', caption: '폭신한 소금빵에 팥앙금과 버터. 줄 서는 이유가 있음', tags: '#성수동카페 #앙버터 #어니언', imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600', lat: 37.5444, lng: 127.0557 },
  { name: '강민서', handle: '@minseo_ramen', initials: '강', avBg: '#FFECD8', avFg: '#B5762E', area: '홍대', restaurant: '라멘 이치란 홍대', dish: '시오라멘', cat: '일식', caption: '은은한 소금 육수에 탱탱한 면. 혼자 먹기 딱 좋은 분위기', tags: '#홍대맛집 #라멘 #이치란', imgUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', lat: 37.5572, lng: 126.9248 },
  { name: '오지은', handle: '@jieun_spicy', initials: '오', avBg: '#FFD8F0', avFg: '#B52E8A', area: '신당동', restaurant: '떡볶이 신당동 마복림', dish: '즉석 떡볶이', cat: '분식', caption: '50년 전통의 달달하고 매운 그 맛. 어묵이랑 같이 먹어야 함', tags: '#신당동떡볶이 #분식 #마복림', imgUrl: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600', lat: 37.5635, lng: 127.0199 },
  { name: '신준호', handle: '@junho_pasta', initials: '신', avBg: '#D8FFD8', avFg: '#2EB52E', area: '이태원', restaurant: '파스타 아이 이태원', dish: '까르보나라', caption: '크림 없이 달걀노른자만으로 만드는 정통 까르보나라. 면에 소스가 착착', cat: '양식', tags: '#이태원맛집 #파스타 #까르보나라', imgUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600', lat: 37.5340, lng: 126.9940 },
  { name: '백나은', handle: '@naeun_burger', initials: '백', avBg: '#FFE8FF', avFg: '#8A2EB5', area: '압구정', restaurant: '압구정 로데오 수제버거', dish: '스모키 바베큐 버거', cat: '양식', caption: '패티 두께가 진짜임. 훈연향 BBQ소스가 고기랑 완벽한 조합', tags: '#압구정 #수제버거 #양식', imgUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', lat: 37.5271, lng: 127.0391 },
  { name: '전현우', handle: '@hyunwoo_sujebi', initials: '전', avBg: '#D8F8FF', avFg: '#2EA8B5', area: '삼청동', restaurant: '삼청동 수제비', dish: '감자수제비', cat: '한식', caption: '구수한 멸치육수에 쫀득한 수제비. 비 오는 날 생각나는 맛', tags: '#삼청동 #수제비 #한식', imgUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600', lat: 37.5822, lng: 126.9808 },
  { name: '류하은', handle: '@haeun_brunch', initials: '류', avBg: '#FFF0D8', avFg: '#B58A2E', area: '연남동', restaurant: '연트럴파크 브런치', dish: '에그베네딕트', cat: '카페·디저트', caption: '홀란데이즈 소스가 진짜 진함. 일요일 오전에 딱 맞는 집', tags: '#연남동 #브런치 #에그베네딕트', imgUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', lat: 37.5610, lng: 126.9230 },
  { name: '조성민', handle: '@sungmin_beer', initials: '조', avBg: '#FFFFD8', avFg: '#8AB52E', area: '을지로4가', restaurant: '을지로 노가리골목', dish: '노가리 안주', cat: '한식', caption: '생맥주에 노가리. 레트로 감성 골목에서 마시는 맛이 따로 있음', tags: '#을지로 #노가리 #맥주', imgUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', lat: 37.5668, lng: 126.9968 },
]

export default {
  name: 'SeedPage',
  data() {
    return {
      loading: false,
      done: 0,
      SEED_POSTS,
    }
  },
  methods: {
    async seed() {
      this.loading = true
      this.done = 0
      for (const post of SEED_POSTS) {
        await addDoc(collection(db, 'posts'), {
          uid: 'seed',
          name: post.name,
          handle: post.handle,
          initials: post.initials,
          avBg: post.avBg,
          avFg: post.avFg,
          area: post.area,
          restaurant: post.restaurant,
          dish: post.dish,
          cat: post.cat,
          caption: post.caption,
          tags: post.tags,
          imgUrl: post.imgUrl,
          lat: post.lat,
          lng: post.lng,
          likedBy: [],
          savedBy: [],
          commentList: [],
          createdAt: serverTimestamp(),
        })
        this.done++
      }
      this.loading = false
    },
  },
}
</script>

<style scoped>
.seed-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #FFFDFB;
  font-family: inherit;
  padding: 40px;
  text-align: center;
}

h2 { font-size: 20px; font-weight: 800; color: #241a14; }
p  { font-size: 14px; color: #9a8579; }

.seed-btn {
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #E8451F;
  border: none;
  border-radius: 14px;
  padding: 14px 32px;
  cursor: pointer;
}

.seed-btn:disabled { background: #c0a898; cursor: default; }

.done-msg { color: #E8451F; font-weight: 700; font-size: 15px; }
</style>
