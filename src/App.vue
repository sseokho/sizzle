<template>
  <div class="header">
    <ul class="header-button-left">
      <li>Cancel</li>
    </ul>
    <ul class="header-button-right">
      <li>Next</li>
    </ul>
    <img src="./assets/logo.png" class="logo" />
  </div>

  <Container :instarData="instarData" :파일객체="파일객체" :탭여부="탭여부" :url="url"/>
  <button @click="more(); moreCount()">더보기</button>

  <div class="footer">
    <ul class="footer-button-plus">
      <input @change="upload" accept="image/*" type="file" id="file" class="inputfile" />
      <label for="file" class="input-plus">+</label>
    </ul>
  </div>

  <!--
  <div v-if="탭여부 == 1">내용0</div>
  <div v-if="탭여부 == 2">내용1</div>
  <div v-if="탭여부 == 3">내용2</div>
  <button @click="탭여부 = 1">버튼0</button>
  <button @click="탭여부 = 2">버튼1</button>
  <button @click="탭여부 = 3">버튼2</button>
  <div style="margin-top:500px"></div>
  -->
</template>

<script>
import Container from './components/Container'
import instarData from './assets/instarData.js'
import axios from 'axios'
axios.get()


export default {
  name: 'App',
  data(){
    return {
      instarData : instarData,
      num : 0,
      탭여부 : 1,
      url : '',
    }
  },
  watch : {
    num(a){
      if(a==2){
        return;
      }
    }
  },
  components: {
    Container
  },
  methods : {
    moreCount(){
      this.num++;
    },
    
    more(){
      
      axios.get(`https://codingapple1.github.io/vue/more${this.num}.json`).
      then((결과)=>{
        console.log(결과.data);
        this.instarData.push(결과.data)
      })
      .catch((error)=>{
        console.error(error);
      })
    },
    upload(e) {
      let 파일객체 = e.target.files;
      if (파일객체 && 파일객체[0]) {  // 파일이 선택되었을 경우만 처리
        let url = URL.createObjectURL(파일객체[0]);
        this.url = url;
        this.탭여부++;  // 탭을 증가
      } else {
        console.error("파일이 없습니다");
      }
    }
  },
  

}
</script>

<style>
body {
  margin: 0;
}

ul {
  padding: 5px;
  list-style-type: none;
}

.logo {
  width: 22px;
  margin: auto;
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 13px;
}

.header {
  width: 100%;
  height: 40px;
  background-color: white;
  padding-bottom: 8px;
  position: sticky;
  top: 0;
}

.header-button-left {
  color: skyblue;
  float: left;
  width: 50px;
  padding-left: 20px;
  cursor: pointer;
  margin-top: 10px;
}

.header-button-right {
  color: skyblue;
  float: right;
  width: 50px;
  cursor: pointer;
  margin-top: 10px;
}

.footer {
  width: 100%;
  position: sticky;
  bottom: 0;
  padding-bottom: 10px;
  background-color: white;
}

.footer-button-plus {
  width: 80px;
  margin: auto;
  text-align: center;
  cursor: pointer;
  font-size: 24px;
  padding-top: 12px;
}

.sample-box {
  width: 100%;
  height: 600px;
  background-color: bisque;
}

.inputfile {
  display: none;
}

.input-plus {
  cursor: pointer;
}

#app {
  box-sizing: border-box;
  font-family: "consolas";
  margin-top: 60px;
  width: 100%;
  max-width: 460px;
  margin: auto;
  position: relative;
  border-right: 1px solid #eee;
  border-left: 1px solid #eee;
}
</style>
