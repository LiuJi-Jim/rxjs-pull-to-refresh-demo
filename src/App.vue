<template>
  <div id="app" class="page">
    <div class="body" v-el:body>
      <list-view class="staff" v-el:staff v-pull-to-refresh :on-refresh="refresh" :threshold="44" :wrapper="$els.body">
        <div class="p2r-hidden h-box">
          <loading-indicator
            :size="40"
            :radius="15"
            :foreground-color="releaseToRefresh ? '#00e06f' : '#00a5e0'"
            v-ref:indicator></loading-indicator>
        </div>
        <div class="person" v-for="person in staff">
          <div class="name">
            <span class="first">{{ person.firstName }}</span>
            <span class="last">{{ person.lastName }}</span>
          </div>
          <div class="age">({{ person.age }})</div>
        </div>
      </list-view>
    </div>

    <div class="bottom-bar">
      dummy bottom-bar
    </div>
  </div>
</template>

<script>
import ListView from './components/ListView'
import LoadingIndicator from './components/LoadingIndicator'
import staff from './staff.json'

function rand (min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }
  return min + Math.floor(Math.random() * (max - min))
}

export default {
  data () {
    return {
      window: window,
      staff,
      releaseToRefresh: false
    }
  },
  methods: {
    pull (offset) {
      this.$els.staff.style.transform = `translate3d(0, ${offset}px, 0)`
    },
    shuffle () {
      let len = this.staff.length
      let times = len * 2
      while (times--) {
        let a = rand(len)
        let b = rand(len)
        let tmp = this.staff[a]
        this.staff.$set(a, this.staff[b])
        this.staff.$set(b, tmp)
      }
    },
    refresh () {
      this.releaseToRefresh = false
      this.$refs.indicator.startLoading()
      return new Promise(resolve => setTimeout(() => {
        this.shuffle()
        this.$refs.indicator.stopLoading()
        resolve()
      }, 2000))
    }
  },
  events: {
    'pull-to-refresh-drag-move': function (offset, result) {
      let percent = offset / 60
      if (percent > 1) percent = 1
      this.$refs.indicator.percent = percent

      this.releaseToRefresh = result
      this.pull(offset)
    },
    'pull-to-refresh-drag-release': function (result) {
      this.pull(0)
      this.releaseToRefresh = false
    }
  },
  components: {
    ListView,
    LoadingIndicator
  }
}
</script>

<style lang="less">
@import (once) "./global";

#app {
  > .body {
    background: #f7f7f7;
    > .staff {
      margin-top: -44px;

      > .p2r-hidden {
        height: 44px;
        .h-box();
        justify-content: center;
        align-items: center;
        color: #ccc;
      }

      > .person {
        height: 44px;
        .h-box();
        padding-left: 8px;
        background: #fff;
        border-bottom: 1px solid #ccc;
        align-items: center;

        > .age {
          font-size: 80%;
          color: #999;
        }
      }
    }
  }
  > .bottom-bar {
    z-index: 10;
    .h-box();
    height: 44px;
    justify-content: center;
    align-items: center;
    box-shadow: 0 -2px 2px #999;
  }
}
</style>
