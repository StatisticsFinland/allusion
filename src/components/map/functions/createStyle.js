import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Point from 'ol/geom/Point.js';
import { getWidth, getCenter } from 'ol/extent.js';

/* Callback function for generating style for an OpenLayers feature */
const createStyle = (style, time = null, selection = false, relativeToArea = null, labels = null) => (feature, resolution) => {

    /* Get colors for different data styling methods */
    let fill, stroke, newStyle, featureStyle;
    let markerStyle = null;
    let labelStyle = null;
    let strokeArray = Array.isArray(style.stroke);
    let fillArray = Array.isArray(style.fill);

    /* Single symbology */
    if (style.styling === 'single') {
        fill = style.fillVisibility ? new Fill({ color: style.fill }) : null;
        stroke = style.strokeVisibility ? new Stroke({ color: style.stroke, width: style.strokeWidth }) : null
    } else if (style.styling === 'categorical') {
        let index = style.fieldValues.findIndex(value => value === feature.get(style.fieldSelection));
        fill = style.fillVisibility ? new Fill({ color: index !== -1 ? style.fill[index] : 'rgba(0,0,0,0)' }) : null;
        stroke = new Stroke({ color: index !== -1 ? style.fill[index] : 'rgba(0,0,0,0)', width: style.strokeWidth });
    } else if (style.styling === 'quantitative') {
        let index = style.fieldValues.findIndex(value => feature.get(style.fieldSelection) >= value.lowerBound && feature.get(style.fieldSelection) <= value.upperBound);
        fill = style.fillVisibility ? new Fill({ color: index !== -1 ? style.fill[index] : 'rgba(0,0,0,0.25)' }) : null;
        if (style.strokeVisibility) {
            stroke = new Stroke({ color: strokeArray ? index !== -1 ? style.stroke[index] : 'rgba(0,0,0,0)' : style.stroke, width: style.strokeWidth });
        } else {
            stroke = new Stroke({ color: fillArray ? index !== -1 ? style.fill[index] : 'rgba(0,0,0,0)' : style.fill, width: 1 });
        }
    }

    if (selection) {
        stroke = new Stroke({ color: 'rgba(255, 228, 58, 0.9)', width: 1.5 });
    }

    /* Apply styles according to feature's geometry type */
    switch (style.geom) {
        case 'MultiPoint': case 'Point': newStyle = { image: new Circle({ radius: style.radius, fill, stroke }) }; break;
        case 'MultiPolygon': case 'Polygon': newStyle = { fill, stroke }; break;
        case 'LineString': case 'MultiLineString': newStyle = { stroke: stroke }; break;
    };

    if (feature.get('municipalityName') && resolution <= 300 && labels) {
        const text = new Text({
            textAlign: 'center',
            textBaseline: 'ideographic',
            font: '600 13px Verdana',
            text: feature.get('municipalityName'),
            stroke: new Stroke({ color: 'rgb(0,0,0)', width: 5 }),
            fill: new Fill({ color: 'rgb(255,255,255)' }),
            offsetX: 5,
            offsetY: 5,
            placement: 'point',
            maxAngle: 0,
            overflow: true,
            rotation: 0
        })

        const geometry = function (feature) {
            var geometry = feature.getGeometry();
            if (geometry.getType() === 'MultiPolygon') {
                // Only render label for the widest polygon of a multipolygon
                var polygons = geometry.getPolygons();
                var widest = 0;
                for (var i = 0, ii = polygons.length; i < ii; ++i) {
                    var polygon = polygons[i];
                    var width = getWidth(polygon.getExtent());
                    if (width > widest) {
                        widest = width;
                        geometry = polygon;
                    }
                }
            }
            return geometry;
        }

        labelStyle = new Style({ geometry, text });

    }

    if (!time) {
        featureStyle = new Style(newStyle);
    } else {
        if (style.timeField) {
            if (feature.get(style.timeField) === time) {
                featureStyle = new Style(newStyle);
            } else {
                featureStyle = null;
            }
        } else {
            featureStyle = new Style(newStyle);
        }
    }

    if (!relativeToArea && !['Ei tilastoa', 'No statistics', 'Ei tilastoa_km2', 'No statistics_km2'].includes(style.fieldSelection)) {
        featureStyle = new Style({
            fill: new Fill({
                color: 'rgba(255,255,255,0.85)'
            }), stroke: new Stroke({
                color: 'rgba(0,115,176,0.66)', width: 0.5
            })
        })
        markerStyle = new Style({
            geometry: function (feature) {
                let extent = feature.getGeometry().getExtent();
                let coordinates = getCenter(extent);
                return new Point(coordinates);
            },
            image: new Circle({ radius: Math.sqrt(feature.get(style.fieldSelection)/500 + 4), fill, stroke })
        });
    }

    if (markerStyle) {
        if (labelStyle) {
            return [featureStyle, markerStyle, labelStyle];
        }
        else {
            return [featureStyle, markerStyle];
        }
    } else {
        if (labelStyle) {
            return [featureStyle, labelStyle];
        }
        else {
            return [featureStyle];
        }
    }
}

export default createStyle;