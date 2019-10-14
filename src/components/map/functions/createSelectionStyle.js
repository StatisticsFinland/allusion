import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';

/* Callback function for generating style for an OpenLayers feature */
const createSelectionStyle = (style, selectedFeatures) => feature => {
    let comparisonArray = selectedFeatures.map(selection => JSON.stringify(selection.getGeometry()))
    if (comparisonArray.some(comparison => comparison === JSON.stringify(feature.getGeometry()))) {
        let newStyle;
        let selectionColor = 'rgba(66, 134, 244, 0.75)';
        /* Apply styles according to feature's geometry type */
        switch (style.geom) {
            case 'MultiPoint': case 'Point': newStyle = { image: new Circle({ radius: 8, stroke: new Stroke({ color: selectionColor, width: 1 }) }) }; break;
            case 'MultiPolygon': case 'Polygon': newStyle = { fill: new Fill({ color: selectionColor }) }; break;
            case 'LineString': case 'MultiLineString': newStyle = { stroke: new stroke({ color: selectionColor, width: 1 }) }; break;
        };
    
        return new Style(newStyle);
} else {
    
}

}

export default createSelectionStyle;