const translate = (languages, language, translations) => {
    let i = languages.indexOf(language);
    if (i > -1) {
        let T1 = JSON.parse(JSON.stringify(translations));
        let keys1 = Object.keys(T1);
        keys1.forEach(k1 => {
            if (Array.isArray(T1[k1])) {
                T1[k1] = T1[k1][i];
            }
            if (typeof (T1[k1]) === 'object' && !Array.isArray(T1[k1])) {
                let keys2 = Object.keys(T1[k1]);
                keys2.forEach(k2 => {
                    if (Array.isArray(T1[k1][k2])) {
                        T1[k1][k2] = T1[k1][k2][i];
                    }
                })
            }
        })
        return T1;
    }
};

export default translate;