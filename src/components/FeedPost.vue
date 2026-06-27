<template>
  <div class="post">
    <!-- 유저 헤더 -->
    <div class="post-header">
      <div class="avatar" :style="{ background: post.avBg, color: post.avFg }">
        {{ post.initials }}
      </div>
      <div class="post-info">
        <div class="post-name">{{ post.name }}</div>
        <div class="post-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8451F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>
          </svg>
          <span v-if="post.area" class="location-area">{{ post.area }}</span>
        </div>
      </div>
      <span class="cat-tag">{{ post.cat }}</span>
      <button
        v-if="post.uid && post.uid !== currentUid"
        class="follow-btn"
        :class="{ following: isFollowing }"
        @click.stop="toggleFollow"
      >{{ isFollowing ? '팔로잉' : '팔로우' }}</button>
    </div>

    <!-- 음식 사진 -->
    <div class="post-image-wrap">
      <img :src="post.imgUrl" :alt="post.dish" class="post-image" />
      <div class="dish-label">{{ post.dish }}</div>
    </div>

    <!-- 액션 버튼 -->
    <div class="post-actions">
      <button class="action-btn" @click="toggleLike">
        <svg width="25" height="25" viewBox="0 0 24 24"
          :fill="isLiked ? '#F4442E' : 'none'"
          :stroke="isLiked ? '#F4442E' : '#241a14'"
          stroke-width="1.8" stroke-linejoin="round">
          <path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
        </svg>
      </button>
      <button class="action-btn" @click="showComments = !showComments">
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#241a14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z"/>
        </svg>
      </button>
      <button class="action-btn" @click="sharePost">
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#241a14" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>
        </svg>
      </button>
      <span class="spacer"></span>
      <button class="action-btn" @click="toggleSave">
        <svg width="25" height="25" viewBox="0 0 24 24"
          :fill="isSaved ? '#E8451F' : 'none'"
          :stroke="isSaved ? '#E8451F' : '#241a14'"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>

    <!-- 본문 -->
    <div class="post-body">
      <div class="likes-count">좋아요 {{ likesCount.toLocaleString() }}개</div>
      <div class="caption">
        <b>{{ post.handle }}</b> {{ post.caption }}
      </div>
      <div class="tags">{{ post.tags }}</div>
      <div
        v-if="commentCount > 0 && !showComments"
        class="comments-link"
        @click="showComments = true"
      >댓글 {{ commentCount }}개 모두 보기</div>
    </div>

    <!-- 댓글 패널 -->
    <transition name="comment-slide">
      <div v-if="showComments" class="comment-panel">
        <div v-for="(c, i) in post.commentList" :key="i" class="comment-item">
          <div class="comment-main">
            <template v-if="editingIndex === i">
              <input
                v-model="editInput"
                class="comment-edit-input"
                @keyup.enter="saveEdit(i)"
                @keyup.esc="cancelEdit"
              />
              <button class="comment-edit-save" @click="saveEdit(i)">저장</button>
              <button class="comment-edit-cancel" @click="cancelEdit">취소</button>
            </template>
            <template v-else>
              <span class="comment-name">{{ c.name }}</span>
              <span class="comment-text">{{ c.text }}</span>
            </template>
          </div>
          <div v-if="c.uid && c.uid === currentUid && editingIndex !== i" class="comment-actions">
            <button class="comment-action-btn" @click="startEdit(i, c.text)">수정</button>
            <button class="comment-action-btn delete" @click="deleteComment(i)">삭제</button>
          </div>
        </div>
        <div v-if="!post.commentList || post.commentList.length === 0" class="comment-empty">
          첫 번째 댓글을 남겨보세요
        </div>
        <button class="comment-close" @click="showComments = false">접기</button>
      </div>
    </transition>

    <!-- 댓글 입력창 -->
    <div class="comment-input-row">
      <div class="comment-avatar-sm">{{ myInitial }}</div>
      <input
        v-model="commentInput"
        class="comment-input"
        placeholder="댓글 달기..."
        maxlength="100"
        @keyup.enter="submitComment"
      />
      <button
        class="comment-submit"
        :class="{ active: commentInput.trim() }"
        :disabled="!commentInput.trim()"
        @click="submitComment"
      >게시</button>
    </div>

    <div class="post-divider"></div>

    <!-- 공유 토스트 -->
    <transition name="toast-fade">
      <div v-if="showToast" class="share-toast">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<script>
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'FeedPost',
  props: {
    post: { type: Object, required: true },
  },
  data() {
    return {
      showToast: false,
      toastMsg: '',
      toastTimer: null,
      showComments: false,
      commentInput: '',
      editingIndex: null,
      editInput: '',
    }
  },
  computed: {
    currentUid() {
      return this.$store.state.currentUser?.uid
    },
    isFollowing() {
      return this.$store.state.following.includes(this.post.uid)
    },
    isLiked() {
      return this.post.likedBy?.includes(this.currentUid) ?? false
    },
    isSaved() {
      return this.post.savedBy?.includes(this.currentUid) ?? false
    },
    likesCount() {
      return this.post.likedBy?.length ?? 0
    },
    commentCount() {
      return this.post.commentList?.length ?? 0
    },
    myInitial() {
      return this.$store.state.currentUser?.nickname?.[0] ?? '?'
    },
  },
  methods: {
    requireLogin() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/login')
        return true
      }
      return false
    },
    async toggleLike() {
      if (this.requireLogin()) return
      const postRef = doc(db, 'posts', this.post.id)
      if (this.isLiked) {
        await updateDoc(postRef, { likedBy: arrayRemove(this.currentUid) })
      } else {
        await updateDoc(postRef, { likedBy: arrayUnion(this.currentUid) })
      }
    },
    async toggleSave() {
      if (this.requireLogin()) return
      const postRef = doc(db, 'posts', this.post.id)
      if (this.isSaved) {
        await updateDoc(postRef, { savedBy: arrayRemove(this.currentUid) })
      } else {
        await updateDoc(postRef, { savedBy: arrayUnion(this.currentUid) })
      }
    },
    async submitComment() {
      const text = this.commentInput.trim()
      if (!text) return
      if (this.requireLogin()) return
      const user = this.$store.state.currentUser
      await updateDoc(doc(db, 'posts', this.post.id), {
        commentList: arrayUnion({
          uid: user.uid,
          name: user.nickname || user.email?.split('@')[0] || '익명',
          text,
        }),
      })
      this.commentInput = ''
      this.showComments = true
    },
    startEdit(index, text) {
      this.editingIndex = index
      this.editInput = text
    },
    cancelEdit() {
      this.editingIndex = null
      this.editInput = ''
    },
    async saveEdit(index) {
      const text = this.editInput.trim()
      if (!text) return
      const snap = await getDoc(doc(db, 'posts', this.post.id))
      const list = [...(snap.data().commentList || [])]
      list[index] = { ...list[index], text }
      await updateDoc(doc(db, 'posts', this.post.id), { commentList: list })
      this.cancelEdit()
    },
    async deleteComment(index) {
      const snap = await getDoc(doc(db, 'posts', this.post.id))
      const list = [...(snap.data().commentList || [])]
      list.splice(index, 1)
      await updateDoc(doc(db, 'posts', this.post.id), { commentList: list })
    },
    async sharePost() {
      const text = `${this.post.dish}${this.post.area ? ' · ' + this.post.area : ''}\n${this.post.caption || ''}\n#sizzle`
      if (navigator.share) {
        try {
          await navigator.share({ title: this.post.dish, text })
        } catch (e) {
          // 사용자가 취소한 경우 무시
        }
      } else {
        await navigator.clipboard.writeText(text)
        this.showToastMsg('링크 복사됨!')
      }
    },
    showToastMsg(msg) {
      this.toastMsg = msg
      this.showToast = true
      clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => { this.showToast = false }, 2000)
    },
    async toggleFollow() {
      if (!this.$store.state.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      const myUid = this.currentUid
      const targetUid = this.post.uid
      if (this.isFollowing) {
        await updateDoc(doc(db, 'users', myUid),     { following: arrayRemove(targetUid) })
        await updateDoc(doc(db, 'users', targetUid), { followers: arrayRemove(myUid) })
      } else {
        await updateDoc(doc(db, 'users', myUid),     { following: arrayUnion(targetUid) })
        await updateDoc(doc(db, 'users', targetUid), { followers: arrayUnion(myUid) })
      }
    },
  },
}
</script>

