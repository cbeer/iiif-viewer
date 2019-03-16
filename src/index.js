import React, {Component, Fragment} from 'react'
import { Stage, Layer, Rect, Image } from 'react-konva';
import debounce from 'lodash/debounce';
import IIIFImage from './iiifimage';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: props.zoom || 1,
      x: props.x || 0,
      y: props.y || 0,
      scale: 0.1,
    };
  }

  handleWheel = (e) => {
    const { zoom } = this.state;

    e.evt.preventDefault();
    const stage = e.currentTarget;

    var oldScale = stage.scaleX();
    var scaleBy = 1.03;

    var mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    var newScale =
      e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
      x:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
        newScale,
      y:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
        newScale
    };

    stage.position(newPos);
    stage.batchDraw();

    this.asyncSetState({
      ...newPos,
      zoom: newScale,
      scale: newScale,
    });
  }

  asyncSetState = debounce((props) => {
    this.setState(props);
  }, 500);

  handleDragEnd = e => {
    this.setState({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  render() {
    const { x, y, scale, zoom } = this.state;

    return (
      <Fragment>
        <Stage x={x} y={y} scaleX={scale} scaleY={scale} onWheel={this.handleWheel} onDragEnd={this.handleDragEnd} draggable width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <IIIFImage zoom={zoom} scale={scale} bounds={{ x1: -1*x / scale, y1: -1*y / scale, x2: -1*x / scale + (window.innerWidth / scale), y2: -1*y / scale + (window.innerHeight / scale) }} url="https://stacks.stanford.edu/image/iiif/bb000zn0114%252FPC0062_2008-194_Q03_02_007" />
          </Layer>
        </Stage>
        <div style={{ position: 'absolute', right: 0, top: 0 }} >
          <button onClick={() => { this.setState({ scale: scale * 2 })} }>zoom in</button>
          <button onClick={() => { this.setState({ scale: scale / 2 })} }>zoom out</button>
          <button onClick={() => { this.setState({ scale: 1 })} }>reset</button>
        </div>
      </Fragment>
    );
  }
}
