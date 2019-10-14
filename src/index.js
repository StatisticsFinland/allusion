import React from 'react';
import ReactDOM from 'react-dom';
import Gateway from './Gateway';

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        React.createElement(Gateway),
        document.getElementById('app')
    );
});
