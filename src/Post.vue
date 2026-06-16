<template>
    <div class="post">
        <div class="post-header">
            <div class="profile"></div>
            <span class="profile-name">{{ 스토어게시물.name }}</span>
        </div>
        <div @click="handleClick" :class="스토어게시물.filter" class="post-body"
            :style="{ backgroundImage: `url(${스토어게시물.postImage})` }"></div>
        <div class="post-content">
            <p>{{ 스토어게시물.likes }}</p>
            <p><strong>{{ 스토어게시물.name }}</strong> {{ 스토어게시물.content }}</p>
            <p class="date">May 15</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Post',
    props: {
        스토어게시물 : Object,
    },
    methods:{
        handleClick(){
            this.$store.commit('좋아요', this.스토어게시물);  // 전체 게시물 객체를 전달하여 상태 변경
        }
    }

}
</script>

<style>
.post {
    width: 100%;
}

.profile {
    background-image: url("https://picsum.photos/100?random=0");
    width: 30px;
    height: 30px;
    background-size: 100%;
    border-radius: 50%;
    float: left;
}

.profile-name {
    display: block;
    float: left;
    padding-left: 10px;
    padding-top: 7px;
    font-size: 14px;
}

.post-header {
    height: 30px;
    padding: 10px;
}

.post-body {
    background-image: url("https://picsum.photos/600?random=0");
    height: 450px;
    background-position: center;
    background-size: cover;
}

.post-content {
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;
}

.date {
    font-size: 11px;
    color: grey;
    margin-top: -8px;
}
</style>