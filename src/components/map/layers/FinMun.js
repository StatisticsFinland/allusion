import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from "ol/style/Stroke";

const FinMun = new VectorLayer({
  name: 'Municipalities',
  title: 'Finnish Municipalities',
  visible: false,
  style: new Style({
    stroke: new Stroke({
      color: 'black',
      width: 1
    })
  }),

  source: new VectorSource({})
});

export default FinMun;