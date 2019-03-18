import React, {Component} from 'react'
import {render} from 'react-dom'

import Example from '../../src'

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = { url: "https://stacks.stanford.edu/image/iiif/bb000zn0114%252FPC0062_2008-194_Q03_02_007" };
  }

  handleChange = (e) => {
    this.setState({ url: e.target.value });
  }

  render() {
    const { url } = this.state;
    return <div>
      <label>
        IIIF Image URL:
        <input value={url} onChange={this.handleChange} />
      </label>

      <Example url={url} width={600} height={600} />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
