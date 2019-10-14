import { platformModifierKeyOnly } from 'ol/events/condition.js';
import { DragBox } from 'ol/interaction.js';
import './dragBox.css'

let dragBox = new DragBox({ condition: platformModifierKeyOnly, minArea: 0 });

export default dragBox;