//redux
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

//react
import React from 'react';
import { render } from 'react-dom';

//react-redux
import { connect, Provider } from 'react-redux';

var reducer = function (state = 0, action) {
  switch (action.type) {
    case 'ADD':
      return state + action.payload;
    case 'REM':
      if (state <= action.payload) return 0;
      else return state - action.payload;
    default:
      return state;
  }
}

//actions
function add(payload) { return {type:'ADD',payload} };
function rem(payload) { return {type:'REM',payload} };

var store = createStore(reducer,applyMiddleware(thunk));

//we have a store with a reducer and some actions.

//the problem is we need to bind the actions to the component props.
//and we need to bind the reducer store state to component props (this.props...)
//everytime the reducer will return a new state - our component will rerender.

//we use react-redux to connect our redux things to the component

//connect accept two arguments each can left null
//a callback function get store states as first argument. it returns a object with the map to props.
//2. we can pass actions we want to have available inside the component with this.props
//we cant use them directly without becaus the internal redux things are not bound
//eg dispatch getState

//create our component. there are props used - we bind them with connect.
//have a look at the connect function first
var AppComponent = React.createClass({
  componentWillMount: function () {
    //lets add something to the counter
    this.props.add(100);
  },
  handleClickAdd: function () {
    this.props.add(5);
  },
  handleClickRem: function () {
    this.props.rem(5);
  },
  render: function () {
    var { count } = this.props;
    return (
      <section>
        <button onClick={this.handleClickRem}>-5</button>
        <span style={{width:"50px",textAlign:"center",display:"inline-block"}}>{count}</span>
        <button onClick={this.handleClickAdd}>+5</button>
      </section>
    );
  }
});
//1. we want to have the count reducer state available as this.props.count
//2. we want to have the add action accessable with this.props.add
//3. we want to have the rem action accessable with this.props.rem
var AppComponent = connect(
  function (state) { return {count:state}; },
  {add,rem}
)(AppComponent);

//we created our component lets use it. we use a toplevel provider and pass our store as prop.
render(<Provider store={store}><AppComponent /></Provider>,
  document.getElementById('container')
);

