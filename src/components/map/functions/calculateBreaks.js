import { ckmeans, equalIntervalBreaks, numericSort, quantileSorted } from 'simple-statistics'

/* General function for generating class boundary values */
const calculateBreaks = (values, n, method) => {
    let allValues = values.filter(value => typeof value === 'number');
    switch (method) {
        case 'ckmeans':
            /* ckmeans returns an array of arrays with similar values - break it down to [{lowerBound: 1, upperBound: 2}, {...}] */
            return ckmeans(allValues, n).map(value => {
                return {
                    lowerBound: value[0],
                    upperBound: value[value.length - 1]
                }
            }); break;
        case 'equalIntervalBreaks':
            /* equalIntervalBreaks returns class breaks with length n+1, breaks can be arbitrary numbers. Need to figure closest numbers. */
            let temp = numericSort(allValues).reverse();
            let breaks = equalIntervalBreaks(allValues, n - 1);
            return breaks.map((value, index) => {
                return {
                    lowerBound: index === 0 ? value : temp[temp.findIndex(val => val <= value)],
                    upperBound: index === breaks.length - 1 ? value : temp[temp.findIndex(val => val < temp[temp.findIndex(val => val <= breaks[index + 1])])]
                }
            }); break;
        case 'quantiles':
            let temp1 = numericSort(allValues);
            let temp2 = numericSort(allValues).reverse();
            let quantiles = [];
            for (let i = 0; i <= n - 1; i++) {
                i === 0 ? quantiles.push(0) : quantiles.push(Number((1 / (n - 1) * i).toFixed(1)));
            }
            let breaqs = quantiles.map(q => quantileSorted(temp1, q));
            return breaqs.map((value, index) => {
                return {
                    lowerBound: index === 0 ? value : temp2[temp2.findIndex(val => val <= value)],
                    upperBound: index === breaqs.length - 1 ? value : temp2[temp2.findIndex(val => val < temp2[temp2.findIndex(val => val <= breaqs[index + 1])])]
                }
            }); break;
    }
};

export default calculateBreaks;