import React, {Component, Fragment} from 'react'
import { Stage, Layer, Rect, Image } from 'react-konva';
import debounce from 'lodash/debounce';
import { Motion, spring } from 'react-motion';
import IIIFImage from './iiifimage';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: props.x || 0,
      y: props.y || 0,
      scale: 0.1,
      rotation: props.rotation,
      immediate: false,
    };
  }

  isVisible = (offset = { x: 0, y: 0}) => {
    return (obj) => {
      const { width, height } = this.props;
      const { x, y, scale } = this.state;

      return ((x - offset.x) <= obj.x2 &&
              obj.x1 <= (x - offset.x + width / scale) &&
              (y - offset.y) <= obj.y2 &&
              obj.y1 <= (y - offset.y + height / scale));
    }
  }

  handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.currentTarget;

    var oldScale = stage.scaleX();
    var scaleBy = 1.04;

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
      x: -1 * newPos.x / newScale,
      y: -1 * newPos.y / newScale,
      scale: newScale,
      immediate: true,
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
    const { url, width, height } = this.props;
    const { x, y, rotation, scale, immediate } = this.state;

    return (
      <Motion style={{
        rotation: immediate ? rotation : spring(rotation),
        x: immediate ? x : spring(x),
        y: immediate ? y : spring(y)
      }}>
        {motion =>
          <Stage rotation={motion.rotation} x={-1 * motion.x * scale} y={-1 * motion.y * scale} scaleX={scale} scaleY={scale} onWheel={this.handleWheel} onDragEnd={this.handleDragEnd} draggable width={width} height={height}>
            <Layer name={url}>
              <IIIFImage scale={scale} isVisible={this.isVisible()} url={url} />
            </Layer>
          </Stage>
        }
      </Motion>
    );
  }
}
