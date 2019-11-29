import store from '../store'
import { storiesOf } from '@storybook/vue'
import { text, withKnobs } from '@storybook/addon-knobs'

import PoseEstimation from '../components/PoseEstimation.vue'

const stories = storiesOf('Components', module)
stories.addDecorator(withKnobs)

stories.add('PoseEstimation', () => ({
  components: { PoseEstimation },
  props: {
  },
  template: `<PoseEstimation :size='{width: 320, height: 240}'></PoseEstimation>`,
  store: store,
}))