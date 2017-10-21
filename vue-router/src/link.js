export default {
  name: 'router-link',
  props: {
    to: {
      type: String,
      default: '/',
    }
  },
  render(h) {
    const handler = e => {
      e.preventDefault()
      this.$router.push(this.to)
    }
    return h('a', {
        attrs: {
          href: this.to
        }, 
        on: {
          click: handler
        }
      },
      this.$slots.default
    )
  }
}