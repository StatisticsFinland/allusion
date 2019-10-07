import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const visibleStyle = new Style({
  stroke: new Stroke({
    color: 'rgb(0,0,0)',
    width: 0.3
  }),
  fill: new Fill(
      {
        color: 'rgba(17,244,0,0.001)',
      })
});

const invisibleStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0,0,0,0)',
    width: 0.3
  }),
  fill: new Fill(
      {
        color: 'rgba(17,244,0,0.0)',
      })
});


const FinMun = new VectorLayer({
  name: 'Municipalities',
  title: 'Finnish Municipalities',
  visible: true,
  kind: 'auxiliary',
  linesVisibleInitially: false,
  style: invisibleStyle,
  source: new VectorSource({})
});

export {FinMun, visibleStyle, invisibleStyle};