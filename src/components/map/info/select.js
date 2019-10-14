import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition.js'; 

/*, pointerMove, altKeyOnly*/
/* reference to currently selected interaction */

// select interaction working on "click"
let select = new Select({
    condition: click,
    filter: (feature, layer) => {
        return layer.type === 'VECTOR' || layer.get('type' === 'VECTOR_LAYER')
    }
});

// select interaction working on "pointermove"
/*
let selectPointerMove = new Select({
    condition: pointerMove, style
});
let selectAltClick = new Select({
    condition: mapBrowserEvent => click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent)
});
*/
/*
let changeInteraction = (select, value, map) => {
    if (select !== null) {
        map.removeInteraction(select);
    }
    switch (value) {
        case 'singleclick': select = selectSingleClick; break;
        //case 'click': seelct = selectClick; break;
        // case 'pointermove': select = selectPointerMove; break;
        // case 'altclick': select = selectAltClick; break;
        default: select = null; break;
    }

    if (select !== null) {
        map.addInteraction(select);
        select.on('select', event => {
            console.log(event.target.getFeatures().getLength());
        });
    }
};
*/
export default select;