var request = require('request');
import WKT from 'ol/format/WKT.js';
import { EPSG3067 } from './components/map/projection/projections';

let blacklist = ['properties', 'geom', 'thegeom', 'GEOM', 'WKT', 'wkt', 'Wkt', 'geometry', 'the_geom', 'geog'];

let variables = ["?wkt", "?municipalityCode", "?municipalityName", "?regionName", "?regionCode", "?regionNUTS", "?areaName", "?areaCode", "?areaNUTS", "?landArea"];
let prefixes = {
    "owl": "http://www.w3.org/2002/07/owl#",
    "spatial": "http://jena.apache.org/spatial#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "mmlau": "http://paikkatiedot.fi/def/au/ont#",
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "geof": "http://www.opengis.net/def/function/geosparql#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "sf": "http://www.opengis.net/ont/sf#",
    "jhs": "http://paikkatiedot.fi/jhs-skeema#",
    "schema": "http://schema.org/",
    "void": "http://rdfs.org/ns/void#",
    "ogc": "http://www.opengis.net/ont/geosparql#",
    "au": "http://inspire.ec.europa.eu/ont/au#",
    "su": "http://inspire.ec.europa.eu/ont/su#",
    "so": "http://paikkatiedot.fi/so/igalod/kunnat2019/",
    "xkos": "http://rdf-vocabulary.ddialliance.org/xkos#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "class": "http://data.stat.fi/classifications/v1/classifications#",
    "corr": "http://data.stat.fi/classification/v1/correspondenceTables#",
    "dbo": "http://dbpedia.org/ontology/"
}

const executeQuery = (input) => {

    let clauses = [
        {
            triples: [
                ['?area', 'skos:inScheme', `class:suuralue_1_${input.munipYear}0101`],
                ['?area', 'skos:notation', '?areaCode'],
                ['?area', 'skos:prefLabel', '?areaName'],
                ['?area', 'skos:closeMatch', '?areaNUTS'],
                ['?region', 'skos:inScheme', `class:maakunta_1_${input.munipYear}0101`],
                ['?region', 'skos:notation', '?regionCode'],
                ['?region', 'skos:closeMatch', '?regionNUTS'],
                ['?region', 'skos:prefLabel', '?regionName'],
                ['?avainpari', 'xkos:targetConcept', '?area, ?region'],
                ['?avainpari', 'xkos:sourceConcept', '?municipality'],
                ['?municipality', 'skos:inScheme', `class:kunta_1_${input.munipYear}0101`],
                ['?municipality', 'skos:notation', '?municipalityCode'],
                ['?municipality', 'skos:prefLabel', '?municipalityName'],
                ['?municipality', 'su:AreaStatisticalUnit.administrativeUnit', '?so'] // MML:lle koodi
            ],
            filters: [
                { target: '?municipalityCode', value: input.munips, operator: 'IN' },
                { target: '?municipalityName', value: input.language, operator: `=`, func: 'lang' },
                { target: '?regionName', value: input.language, operator: `=`, func: 'lang' },
                { target: '?areaName', value: input.language, operator: `=`, func: 'lang' }
            ]
        },
        {
            service: 'http://193.167.189.160/igalod/fuseki/ds/query', // MML
            triples: [
                //    ['?geom', 'spatial:intersectBox', `(${input.extent[1]} ${input.extent[0]} ${input.extent[3]} ${input.extent[2]})`],
                ['?so', 'ogc:hasGeometry', '?geom'],
                ['?so', 'dbo:landArea', '?landArea'],
                ['?geom', 'mmlau:scale', `${input.scale}`],
                ['?geom', 'mmlau:hasSeaAreas', `${input.sea}`],
                ['?geom', 'ogc:asWKT', '?wkt']
            ]
        }
    ]

    const parseSparQL = (prefixes, variables, clauses) => {
        let prefs = Object.keys(prefixes).map(key => `PREFIX ${key}: <${prefixes[key]}>`).join('\n');
        let select = `SELECT ${variables.map(variable => `${variable}`).join(' ')}`;
        let queryString = '';
        clauses.map((clause, index) => {
            if (clause.service) {
                queryString = `${queryString}\n SERVICE <${clause.service}> {\n`;
            }
            if (clause.graph) {
                queryString = `${queryString}\n GRAPH <${clause.graph}> {`;
            }
            queryString += clause.triples.map(triple => `${triple.join(' ')} .`).join('\n');

            if (clause.filters && clause.filters.length !== 0) {
                let filterString = `\n ${clause.filters.map((filter, filterIndex) => {
                    return `FILTER(${filter.func ? filter.func + '(' + filter.target + ')' : filter.target} ${filter.operator} ${Array.isArray(filter.value) ? `(${filter.value.map(val => `'${val}'`)})` : `'${filter.value}'`}) .`
                }).join('\n')}`;
                queryString = `${queryString} ${filterString} \n`;
            }

            if (clause.graph) {
                queryString = `${queryString}\n}`;
            }
            if (clause.service) {
                queryString = `${queryString}\n}`;
            }

        })
        let query = `query=${encodeURI(`${prefs}\n\n${select}\nWHERE {\n${queryString}\n}`)}`
        return query;
    }

    const sparQL = new Promise((resolve, reject) => {

        const options = {
            url: 'https://statfin-rdf-dev.azurewebsites.net/igalod/query',
            method: 'POST',
            headers: { 'Accept': 'application/sparql-results+json' },
            form: parseSparQL(prefixes, variables, clauses)
        }

        request(options, function (error, response, body) {

            if (error) {
                reject({ error: error })
            } else {
                let json = JSON.parse(body);
                let results = json.results;
                let features = parseFeatures(results.bindings);
                resolve({ features })
            }
        })
    })

    const parseFeatures = rawFeatures => {
        const format = new WKT();
        let wkt = rawFeatures.map(binding => binding.wkt.value) || '';
        let keys = Object.keys(rawFeatures[0]).map(key => !blacklist.includes(key) && key);
        let features = [];

        wkt.forEach(geometry => {
            features.push(format.readFeature(geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: EPSG3067
            }));
        })

        features.forEach((feature, index) => {
            keys.forEach(key => {
                if (rawFeatures[index][key] !== undefined) {
                    feature.set(key, !['regionNUTS','areaNUTS'].includes(key) ? rawFeatures[index][key].value : rawFeatures[index][key].value.split('.')[3])
                }
            })
        })
        return features;
    }

    const addStatsToFeatures = new Promise((resolve) => {
        sparQL.then(featureset => {
            let features = featureset.features;
            if (input.statisticCode !== 'NONE') {
                features.forEach(feature => {
                    let landArea = feature.get('landArea');
                    feature.set(input.statisticsList.find(stat => stat.code === input.statisticCode).text, input.statistics.find(stat => stat.municipalityCode === feature.get('municipalityCode')).value)
                    if (landArea) {
                        feature.set(`${input.statisticsList.find(stat => stat.code === input.statisticCode).text}_km2`, (input.statistics.find(stat => stat.municipalityCode === feature.get('municipalityCode')).value) / landArea);
                    }
                });
            }
            resolve({ features });
        });
    })

    return addStatsToFeatures;

}

export default executeQuery;
