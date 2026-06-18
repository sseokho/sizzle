# 🍳 Sizzle

음식 사진 기반 SNS 앱. 맛있는 순간을 기록하고 공유합니다.

## 주요 기능

- **피드** — 팔로우 기반 음식 사진 피드, 카테고리 필터, 실시간 검색
- **탐색** — 좋아요 수 기준 실시간 인기 랭킹
- **지도** — 근처 맛집 지도 (Kakao Maps 연동 예정)
- **업로드** — 음식 사진 게시물 등록
- **마이페이지** — 내 게시물 / 저장한 게시물, 팔로워·팔로잉

## 인증

- 이메일/비밀번호 회원가입·로그인 (Firebase Authentication)
- 비로그인 상태로 피드·탐색·지도 열람 가능
- 마이페이지·업로드는 로그인 필요

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Vue 3 (Composition API) |
| 라우터 | Vue Router 4 |
| 상태관리 | Vuex 4 |
| 빌드 | Vite |
| 백엔드 | Firebase Authentication, Firestore |
| 스타일 | Vanilla CSS (scoped), Baloo 2, Pretendard |

## 시작하기

```bash
npm install
npm run dev
```

## Firebase 설정

`src/firebase.js`에 Firebase 프로젝트 설정을 입력합니다.

Firestore 보안 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 프로젝트 구조

```
src/
├── views/
│   ├── Home.vue       # 피드
│   ├── Explore.vue    # 실시간 인기 랭킹
│   ├── Map.vue        # 지도
│   ├── Profile.vue    # 마이페이지
│   ├── Upload.vue     # 게시물 등록
│   ├── Login.vue      # 로그인
│   └── Signup.vue     # 회원가입
├── components/
│   ├── FeedPost.vue   # 게시물 카드
│   └── BottomNav.vue  # 하단 네비게이션
├── router/index.js
├── store.js
└── firebase.js
```
