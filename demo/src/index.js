import React, {Component} from 'react'
import {render} from 'react-dom'

import Example from '../../src'

class Demo extends Component {
  render() {
    return <div>
      <Example url="https://stacks.stanford.edu/image/iiif/bb000zn0114%252FPC0062_2008-194_Q03_02_007" />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
