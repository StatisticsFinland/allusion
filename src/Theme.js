import { createMuiTheme } from '@material-ui/core/styles';

export const dark = createMuiTheme({
    palette: {
        type: 'dark',
        slider: '#f4e542',
        primary: {
            main: 'rgb(0,115,176)'
        },
        secondary: {
            main: 'rgb(225,23,118)'
        }
    },
   /* typography: {
        useNextVariants: true,
    }*/
});

export const light = createMuiTheme({
    palette: {
        type: 'light',
        slider: '#c51162',
        primary: {
            main: 'rgb(0,115,176)'
        },
        secondary: {
            main: 'rgb(225,23,118)'
        }
    },
    /* typography: {
        useNextVariants: true,
    } */
});