<style scoped>
.post { background: #fff; }

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
}

.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
}

.post-info { flex: 1; min-width: 0; }

.post-name {
  font-size: 14px;
  font-weight: 700;
  color: #241a14;
}

.post-location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #9a8579;
  margin-top: 1px;
}

.location-name { color: #C25A2E; font-weight: 600; }

.cat-tag {
  font-size: 11px;
  font-weight: 700;
  color: #E8451F;
  background: #FFF1E8;
  padding: 5px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.follow-btn {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #E8451F;
  background: #fff;
  border: 1.5px solid #E8451F;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.follow-btn.following {
  color: #9a8579;
  border-color: #F1E4D8;
  background: #F4ECE4;
}

.post-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f4ece4;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dish-label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  background: rgba(31, 20, 14, 0.5);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 7px 13px;
  border-radius: 999px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 12px 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.spacer { flex: 1; }

.post-body { padding: 0 16px 14px; }

.likes-count {
  font-size: 13px;
  font-weight: 700;
  color: #241a14;
}

.caption {
  font-size: 14px;
  color: #2e2017;
  line-height: 1.5;
  margin-top: 3px;
}

.caption b { font-weight: 700; }

.tags {
  font-size: 13px;
  color: #E8451F;
  margin-top: 2px;
}

.comments-link {
  font-size: 12px;
  color: #a8978b;
  margin-top: 6px;
  cursor: pointer;
}

.post-divider {
  height: 8px;
  background: #F4ECE4;
}

/* 댓글 */
.comment-panel {
  padding: 10px 16px 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FFFDFB;
}

.comment-item {
  font-size: 14px;
  color: #2e2017;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.comment-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.comment-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.comment-action-btn {
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: #9a8579;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-action-btn.delete {
  color: #F4442E;
}

.comment-edit-input {
  flex: 1;
  border: none;
  border-bottom: 1.5px solid #E8451F;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #241a14;
  outline: none;
  min-width: 0;
  padding: 2px 0;
}

.comment-edit-save {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #E8451F;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-edit-cancel {
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #9a8579;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-name {
  font-weight: 700;
  margin-right: 6px;
  color: #241a14;
}

.comment-text {
  color: #4a3728;
}

.comment-empty {
  font-size: 13px;
  color: #c0a898;
  text-align: center;
  padding: 8px 0;
}

.comment-close {
  align-self: flex-start;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #9a8579;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 2px;
}

.comment-slide-enter-active,
.comment-slide-leave-active {
  transition: opacity 0.18s, max-height 0.22s;
  overflow: hidden;
  max-height: 400px;
}

.comment-slide-enter-from,
.comment-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.comment-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 12px;
  border-top: 1px solid #F4ECE4;
}

.comment-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7A45, #F4442E);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #241a14;
  outline: none;
  min-width: 0;
}

.comment-input::placeholder { color: #c0a898; }

.comment-submit {
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #c0a898;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.comment-submit.active { color: #E8451F; }
.comment-submit:disabled { cursor: default; }

.share-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #241a14;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 999px;
  z-index: 999;
  white-space: nowrap;
  pointer-events: none;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
