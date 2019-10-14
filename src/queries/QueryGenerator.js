const QueryGenerator = {
  regionMunQuery(lan, year) {
    return `PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX class: <http://data.stat.fi/classifications/v1/classifications#>

      SELECT ?municipalityCode ?municipalityName ?regionName ?regionCode ?regionNUTS ?areaName ?areaCode ?areaNUTS
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
  }
};

export default QueryGenerator;
