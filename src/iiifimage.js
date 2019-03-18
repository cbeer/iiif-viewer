import React, {Component} from 'react'
import axios from 'axios';
import URLImage from './urlimage';

export default class IIIFImage extends Component {
  static intersects(a, b) {
    return (a.x1 <= b.x2 &&
            b.x1 <= a.x2 &&
            a.y1 <= b.y2 &&
            b.y1 <= a.y2);
  }

  constructor(props) {
    super(props);
    this.state = { data: undefined };
  }

  componentDidMount() {
    this.fetchImageApiResponse();
  }

  componentDidUpdate({ url: prevUrl }) {
    const { url } = this.props;

    if (url !== prevUrl) {
      this.fetchImageApiResponse();
    }
  }

  fetchImageApiResponse() {
    const { url } = this.props;
    axios.get(`${url}/info.json`).then((response) => {
      this.setState({ data: response.data });
    });
  }

  tiles() {
    const { url, scale, bounds } = this.props;
    const { data } = this.state;

    if (!data) return [];

    const result = [];

    const { width, height, tiles } = data;
    const { width: tileWidth, height: tileHeight, scaleFactors } = data.tiles[0];

    result.push({
      key: 'base',
      src: `${url}/full/400,/0/default.jpg`,
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    const tileZoom = 1 / ((scaleFactors || []).sort(function(a,b) { return a < b }).find((f) => { return 1/f > scale }) || 1);

    for (var i = 0; i < Math.ceil(tileZoom * width / tileWidth); i++) {
      for (var j = 0; j < Math.ceil(tileZoom * height / tileHeight); j++) {

        let actualTileWidth = tileWidth, actualTileHeight = tileHeight;

        // last in the row
        if (i === Math.floor(tileZoom * width / tileWidth)) {
          actualTileWidth = Math.ceil(tileZoom * width) - i * tileWidth;

        }

        // last in the column
        if (j === Math.floor(tileZoom * height / tileHeight)) {
          actualTileHeight = Math.ceil(tileZoom * height) - j * tileHeight;
        }

        const x = Math.floor(i * tileWidth / tileZoom),
              y = Math.floor(j * tileHeight / tileZoom),
              x_width = Math.ceil(actualTileWidth / tileZoom),
              y_height = Math.ceil(actualTileHeight / tileZoom)

        const tileBounds = { x1: x, y1: y, x2: x + x_width, y2: y + y_height };

        if (IIIFImage.intersects(bounds, tileBounds)) {
          result.push({
            key: `${x},${y}`,
            src: `${url}/${x},${y},${x_width},${y_height}/${actualTileWidth},${actualTileHeight}/0/default.jpg`,
            x: x,
            y: y,
            width: x_width,
            height: y_height,
          });
        }
      }
    }

    return result;
  }

  fitBounds({ width, height, maxWidth, maxHeight }) {
    const aspectRatio = width / height;

    if ((maxWidth / maxHeight) < aspectRatio) {
      return { height: maxWidth / aspectRatio, width: maxWidth };
    } else {
      return { height: maxHeight, width: maxHeight * aspectRatio };
    }

  }

  render() {
    return (
      this.tiles().map((tile) => {
        return <URLImage {...tile} />;
      })
    );
  }
}
