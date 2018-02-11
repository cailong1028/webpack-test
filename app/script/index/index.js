/*global require*/
//no babel
// const greet = require('./Greeter');
// document.querySelector('#root').appendChild(greet());

//use babel
import React from 'react';
import {render} from 'react-dom';
import Greeter from '../test/Greeter';

import '../../style/main.css';

render(<Greeter></Greeter>, document.getElementById('root'));