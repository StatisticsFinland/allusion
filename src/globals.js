import chroma from 'chroma-js';
import {numericSort} from 'simple-statistics'

const scales = [
  'Viridis',
  'Greens',
  'Blues',
  'Greys',
  'Oranges',
  'Purples',
  'Reds',
  'BuGn',
  'BuPu',
  'GnBu',
  'OrRd',
  'PuBu',
  'PuBuGn',
  'PuRd',
  'RdPu',
  'YlGn',
  'YlGnBu',
  'YlOrBr',
  'YlOrRd',
  'BrBG',
  'PiYG',
  'PRGn',
  'PuOr',
  'RdBu',
  'RdGy',
  'RdYlBu',
  'RdYlGn',
  'Spectral'
];

const radii = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const strokeWidths = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5];
const possibleNumClasses = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const classLimit = 10;
const categoryLimit = 20;

const makeCopy = target => JSON.parse(JSON.stringify(target));
const adaptColor = rgba => {
  return chroma(rgba).hex() < '#888888' ? 'white' : 'black';
};

const scaleColor = (scale, n) => chroma.scale(scale).colors(n).map(color => `rgba(${chroma(color).rgba()})`);

/* Function for transforming RGBA object into a string */
const objToRGBA = color => {
  let c = color.rgb;
  let rgba = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
  return rgba;
};

/* Function for transforming an RGBA string into an object {r, g, b, a} */
const rgbaToObj = rgbaString => {
  let colors = rgbaString.substring(rgbaString.indexOf('(') + 1, rgbaString.lastIndexOf(')')).split(/,\s*/);

  return {
    r: colors[0],
    g: colors[1],
    b: colors[2],
    a: colors[3]
  }
};

const sortArrayOfObjects = key => (a, b) => {
  if (a[key] < b[key])
    return -1;
  if (a[key] > b[key])
    return 1;
  return 0;
};

const blackList = {
  map: ['id', 'ID', 'FID', 'fid', 'bbox', 'geometry', 'geom', 'regionkode', 'dagi_id', 'komkode', 'LAYERTITLE',
    'layer', 'DStkode', 'dstkode', 'fillColor'],
  mapPopOver: ['id', 'ID', 'FID', 'fid', 'bbox', 'geometry', 'geom', 'regionkode', 'dagi_id', 'komkode', 'LAYERTITLE',
    'layer', 'DStkode', 'dstkode', 'originalProperties', 'fillColor'],
  stats: ['id', 'ID', 'FID', 'fid', 'bbox', 'geometry', 'geom', 'regionkode', 'dagi_id', 'komkode', 'LAYERTITLE',
    'layer', 'DStkode', 'dstkode', 'dstnavn', 'kommune', 'zipcode', 'postinro', 'ponro', 'KODE', 'kode', 'year',
    'region', 'so', 'ds', 'municipalityCode', 'regionCode', 'municipalityName', 'regionName', 'regionNUTS', 'areaName',
    'areaCode', 'areaNUTS', 'originalProperties', 'fillColor'],
  chart: ['id', 'Id', 'ID', 'fid', 'FID', 'oid', 'OID', 'code', 'CODE', 'kode', 'KODE', 'postinro', 'ponro', 'zipcode',
    'tunniste', 'bbox', 'Bbox', 'BBOX', 'bbox ', 'so', 'ds', 'originalProperties', 'fillColor'],
  styler: ['bbox', 'geometry', 'geom'],
  quantitativeStyler: ['id', 'regionkode', 'dagi_id', 'ID', 'FID', 'fid', 'DStkode', 'dstkode', 'komkode', 'kommune',
    'originalProperties', 'fillColor']
};

const defaults = {
  alert: null,
  data: null,
  activeStep: 0,
  loading: false,
  url: 'https://www.ubigu.fi/geoserver/datatogo/wfs?service=WFS&request=GetCapabilities',
  layer: {
    service: 'WFS',
    url: '',
    tile_url: null,
    title: '',
    category: 'misc',
    visible: true,
    style: {
      styling: 'single',
      geom: 'MultiPolygon',
      fill: 'rgba(0, 0, 0, 1)',
      stroke: 'rgba(255, 255, 255, 1)',
      strokeWidth: 0.5,
      strokeVisibility: true,
      fillVisibility: true,
      radius: 5,
      method: 'equalIntervalBreaks',
      numClasses: 5,
      fieldSelection: '',
      fieldValues: [],
      fieldUnit: '',
      timeField: null,
      timeValues: null
    }
  }
};

const timeList = ['year', 'YEAR', 'Year', 'Date', 'date', 'DATE'];
const years = [...new Array(200)].map((item, index) => 1900 + index);

const isEmpty = a => Array.isArray(a) && a.every(isEmpty);
const isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const formatNum = (n, precision = 2) => {
  //TODO: if finnish '.' -> ','
  if (n && isNumeric(n)) {
    if (n % 1 === 0) {
      return n;
    } else {
      return parseFloat(n).toFixed(precision);
    }
  } else {
    return 'NaN';
  }
};

