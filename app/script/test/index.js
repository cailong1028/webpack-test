import {createStore} from 'redux';

function counter(state = 10, action){
    switch(action.type){
        case 'increment': return state+1;
        case 'decrement': return state-1;
        default: return state;
    }
}

let store = createStore(counter);

store.subscribe(() => {
    console.log('store --> '+store.getState());
});

store.dispatch({type: 'increment'});
store.dispatch({type: 'increment'});
store.dispatch({type: 'decrement'});