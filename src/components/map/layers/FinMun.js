import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const FinMun = new VectorLayer({
  name: 'Municipalities',
  title: 'Finnish Municipalities',
  visible: true,
  kind: 'auxiliary',
  style: new Style({
    stroke: new Stroke({
      color: 'black',
      width: 0.3
    }),
    fill: new Fill(
        {
          color: 'rgba(17,244,0,0.001)',
        })
  }),

  source: new VectorSource({})
});

export default FinMun;