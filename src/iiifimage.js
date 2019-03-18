import React, {Component} from 'react'
import axios from 'axios';
import URLImage from './urlimage';

export default class IIIFImage extends Component {
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

  bestTileWidthAndScaleFactor() {
    const { scale } = this.props;
    const { data: { tiles } } = this.state;

    const scaleFactors = [...tiles.map(e => e.scaleFactors)]
    const bestScaleFactor = scaleFactors.sort((a, b) => (a < b)).find(f => (1/f > scale));
    const bestTile = tiles.find(f => f.scaleFactors.includes(bestScaleFactor)) || {};

    return {
      width: bestTile.width || 512,
      height: bestTile.height || bestTile.width || 512,
      zoom: 1 / (bestScaleFactor || 1)
    };
  }

  tiles() {
    const { url, scale, bounds, isVisible } = this.props;
    const { data } = this.state;

    if (!data) return [];

    const result = [];

    const { width, height, tiles } = data;

    result.push({
      key: 'base',
      src: `${url}/full/400,/0/default.jpg`,
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    const { zoom: tileZoom, width: tileWidth, height: tileHeight } = this.bestTileWidthAndScaleFactor();

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

        if (isVisible(tileBounds)) {
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

  render() {
    return (
      this.tiles().map((tile) => {
        return <URLImage {...tile} />;
      })
    );
  }
}
