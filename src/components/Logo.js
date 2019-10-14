import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import logo from '../assets/tklogo_fi.png';
import logo_en from '../assets/tklogo_en.png';
import logo2 from '../assets/mml-logo_fi_rgb.png';
import logo2_en from '../assets/mml-logo_en_rgb.png';
import Typography from '@material-ui/core/Typography';

import { LanguageContext } from './../App';


const styles = {
    root: {
        display: 'flex',
        background: 'none',
        padding: 0,
        bottom: '0.9rem',
        left: '21.5rem'
    },
    root2: {
        display: 'flex',
        background: 'none',
        padding: 0,
        bottom: '0.9rem',
        left: '5.5rem'
    }
}

class Logo extends Component {

    render() {

        const { classes } = this.props;

        return (
            <LanguageContext.Consumer>{({ lan }) => {
                return (
                    <div className={this.props.layerDrawerVisibility ? classes.root : classes.root2} style={{ position: this.props.position || 'fixed' }} >
                        <a href='https://www.stat.fi/'
                            target='_blank'
                        ><img style={{ height: this.props.size ? this.props.size : 50 }}
                            src={lan === 'fi' ? logo : lan === 'en' ? logo_en : ''}
                            alt='Map provider logo'
                        ></img></a>
                        <a href='https://www.maanmittauslaitos.fi/'
                            target='_blank'
                        ><img style={{ height: this.props.size ? this.props.size : 50, paddingTop: 10 }}
                            src={lan === 'fi' ? logo2 : lan === 'en' ? logo2_en : ''}
                            alt='Map provider logo II'
                        ></img></a>
                        <Typography style={{ fontSize: 26, color: 'red', bottom: '0.5rem', paddingTop: 15, paddingLeft: 20 }}>BETA</Typography>
                    </div >
                );
            }}</LanguageContext.Consumer>
        )
    }
}

export default withStyles(styles)(Logo);
