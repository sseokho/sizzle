<template>
  <nav class="bottom-nav">
    <button class="nav-btn" :class="{ active: active === 'home' }" @click="$router.push('/home')">
      <svg width="26" height="26" viewBox="0 0 24 24" :fill="active === 'home' ? '#FF6A3D' : 'none'" :stroke="active === 'home' ? '#FF6A3D' : '#C7B4A6'" stroke-width="1.6" stroke-linejoin="round">
        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
      </svg>
    </button>

    <button class="nav-btn" :class="{ active: active === 'map' }" @click="$router.push('/map')">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" :stroke="active === 'map' ? '#FF6A3D' : '#C7B4A6'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
      </svg>
    </button>

    <button class="nav-btn nav-plus" @click="goUpload">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <button class="nav-btn" :class="{ active: active === 'explore' }" @click="$router.push('/explore')">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" :stroke="active === 'explore' ? '#FF6A3D' : '#C7B4A6'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M16 8l-2.4 5.6L8 16l2.4-5.6z"/>
      </svg>
    </button>

    <!-- 프로필: 로그인 여부에 따라 다르게 표시 -->
    <button class="nav-btn profile-btn" :class="{ active: active === 'profile' }" @click="goProfile">
      <!-- 로그인됨: 이니셜 아바타 -->
      <div v-if="isLoggedIn" class="profile-avatar" :class="{ 'avatar-active': active === 'profile' }">
        {{ userInitial }}
      </div>
      <!-- 비로그인: 아웃라인 아이콘 + 점 -->
      <div v-else class="profile-guest">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C7B4A6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>
        </svg>
        <span class="login-dot"></span>
      </div>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'BottomNav',
  props: {
    active: {
      type: String,
      default: 'home',
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn
    },
    userInitial() {
      const user = this.$store.state.currentUser
      if (!user) return '?'
      const name = user.nickname || user.email || ''
      return name[0].toUpperCase()
    },
  },
  methods: {
    goProfile() {
      if (this.$store.state.isLoggedIn) {
        this.$router.push('/profile')
      } else {
        this.$router.push('/login')
      }
    },
    goUpload() {
      if (this.$store.state.isLoggedIn) {
        this.$router.push('/upload')
      } else {
        this.$router.push('/login')
      }
    },
  },
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 11px 0 max(20px, env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #F1E4D8;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #C7B4A6;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-plus {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FF7A45, #F4442E);
  box-shadow: 0 8px 18px rgba(244, 68, 46, 0.34);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* 프로필 버튼 */
.profile-btn { position: relative; }

/* 로그인됨: 이니셜 아바타 */
.profile-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #FFF1E8;
  border: 2px solid #F1E4D8;
  color: #C25A2E;
  font-family: 'Baloo 2', sans-serif;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background 0.15s;
}

.profile-avatar.avatar-active {
  background: linear-gradient(135deg, #FF7A45, #F4442E);
  border-color: #FF6A3D;
  color: #fff;
  box-shadow: 0 4px 10px rgba(244, 68, 46, 0.3);
}

/* 비로그인: 아이콘 + 빨간 점 */
.profile-guest {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-dot {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  background: #F4442E;
  border-radius: 50%;
  border: 1.5px solid #fff;
}
</style>
