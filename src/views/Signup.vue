<template>
  <div class="signup-page">

    <!-- 헤더 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/login')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <h2 class="page-title">회원가입</h2>
      <div style="width:24px"></div>
    </div>

    <!-- 로고 -->
    <div class="brand-strip">
      <span class="brand-logo">sizzle</span>
      <span class="brand-sub">새 계정 만들기</span>
    </div>

    <!-- 폼 -->
    <div class="form-area">

      <div class="field-group">
        <label class="field-label">닉네임</label>
        <input
          v-model="nickname"
          type="text"
          placeholder="사용할 닉네임"
          class="input-field"
          maxlength="20"
        />
      </div>

      <div class="field-group">
        <label class="field-label">이메일</label>
        <input
          v-model="email"
          type="email"
          placeholder="example@email.com"
          class="input-field"
          :class="{ 'input-error': emailError }"
        />
        <p v-if="emailError" class="field-error">{{ emailError }}</p>
      </div>

      <div class="field-group">
        <label class="field-label">비밀번호</label>
        <input
          v-model="password"
          type="password"
          placeholder="6자 이상"
          class="input-field"
          :class="{ 'input-error': passwordError }"
        />
        <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
      </div>

      <div class="field-group">
        <label class="field-label">비밀번호 확인</label>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="비밀번호 재입력"
          class="input-field"
          :class="{ 'input-error': confirmError }"
          @keyup.enter="signup"
        />
        <p v-if="confirmError" class="field-error">{{ confirmError }}</p>
      </div>

      <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

      <button class="btn-primary" @click="signup" :disabled="loading">
        <span v-if="loading" class="btn-spinner"></span>
        <span v-else>가입하기</span>
      </button>

      <p class="login-link">
        이미 계정이 있으신가요?
        <button class="link-btn" @click="$router.push('/login')">로그인</button>
      </p>

    </div>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

const ERROR_MESSAGES = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/invalid-email':        '유효하지 않은 이메일 형식입니다.',
  'auth/weak-password':        '비밀번호는 6자 이상이어야 합니다.',
}

export default {
  name: 'Signup',
  data() {
    return {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailError: '',
      passwordError: '',
      confirmError: '',
      errorMsg: '',
      loading: false,
    }
  },
  methods: {
    validate() {
      this.emailError = ''
      this.passwordError = ''
      this.confirmError = ''
      let valid = true

      if (!this.nickname.trim()) {
        this.errorMsg = '닉네임을 입력해 주세요.'
        valid = false
      }
      if (!this.email.includes('@')) {
        this.emailError = '올바른 이메일 형식이 아닙니다.'
        valid = false
      }
      if (this.password.length < 6) {
        this.passwordError = '비밀번호는 6자 이상이어야 합니다.'
        valid = false
      }
      if (this.password !== this.confirmPassword) {
        this.confirmError = '비밀번호가 일치하지 않습니다.'
        valid = false
      }
      return valid
    },
    async signup() {
      this.errorMsg = ''
      if (!this.validate()) return

      this.loading = true
      try {
        const { user } = await createUserWithEmailAndPassword(auth, this.email, this.password)
        await updateProfile(user, { displayName: this.nickname })
        await setDoc(doc(db, 'users', user.uid), {
          nickname:  this.nickname,
          email:     this.email,
          followers: [],
          following: [],
          createdAt: serverTimestamp(),
        })
        this.$router.push('/profile')
      } catch (e) {
        this.errorMsg = ERROR_MESSAGES[e.code] || '회원가입에 실패했습니다. 다시 시도해 주세요.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: #FFFDFB;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #F4ECE4;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #241a14;
  padding: 0;
  display: flex;
}

.page-title {
  font-family: 'Baloo 2', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #241a14;
}

/* 브랜드 스트립 */
.brand-strip {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 28px 28px 6px;
}

.brand-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -1.5px;
  line-height: 1;
}

.brand-sub {
  font-size: 15px;
  color: #9a8579;
}

/* 폼 */
.form-area {
  padding: 20px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #6f5e54;
  padding-left: 2px;
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

.field-error {
  font-size: 12px;
  color: #F4442E;
  padding-left: 4px;
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
  margin-top: 4px;
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

.login-link {
  text-align: center;
  font-size: 14px;
  color: #9a8579;
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
