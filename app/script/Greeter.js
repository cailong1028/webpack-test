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
import sassTest from '../style/sass-test.scss';
import lessTest from '../style/less-test.less';

class Greeter extends Component{
    render() {
        return (
            <div className={GreeterStyle.greeting}>
                <h1>hi colors</h1>
                {greetingConf.greetText}
                <p>
                    <div className={sassTest.test}>sass test<i className={sassTest.aaa}>嵌套显示</i></div>
                    <i className={sassTest.aaa}>元素和父级平行，但是sass调用的是嵌套的类，调用失败</i>
                </p>
                <p>
                    <i className={lessTest["less-test2"]}>less test</i>
                </p>


            </div>
        );
    }
}

export default Greeter;