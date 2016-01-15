<template>
  <div class="indicator">
    <svg :width="size" :height="size">
      <circle :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="strokeWidth" :stroke="backgroundColor" fill="none"></circle>
      <circle :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="strokeWidth" :stroke="foregroundColor" fill="none" :transform="transform" :stroke-dasharray="dasharray"></circle>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    'size': {
      type: Number,
      default: 60
    },
    'radius': {
      type: Number,
      default: 20
    },
    'stroke-width': {
      type: Number,
      default: 5
    },
    'background-color': {
      type: String,
      default: '#d1d3d7'
    },
    'foreground-color': {
      type: String,
      default: '#00a5e0'
    }
  },
  data () {
    return {
      rotate: -90,
      percent: 0,
      dasharray: this.calcDashArray(0, 0)
    }
  },
  computed: {
    transform () {
      return `rotate(${this.rotate}, ${this.size / 2}, ${this.size / 2})`
    }
  },
  created () {
    this.watchPercent()
  },
  methods: {
    watchPercent () {
      this.unwatchPercent = this.$watch('percent', val => {
        this.dasharray = this.calcDashArray(0, val)
      })
    },
    calcDashArray (start, end) {
      let perimeter = Math.PI * 2 * 20
      return [
        0,
        perimeter * start,
        perimeter * (end - start),
        perimeter * (1 - end)
      ].join(' ')
    },
    updateLoading () {
      this.rotate += 5
      if (this.rotate > 360) this.rotate -= 360
    },
    startLoading () {
      if (this.loading) return
      this.unwatchPercent()
      this.dasharray = this.calcDashArray(0, 0.2)
      this.loading = setInterval(this.updateLoading, 16)
    },
    stopLoading () {
      clearInterval(this.loading)
      this.loading = undefined
      this.rotate = -90
      this.watchPercent()
      this.percent = 0
    }
  }
}
</script>
