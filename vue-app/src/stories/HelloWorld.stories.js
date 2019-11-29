import { storiesOf } from '@storybook/vue'
import { text, withKnobs } from '@storybook/addon-knobs'

import HelloWorld from '../components/HelloWorld.vue'

const stories = storiesOf('Components', module)
stories.addDecorator(withKnobs)

stories.add('HelloWorld', () => ({
  components: { HelloWorld },
  props: {
    message: {
      default: text('Text', 'Hello Storybook'),
    },
  },
  template: `<HelloWorld :msg="message"></HelloWorld>`,
}))