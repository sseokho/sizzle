<template>
  <div class="login-page">

    <!-- 상단 브랜드 영역 -->
    <div class="brand-area">
      <div class="brand-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
      <h1 class="brand-logo">sizzle</h1>
      <p class="brand-tagline">맛있는 순간을 공유하세요</p>
    </div>

    <!-- 폼 -->
    <div class="form-area">
      <div class="input-group">
        <input
          v-model="email"
          type="email"
          placeholder="이메일"
          class="input-field"
          :class="{ 'input-error': errorMsg }"
        />
        <input
          v-model="password"
          type="password"
          placeholder="비밀번호"
          class="input-field"
          :class="{ 'input-error': errorMsg }"
          @keyup.enter="login"
        />
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </div>

      <button class="btn-primary" @click="login" :disabled="loading">
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else>로그인</span>
      </button>

      <p class="signup-link">
        계정이 없으신가요?
        <button class="link-btn" @click="$router.push('/signup')">회원가입</button>
      </p>
      <p class="back-link">
        <button class="link-btn" @click="$router.push('/home')">← 로그인 없이 둘러보기</button>
      </p>
    </div>

  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const ERROR_MESSAGES = {
  'auth/invalid-credential':   '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/invalid-email':        '유효하지 않은 이메일 형식입니다.',
  'auth/user-not-found':       '등록되지 않은 이메일입니다.',
  'auth/wrong-password':       '비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests':    '잠시 후 다시 시도해 주세요.',
}

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: '',
      loading: false,
    }
  },
  methods: {
    async login() {
      this.errorMsg = ''
      if (!this.email || !this.password) {
        this.errorMsg = '이메일과 비밀번호를 입력해 주세요.'
        return
      }
      this.loading = true
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push('/profile')
      } catch (e) {
        this.errorMsg = ERROR_MESSAGES[e.code] || '로그인에 실패했습니다. 다시 시도해 주세요.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #FFFDFB;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 브랜드 영역 */
.brand-area {
  width: 100%;
  background: #E8451F;
  padding: 64px 32px 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.brand-circles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
}

.c1 {
  width: 280px;
  height: 280px;
  background: #FFB627;
  top: -80px;
  right: -60px;
}

.c2 {
  width: 180px;
  height: 180px;
  background: #FFF1E8;
  bottom: -60px;
  left: -40px;
}

.c3 {
  width: 100px;
  height: 100px;
  background: #FF6A3D;
  top: 20px;
  left: 40px;
  opacity: 0.3;
}

.brand-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 60px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -2px;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.brand-tagline {
  font-size: 15px;
  color: rgba(255,255,255,0.82);
  margin-top: 10px;
  position: relative;
  z-index: 1;
}

/* 폼 영역 */
.form-area {
  width: 100%;
  padding: 36px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-field {
  height: 52px;
  border: 1.5px solid #F1E4D8;
  border-radius: 14px;
  padding: 0 18px;
  font-family: inherit;
  font-size: 15px;
  color: #241a14;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.input-field::placeholder {
  color: #c0a898;
}

.input-field:focus {
  border-color: #FF6A3D;
}

.input-error {
  border-color: #F4442E;
}

.error-msg {
  font-size: 13px;
  color: #F4442E;
  padding-left: 4px;
}

.btn-primary {
  height: 52px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #FF7A45, #F4442E);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(244, 68, 46, 0.3);
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


.signup-link {
  text-align: center;
  font-size: 14px;
  color: #9a8579;
  margin-top: 4px;
}

.back-link {
  text-align: center;
  font-size: 13px;
  color: #c0a898;
  margin-top: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #E8451F;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}
</style>
