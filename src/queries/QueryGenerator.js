const QueryGenerator = {
  regionMunQuery(lan, year) {
    return `PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX class: <http://data.stat.fi/classifications/v1/classifications#>

      SELECT ?municipalityCode ?municipalityName ?regionName ?regionCode ?regionNUTS ?areaName ?areaCode ?areaNUTS ?wkt
      WHERE {
        ?area skos:inScheme class:suuralue_1_${year}0101 .
        ?area skos:notation ?areaCode .
        ?area skos:prefLabel ?areaName .
        ?area skos:closeMatch ?areaNUTS .
        ?region skos:inScheme class:maakunta_1_${year}0101 .
        ?region skos:notation ?regionCode .
        ?region skos:prefLabel ?regionName .
        ?region skos:closeMatch ?regionNUTS .
        ?avainpari xkos:targetConcept ?area, ?region .
        ?avainpari xkos:sourceConcept ?municipality .
        ?municipality skos:inScheme class:kunta_1_${year}0101 .
        ?municipality skos:notation ?municipalityCode .
        ?municipality skos:prefLabel ?municipalityName .
        FILTER(lang(?municipalityName) = '${lan}') .
        FILTER(lang(?regionName) = '${lan}') .
        FILTER(lang(?areaName) = '${lan}') .
      }`;
  },
  regionMunGeomQuery(year) {
    return `PREFIX mmlau: <http://paikkatiedot.fi/def/au/ont#>
    PREFIX ogc:   <http://www.opengis.net/ont/geosparql#>
    PREFIX so: <http://paikkatiedot.fi/so/igalod/kunnat2018/>
    PREFIX au:    <http://inspire.ec.europa.eu/ont/au#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    SELECT ?code ?wkt WHERE {
          ?so ogc:hasGeometry ?geom .
          ?so dcterms:created ?created .
          ?so au:AdministrativeUnit.nationalCode ?code .
          ?geom mmlau:scale 4500000 .
          ?geom mmlau:hasSeaAreas false .
          ?geom ogc:asWKT ?wkt .
      FILTER(YEAR(?created)=${year}) .
        }`;
  }
};


export default QueryGenerator;



