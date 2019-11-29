import store from '../store'
import { storiesOf } from '@storybook/vue'
import { text, withKnobs } from '@storybook/addon-knobs'

import FacialExpression from '../components/FacialExpression.vue'

const stories = storiesOf('Components', module)
stories.addDecorator(withKnobs)

stories.add('FacialExpression', () => ({
  components: { FacialExpression },
  props: {

  },
  template: `<FacialExpression :size='{width: 320, height: 240}' />`,
  store: store,
}))