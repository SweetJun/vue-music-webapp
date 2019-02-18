<!-- 推荐页：歌单详情组件 -->

<template>
  <transition name="slide">
    <my-music-list class="my-song-list-detail" :songs="songs" :title="title" :bg-image="bgImage"></my-music-list>
  </transition>
</template>

<script>
import MyMusicList from '@/components/MyMusicList/MyMusicList'
import { getSongList } from '@/api/recommend.js'
import { createSingerSong } from '@/common/js/SingerSongClass.js'

export default {
  components: {
    MyMusicList
  },
  data () {
    return {
      songs: [],
      title: '',
      bgImage: ''
    }
  },
  methods: {
    // 获取歌单数据
    _getSongList () {
      let dissid = this.$route.params.id
      getSongList(dissid).then((res) => {
        if (res.code === 0) {
          // console.log(res.cdlist[0].songlist)
          this.songs = this._formatSongs(res.cdlist[0].songlist)

          this.title = res.cdlist[0].dissname
          this.bgImage = res.cdlist[0].logo
        }
      })
    },
    // 重组 res.cdlist[0].songlist 数据
    _formatSongs (list) {
      let result = []
      list.forEach((item) => {
        if (item.songmid && item.albummid) {
          result.push(createSingerSong(item))
        }
      })
      return result
    }
  },
  created () {
    this._getSongList()
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/const.scss';
@import '../../common/scss/mymixin.scss';

.my-song-list-detail {}

.slide-enter-active, .slide-leave-active {
  transition: all .3s ease;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}
</style>
