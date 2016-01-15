import Rx from 'rxjs'

const noop = function () { }

export default {
  params: ['wrapper', 'on-refresh', 'max-offset', 'threshold'],
  pull (offset) {

  },
  bind () {
    let releaseThreshold = this.params.threshold || 60
    let maxOffset = this.params.maxOffset || releaseThreshold * 1.5
    let wrapper = this.params.wrapper
    let onRefresh = this.params.onRefresh || noop
    let el = this.el
    let touchstart = Rx.Observable.fromEvent(el, 'touchstart')
    let touchmove = Rx.Observable.fromEvent(el, 'touchmove')
    let touchend = Rx.Observable.fromEvent(el, 'touchend')
    let touchcancel = Rx.Observable.fromEvent(document, 'touchcancel')
    let end = Rx.Observable.merge(touchend, touchcancel)

    let dragAtTop = touchstart.filter(e => wrapper.scrollTop === 0)
    let dragTopDown = dragAtTop.map(start => {
      // iOS Safari中touches[0]在touchmove序列中指向同一个对象，故需要在此时将其Y值存下来
      let startY = start.touches[0].pageY
      return touchmove
        .map(move => {
          let currentY = move.touches[0].pageY
          return {
            startEvent: start,
            moveEvent: move,
            startY: startY,
            currentY: currentY,
            offset: currentY - startY
          }
        })
        .skipWhile(drag => drag.offset < 0) // 先无视向上拖拽的那些动作，直到向下拖拽才开始算dragTopDown
        .takeUntil(end) // 同样，还是到`end`流发生就结束
    })

    dragTopDown.forEach(drags => {
      // 响应所有drag move
      drags.forEach(drag => {
        drag.moveEvent.preventDefault() // 触发下拉刷新时，屏蔽原生滚动
        let offset = drag.offset / 2 // 压缩滚动距离，实现拖拽“力度”
        if (offset < 0 || offset > maxOffset) {
          return // 超过范围，不处理
        }
        let refresh = offset >= releaseThreshold // 计算阈值，决定是否应该刷新
        this.vm.$emit('pull-to-refresh-drag-move', offset, refresh) // 触发事件
      })

      // 对于最后一个drag move，有其单独逻辑
      drags.last().subscribe(drag => {
        let offset = drag.offset / 2
        let refresh = offset >= releaseThreshold
        if (refresh) {
          // 释放刷新时，先主动回弹到正确高度
          this.vm.$emit('pull-to-refresh-drag-move', releaseThreshold, refresh)
        }

        // 不刷新时，直接释放
        // 需要刷新时，调用onRefresh回调函数，完成刷新后再释放
        let promise = Promise.resolve(refresh ? onRefresh() : undefined)
        promise.then(ret => {
          this.vm.$emit('pull-to-refresh-drag-release', refresh)
        })
      })
    })
  }
}
