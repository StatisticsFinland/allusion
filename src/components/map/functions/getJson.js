const getJson = (url, data, callback) => {

    // Must encode data
    if (data && typeof (data) === 'object') {
        let y = '';
        let e = encodeURIComponent;
        for (x in data) {
            y += '&' + e(x) + '=' + e(data[x]);
        }
        data = y.slice(1);
        url += (/\?/.test(url) ? '&' : '?') + data;
    }

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader('Accept', 'application/json, text/javascript');
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState != 4) {
            return;
        }
        if (xmlHttp.status != 200 && xmlHttp.status != 304) {
            callback('');
            return;
        }
        callback(JSON.parse(xmlHttp.response));
    };
    xmlHttp.send(null);
};

export default getJson;