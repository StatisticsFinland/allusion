import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Checkbox from '@material-ui/core/Checkbox';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as _ from 'lodash';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
    },
    first: {
        marginLeft: theme.spacing.unit * 2,
        paddingTop: 0,
        paddingBottom: 0
    },
    parent: {
        paddingTop: theme.spacing.unit / 2,
        paddingBottom: theme.spacing.unit / 2,
        width: 185
    },
    grandParent: {
        paddingTop: theme.spacing.unit / 2,
        paddingBottom: theme.spacing.unit / 2,
        width: 221
    },
    subItem: {
        marginRight: theme.spacing.unit * 2
    },
    listItem: {
        paddingLeft: 0,
        opacity: 0.5
    },
    listItemTextNotActive: {
        fontSize: 15,
        color: 'black'
    },
    listItemTextActive: {
        fontSize: 15,
        color: theme.palette.primary.main
    },
    chip: {
        width: 170,
        justifyContent: 'space-between'
    }
});

class MunicipalityCatalog extends Component {

    state = {
        open: false,
        subOpen: 0,
        topOpen: 0,
        activeRegions: [],
        munids: [],
        regids: [],
        nuts: false
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    emptySelections = () => {
        this.setState({
            munids: [],
            regids: [],
            activeRegions: []
        })
        this.props.emptyMap();
    }

    handleClickSubMenu = group => this.state.subOpen === group ? this.setState({ subOpen: 0 }) : this.setState({ subOpen: group });
    handleClickTopMenu = group => this.state.topOpen === group ? this.setState({ topOpen: 0 }) : this.setState({ topOpen: group });
    hitTheNUTS = () => {
        this.setState({ nuts: !this.state.nuts })
    }
    activateSelection = munids => {
        const features = this.props.features;
        let munFeatures = features.filter(feature => munids.includes(feature.firstCode));
        let activeRegions = [...new Set(munFeatures.map(feat => feat.secondCode))];
        let regids = [];
        activeRegions.forEach(region => {
            let regMuns = features.filter(feature => feature.secondCode === region);
            if (regMuns.every(mun => munids.includes(mun.firstCode))) {
                regids.push(region)
            }
        })
        this.setState({ munids, regids, activeRegions });
    }

    addToSelection = muns => {
        let munids = _.union(this.state.munids, muns);
        this.activateSelection(munids);
        this.setState({munids}, () => this.props.changeMuns(munids));
    };

    removeFromSelection = muns => {
        let munids = _.difference(this.state.munids, muns);
        this.activateSelection(munids);
        this.setState({munids}, () => this.props.changeMuns(munids));
    }

    addRemoveMunid = (features, munid) => {
        let munids = this.state.munids;
        let region = features.find(feature => feature.firstCode === munid).secondCode;
        let regMuns = features.filter(feature => feature.secondCode === region);
        if (munids.includes(munid)) {
            munids = munids.filter(id => id !== munid);
            this.setState({ regids: this.state.regids.filter(regid => regid !== region) });
            if (!regMuns.some(regMun => munids.includes(regMun.firstCode))) {
                this.setState({ activeRegions: this.state.activeRegions.filter(activeRegion => activeRegion !== region) })
            }
        } else {
            munids.push(munid);
            !this.state.activeRegions.includes(region) && this.setState({ activeRegions: [...this.state.activeRegions, region] })
            if (regMuns.every(regMun => munids.includes(regMun.firstCode))) {
                this.setState({ regids: [this.state.regids, region] })
            }
        }
        this.setState({ munids }, () => this.props.changeMuns(munids));

    }

    addRemoveRegid = (features, region) => {
        /* filtteröi kunnat maakunnassa */
        let regMuns = features.filter(feature => feature.second === region);
        /* hae maakunnan koodi */
        let regid = regMuns[0].secondCode;
        let regMunids = regMuns.map(mun => mun.firstCode);
        let regids = this.state.regids;
        let munids = this.state.munids;
        if (regids.includes(regid)) {
            regids = regids.filter(id => id !== regid);
            munids = munids.filter(mun => !regMunids.includes(mun));
            this.setState({ activeRegions: this.state.activeRegions.filter(activeRegion => activeRegion !== regid) })
        } else {
            regids.push(regid)
            regMunids.forEach(munid => !munids.includes(munid) && munids.push(munid));
            this.setState({ activeRegions: [...this.state.activeRegions, regid] })
        }
        this.setState({ regids, munids }, () => this.props.changeMuns(munids))
    }

    createMenu = (features, txt) => {

        const { classes } = this.props;

        let grandParents = [];
        let grandGroups = [...new Set(features.map(feature => feature.third))].sort();

        grandGroups.forEach((grandGroup, grandIndex) => {

            let parents = [];
            let groups = [...new Set(features.filter(feature => feature.third === grandGroup).map(feature => feature.second))].sort();
            let grandGroupNUTS = features.find(feature => feature.third === grandGroup).thirdNUTS;

            groups.forEach((group, parentIndex) => {

                let groupItems = features.filter(feature => feature.second === group);
                let groupNUTS = groupItems[0].secondNUTS;
                groupItems.sort((a, b) => a.first < b.first ? -1 : 1)

                let children = [];

                groupItems.forEach((item, index) => {
                    children.push(
                        <div key={`div_${index}`} style={{ display: 'flex' }}>
                            <Checkbox key={`checkbox_${index}`} color='primary' style={{ paddingTop: 4, paddingBottom: 4 }} checked={this.state.munids.includes(item.firstCode)} onChange={() => this.addRemoveMunid(features, item.firstCode)}></Checkbox>
                            <ListItem
                                className={classes.first}
                                key={index}
                                dense
                                button
                                disableGutters={true}
                                aria-haspopup="true"
                                aria-controls="placesearch"
                                aria-label="Valitse kunta"
                                onClick={() => this.addRemoveMunid(features, item.firstCode)}>
                                <ListItemText key={`listitemtext_${index}`} primary={item.first} />
                            </ListItem>
                        </div>
                    )
                })

                parents.push(
                    <div key={group}>
                        {parentIndex === 0 && <Typography variant='body2' style={{ color: '#666', fontSize: 12 }}>{txt.igalod.parent}</Typography>}
                        <div style={{ display: 'flex' }}>
                            <Checkbox color='primary' style={{ paddingLeft: 0, paddingTop: 8, paddingBottom: 8 }}
                                checked={this.state.regids.includes(groupItems.find(feat => feat.second === group).secondCode)}
                                onChange={() => this.addRemoveRegid(features, group)}></Checkbox>
                            <ListItem
                                classes={{ root: classes.parent }}
                                button
                                disableGutters={true}
                                aria-haspopup="true"
                                dense
                                aria-controls="indicatorSelector"
                                aria-label={'group'}
                                onClick={() => this.handleClickSubMenu(group)}>
                                <ListItemText primary={this.state.nuts ? `${group} (${groupNUTS})` : group} classes={{ primary: this.state.activeRegions.includes(groupItems.find(feat => feat.second === group).secondCode) ? classes.listItemTextActive : classes.listItemTextNotActive }}
                                />
                                {this.state.subOpen === group ? <ExpandLess className={classes.subItem} /> : <ExpandMore className={classes.subItem} />}
                            </ListItem>
                        </div>
                        <Collapse in={this.state.subOpen === group} timeout="auto" unmountOnExit>
                            <List component="div">{children}
                            </List>
                        </Collapse>
                    </div>
                )
            })

            grandParents.push(
                <div key={grandGroup}>
                    {grandIndex === 0 && <Typography variant='body2' style={{ color: '#666', fontSize: 12 }}>{txt.igalod.grand}</Typography>}
                    <div style={{ display: 'flex' }}>
                        <ListItem
                            classes={{ root: classes.grandParent }}
                            button
                            disableGutters={true}
                            aria-haspopup="true"
                            dense
                            aria-controls="indicatorSelector"
                            aria-label={'group'}
                            onClick={() => this.handleClickTopMenu(grandGroup)}>
                            <ListItemText primary={this.state.nuts ? `${grandGroup} (${grandGroupNUTS})` : grandGroup}
                            />
                            {this.state.topOpen === grandGroup ? <ExpandLess className={classes.subItem} /> : <ExpandMore className={classes.subItem} />}
                        </ListItem>
                    </div>
                    <Collapse in={this.state.topOpen === grandGroup} timeout="auto" unmountOnExit>
                        <List component="div">{parents}
                        </List>
                    </Collapse>
                </div>
            )

        })

        return (
            <div className={classes.root}>
                <div className={classes.listRoot} >
                    <Collapse in={true} timeout="auto" unmountOnExit>
                        {this.state.activeRegions.length !== 0 &&
                            <Chip
                                clickable
                                label={txt.igalod.emptySelections}
                                onClick={() => this.emptySelections()}
                                className={classes.chip}
                                color="secondary"
                                variant="outlined"
                            />}
                        <List component="nav">{grandParents}
                        </List>
                    </Collapse>
                    <Button onClick={() => this.hitTheNUTS()} style={{ width: 200 }} color='primary'>{this.state.nuts ? txt.igalod.hideNUTS : txt.igalod.showNUTS}</Button>
                </div>
            </div>);
    }

    render() {

        return (
            this.createMenu(this.props.features, this.props.txt)
        );
    }
}

export default withStyles(styles)(MunicipalityCatalog);