function desc(a, b, orderBy) {
  let sorted = numericSort([b[orderBy], a[orderBy]]);
  if (sorted.indexOf(b[orderBy]) < sorted.indexOf(a[orderBy])) {
    return -1;
  }
  if (sorted.indexOf(b[orderBy]) > sorted.indexOf(a[orderBy])) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

function separateThousands(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

const srs = 'EPSG:3067';

const statisticList = ['NONE', 'M411', 'M302', 'M44', 'M137', 'M152'];


const fieldAliases = [
  {
    field: 'id',
    en: 'id',
    fi: 'id'
  },
  {
    field: 'Ei tilastoa',
    en: 'No statistics',
    fi: 'Ei tilastoa'
  },
  {
    field: 'Ei tilastoa_km2',
    en: 'No statistics',
    fi: 'Ei tilastoa'
  },
  {
    field: 'No statistics_km2',
    en: 'No statistics',
    fi: 'Ei tilastoa'
  },
  {
    field: 'municipalityCode',
    en: 'Municipality ID',
    fi: 'Kuntakoodi'
  },
  {
    field: 'municipalityName',
    en: 'Municipality',
    fi: 'Kunta'
  },
  {
    field: 'regionName',
    en: 'Region',
    fi: 'Maakunta'
  },
  {
    field: 'regionCode',
    en: 'Region ID',
    fi: 'Maakuntakoodi'
  },
  {
    field: 'regionNUTS',
    en: 'Region NUTS ID',
    fi: 'Maakunnan NUTS-koodi'
  },
  {
    field: 'areaName',
    en: 'Major region',
    fi: 'Suuralue'
  },
  {
    field: 'areaCode',
    en: 'Major region ID',
    fi: 'Suuralueen koodi'
  },
  {
    field: 'areaNUTS',
    en: 'Major region NUTS ID',
    fi: 'Suuralueen NUTS-koodi'
  },
  {
    field: 'landArea',
    en: 'Land area (km2)',
    fi: 'Maapinta-ala (km2)'
  },
  {
    field: 'Väkiluku_km2',
    en: 'Population / km2',
    fi: 'Väkiluku / km2'
  },
  {
    field: 'Väkiluku',
    en: 'Population',
    fi: 'Väkiluku'
  },
  {
    field: 'Perheiden lukumäärä',
    en: 'Number of families',
    fi: 'Perheiden lukumäärä'
  },
  {
    field: 'Perheiden lukumäärä_km2',
    en: 'Number of families / km2',
    fi: 'Perheiden lukumäärä / km2'
  },
  {
    field: 'Asuntokuntien lukumäärä',
    en: 'Number of household-dwelling units',
    fi: 'Asuntokuntien lukumäärä'
  },
  {
    field: 'Asuntokuntien lukumäärä_km2',
    en: 'Number of household-dwelling units / km2',
    fi: 'Asuntokuntien lukumäärä / km2'
  },
  {
    field: 'Alueella asuvan työllisen työvoiman määrä',
    en: 'Employed labour force resident in the area',
    fi: 'Alueella asuvan työllisen työvoiman määrä'
  },
  {
    field: 'Alueella asuvan työllisen työvoiman määrä_km2',
    en: 'Employed labour force resident in the area / km2',
    fi: 'Alueella asuvan työllisen työvoiman määrä / km2'
  },
  {
    field: 'Alueella olevien työpaikkojen lukumäärä',
    en: 'Number of workplaces in the area',
    fi: 'Alueella olevien työpaikkojen lukumäärä'
  },
  {
    field: 'Alueella olevien työpaikkojen lukumäärä_km2',
    en: 'Number of workplaces in the area / km2',
    fi: 'Alueella olevien työpaikkojen lukumäärä / km2'
  },
  {
    field: 'Population',
    en: 'Population',
    fi: 'Väkiluku'
  },
  {
    field: 'Population_km2',
    en: 'Population / km2',
    fi: 'Väkiluku / km2'
  },
  {
    field: 'Number of families',
    en: 'Number of families',
    fi: 'Perheiden lukumäärä'
  },
  {
    field: 'Number of families_km2',
    en: 'Number of families / km2',
    fi: 'Perheiden lukumäärä / km2'
  },
  {
    field: 'Number of household-dwelling units',
    en: 'Number of household-dwelling units',
    fi: 'Asuntokuntien lukumäärä'
  },
  {
    field: 'Number of household-dwelling units_km2',
    en: 'Number of household-dwelling units / km2',
    fi: 'Asuntokuntien lukumäärä / km2'
  },
  {
    field: 'Employed labour force resident in the area',
    en: 'Employed labour force resident in the area',
    fi: 'Alueella asuvan työllisen työvoiman määrä'
  },
  {
    field: 'Employed labour force resident in the area_km2',
    en: 'Employed labour force resident in the area / km2',
    fi: 'Alueella asuvan työllisen työvoiman määrä / km2'
  },
  {
    field: 'Number of workplaces in the area',
    en: 'Number of workplaces in the area',
    fi: 'Alueella olevien työpaikkojen lukumäärä'
  },
  {
    field: 'Number of workplaces in the area_km2',
    en: 'Number of workplaces in the area / km2',
    fi: 'Alueella olevien työpaikkojen lukumäärä / km2'
  },
  {
    field: 'customAreaName',
    en: 'Name of the area',
    fi: 'Alueen nimi'
  },
];


export {
  statisticList,
  scales,
  radii,
  strokeWidths,
  possibleNumClasses,
  classLimit,
  makeCopy,
  adaptColor,
  defaults,
  blackList,
  sortArrayOfObjects,
  categoryLimit,
  timeList,
  years,
  isNumeric,
  formatNum,
  isEmpty,
  stableSort,
  getSorting,
  objToRGBA,
  rgbaToObj,
  scaleColor,
  srs,
  separateThousands,
  fieldAliases
}
