import React, {Component, Fragment} from 'react'
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

    const scaleFactors = [].concat(...tiles.map(e => e.scaleFactors)).sort((a, b) => (a < b))
    const bestScaleFactor = scaleFactors.find(f => (1/f > scale));
    const bestTile = tiles.find(f => f.scaleFactors.includes(bestScaleFactor)) || {};

    if (bestTile.width && bestTile.height && bestTile.width * bestTile.height > 1048576) {
      if (this.isLevel1() || !this.supports(['sizeByWh']) || !this.supports(['sizeByDistortedWh'])) {
        return {
          width: Math.min(bestTile.width, bestTile.height || Number.MAX_SAFE_INTEGER),
          height: Math.min(bestTile.width, bestTile.height || Number.MAX_SAFE_INTEGER),
          providedHeight: !!bestTile.height,
          zoom: 1 / (bestScaleFactor || 1)
        }
      } else {
        return {
          width: Math.min(bestTile.width, 512),
          height: Math.min(bestTile.height, Math.min(bestTile.width, 512)),
          zoom: 1 / (bestScaleFactor || 1)
        }
      }
    }

    return {
      width: bestTile.width || 512,
      height: bestTile.height || bestTile.width || 512,
      providedHeight: !!bestTile.height,
      zoom: 1 / (bestScaleFactor || 1)
    };
  }

  baseImage() {
    const { url } = this.props;
    const { data: { sizes } } = this.state;

    const prettyGoodSize = sizes.sort((a,b) => a.width * a.height < b.width * b.height ).find((s) => s.width * s.height < 1048576)
    return `${url}/full/${prettyGoodSize ? prettyGoodSize.width : 400},/0/default.jpg`
  }

  tiles() {
    const { url, scale, bounds, isVisible } = this.props;
    const { data } = this.state;

    const result = [];

    const { width, height, tiles } = data;

    result.push({
      key: 'base',
      src: this.baseImage(),
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    const { zoom: tileZoom, width: tileWidth, height: tileHeight, providedHeight } = this.bestTileWidthAndScaleFactor();

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
            src: `${url}/${x},${y},${x_width},${y_height}/${actualTileWidth},${this.isLevel1(['sizeByWh']) && !providedHeight ? '' : actualTileHeight}/0/default.jpg`,
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

  isLevel0(orSupports = []) {
    const { data: { profile } } = this.state;

    if (typeof profile === "string" ) return profile.match(/level0/);

    return this.supports(orSupports);
  }

  isLevel1(orSupports = []) {
    const { data: { profile } } = this.state;

    if (typeof profile === "string" ) return profile.match(/level1/);

    return this.supports(orSupports);
  }

  isLevel2(orSupports = []) {
    const { data: { profile } } = this.state;

    if (typeof profile === "string" ) return profile.match(/level2/);

    return this.supports(orSupports);
  }

  supports(expected) {
    const { data: { profile } } = this.state;

    if (typeof profile === "string" ) return undefined;

    const { supports } = profile;

    return expected.every((e) => supports.includes(e));
  }

  render() {
    const { data } = this.state;
    if (!data) return <Fragment></Fragment>;
    if (this.isLevel0()) return <URLImage src={`${url}/full/full/0/default.jpg`} />

    return (
      this.tiles().map((tile) => {
        return <URLImage {...tile} />;
      })
    );
  }
}
