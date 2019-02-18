<!-- xx组件 -->

<template>
  <transition name="slide" class="my-rank-detail">
    <my-music-list :songs="songs" :title="title" :bg-image="bgImage" :rank="true"></my-music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getRankDetail } from '@/api/rank.js'
import { getSongVkey } from '@/api/getSongVkey.js'
import { createSingerSong } from '@/common/js/SingerSongClass.js'
import MyMusicList from '@/components/MyMusicList/MyMusicList'

export default {
  components: {
    MyMusicList
  },
  data () {
    return {
      songs: [],
      songList: [],
    }
  },
  methods: {
    // 获取指定排行榜单详情
    _getRankDetail() {
      let dissid = this.$route.params.id
      getRankDetail(dissid).then((res) => {
        if (res.code === 0) {
          // console.log(res.songlist)
          this.songList = res.songlist
          this.songs = this._formatSongs(res.songlist)
        }
      })
    },
    // 利用递归 获取每首歌的vkey
    _formatSongs(list) {
      let result = []
      list.forEach((item) => {
        let musicData = item.data
        if (musicData.songmid && musicData.albummid) {
          result.push(createSingerSong(musicData))
        }
      })
      return result
    }
  },
  computed: {
    // vuex, 使用对象展开运算符将 getters 混入 computed 对象中
    ...mapGetters(['rankList']),
    // 传入子组件
    title() {
      return this.rankList.topTitle
    },
    // 传入子组件
    bgImage() {
      if (this.songs.length) {
        return this.songs[0].img
      }
    }
  },
  created () {
    this._getRankDetail()
  },
  mounted () {},
  destroyed () {}
}
</script>

<style lang="scss" scoped>
@import '~@/common/scss/const.scss';
@import '~@/common/scss/mymixin.scss';

.my-rank-detail {
  // position: fixed;
  // z-index: 100;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  // background: $color-background;
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s ease;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}
</style>
