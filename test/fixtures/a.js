const Component = {
  template: `<div>
    <header>
      <h1>I'm a template!</h1>
    </header>
    <p v-if="message">
      {{ message }}
    </p>
    <p v-else>
      No message.
    </p>
  </div>`
}


const Another = {
  // @transform-disable
  template: `<div></div>`
}

const Yet = {
  template: ``
}
