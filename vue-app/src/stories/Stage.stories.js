import store from '../store'
import { storiesOf } from '@storybook/vue'
import { text, withKnobs } from '@storybook/addon-knobs'

import Stage from '../components/Stage.vue'

const stories = storiesOf('Components', module)
stories.addDecorator(withKnobs)

stories.add('Stage', () => ({
  components: { Stage },
  props: {
  },
  template: `<Stage :size='{width: 640, height: 480}' />`,
  store: store,
}))