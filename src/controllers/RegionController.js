/* Controller for fetching municipality / region related information*/

/* URL for feching regions and municipalities (MML) */
const baseUrl = 'https://statfin-rdf-dev.azurewebsites.net/igalod/query';

const RegionController = {
  getRegionsAndMunicipalities(sparqlQuery) {
    const request = new Request(baseUrl, {
      method: 'POST',
      body: new URLSearchParams(`query=${sparqlQuery}`),
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    });

    return fetch(request);
  }
};

export default RegionController;
