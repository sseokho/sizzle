<template>
  <router-view />
</template>

<script>
export default {
  name: "App"
}

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #F4ECE4;
  font-family: 'Pretendard Variable', Pretendard, system-ui, sans-serif;
}

#app {
  max-width: 430px;
  margin: 0 auto;
  background: #FFFDFB;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 10px;
  background: #FFFDFB;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-logo {
  font-family: 'Baloo 2', sans-serif;
  font-size: 27px;
  font-weight: 800;
  color: #E8451F;
  letter-spacing: -0.5px;
  line-height: 1;
}

.header-icons {
  display: flex;
  gap: 17px;
  color: #241a14;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #241a14;
  padding: 0;
  display: flex;
}

/* 카테고리 바 */
.category-bar {
  display: flex;
  gap: 8px;
  padding: 2px 16px 12px;
  overflow-x: auto;
  background: #FFFDFB;
  scrollbar-width: none;
}

.category-bar::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  white-space: nowrap;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #C25A2E;
  background: #FFF1E8;
  border: none;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}

.cat-btn.active {
  color: #fff;
  background: #FF6A3D;
  font-weight: 700;
  box-shadow: 0 5px 14px rgba(255, 106, 61, 0.36);
}

/* 피드 */
.feed {
  flex: 1;
  padding-bottom: 80px;
}

/* 하단 네비 */
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 11px 0 20px;
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
}

.nav-btn.active {
  color: #FF6A3D;
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
</style>
