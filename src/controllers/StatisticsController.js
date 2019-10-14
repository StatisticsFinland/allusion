const StatisticsController = {

  urlGenerator(lan = 'fi', year = 2019) {
    return `https://pxnet2.stat.fi/PXWeb/api/v1/${lan}/Kuntien_avainluvut/${year}/kuntien_avainluvut_2019_aikasarja.px`;
  },

  getStatistics(lan, year) {
    const url = this.urlGenerator(lan, year);
    return fetch(url);
  },

  getQueryStatistics(lan, year, munips, statCode, statYear) {
    const url = this.urlGenerator(lan, year);
    const area = `Alue ${year}`;
    const format = 'json-stat';

    const query = `{"query":[{"code": "${area}","selection":{"filter":"item","values":[${munips.map(mun => `"${mun}"`).join(',')}]}},{"code":"Tiedot","selection":{"filter":"item","values":["${statCode}"]}},{"code":"Vuosi","selection":{"filter":"item","values":${Array.isArray(statYear) ? statYear.map(sy => `"${sy}"`) : `["${statYear}"]`}}}],"response":{"format": "${format}"}}`;

    const request = new Request(url, {
      method: 'POST',
      body: query
    });

    return fetch(request);
  }
};

export default StatisticsController;
