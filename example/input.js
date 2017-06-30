
export default {
  data() {
    return {
      time: new Date()
    }
  },
  created() {
    setInterval(() => {
      this.time = new Date()
    }, 1000)
  },
  render() {
    return `<div>
      ${this.time} hi ${1+`${2}`}
    </div>`
  }
}

const another = {
  template: `<div>hi</div>`
}
