/*global module, require*/
//no-babel
// const greetingConf = require('./conf/greeting');
// module.exports = function () {
//     let greet = document.createElement('div');
//     greet.textContent = greetingConf.greetText;
//     return greet;
// };

//use babel
import React, {Component} from 'react';
import greetingConf from '../conf/greeting';

import GreeterStyle from '../style/Greeter.css';

class Greeter extends Component{
    render() {
        return (
            <div className={GreeterStyle.root}>
                <h1>red color</h1>
                {greetingConf.greetText}
            </div>
        );
    }
}

export default Greeter;