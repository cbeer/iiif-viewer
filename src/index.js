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
      rotation: 0,
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
    const { scale } = this.state;

    this.setState({
      x: -1 * e.target.x() / scale,
      y: -1 * e.target.y() / scale,
    });
  };

  render() {
    const { url } = this.props;
    const { x, y, rotation, scale } = this.state;

    return (
      <Fragment>
        <Stage rotation={rotation} x={-1 * x * scale} y={-1 * y * scale} scaleX={scale} scaleY={scale} onWheel={this.handleWheel} onDragEnd={this.handleDragEnd} draggable width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <IIIFImage scale={scale} bounds={{ x1: x, y1: y, x2: x + (window.innerWidth / scale), y2: y + (window.innerHeight / scale) }} url={url} />
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
