import { createStore } from 'vuex'
import 전체게시물 from './assets/postdata.js'
import axios from 'axios';

const store = createStore({
    state() {
        return {
            스토어게시물: 전체게시물,
            더보기 : 0,
            isLoggedIn: false,
            currentUser: null,
            following: [],   // 내가 팔로우하는 uid 목록
        }
    },
    mutations: {
        setMore(state, data){
            state.스토어게시물.push(data);
            this.state.더보기 ++;
        },
        좋아요(state, post) {
            const targetPost = state.스토어게시물.find(p => p === post);
            if (targetPost) {
                targetPost.liked = !targetPost.liked;
                targetPost.likes += targetPost.liked ? 1 : -1;
            }
        },
        login(state, user) {
            state.isLoggedIn = true
            state.currentUser = user
        },
        logout(state) {
            state.isLoggedIn = false
            state.currentUser = null
            state.following = []
        },
        setFollowing(state, followingList) {
            state.following = followingList
        },
    },
    actions: {
        getData(store){
            axios.get(`https://codingapple1.github.io/vue/more${this.state.더보기}.json`).then((a) => {
                store.commit('setMore', a.data)
            });
        }
    }
})

export default store;