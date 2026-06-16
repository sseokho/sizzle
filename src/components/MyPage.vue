<template>
    <div style="padding : 10px">
      <h4>팔로워</h4>
      <input placeholder="?" @input="doThis"/>

      <div class="post-header" v-for="(a,i) in follower" :key="i">
        <div class="profile" :style="`background-image:url(${a.image})`"></div>
        <span class="profile-name">{{ a.name }}</span>
      </div>

    </div> 
    </template>

<script>
import { onMounted, ref } from 'vue';
import axios from 'axios';
export default{
    name : 'mypage',
    props : {
        one : Number,
    },
    setup(){
        let follower = ref([{
            image: '',
            name: '' ,

        }]);
        let inputValue = ref("");

        function doThis(event){
            inputValue.value = event.target.value.toLowerCase();
            if (inputValue.value === ""){
                axios.get('./follower.json').then((a) => {
                follower.value = a.data;
                })
            } else {
                const 같은검색어 = follower.value.filter((p) =>
                    p.name.toLowerCase().includes(inputValue.value.toLowerCase())
                );
                follower.value = 같은검색어;

            }
        }

        onMounted(()=>{
            axios.get('./follower.json').then((a) => {
                follower.value = a.data;
            })
        })

        return {follower, doThis}
    },
}
</script>
<style>
</style>