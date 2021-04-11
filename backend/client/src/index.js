import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import App from './components/App';
import Blocks from './components/Blocks';
import TransactionPool from './components/TransactionPool';
import ConductTransaction from './components/ConductTransaction';
import history from './history';
import './index.css';

render(
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/blocks" component={Blocks} />
      <Route path="/transaction-pool" component={TransactionPool} />
      <Route path="/conduct-transaction" component={ConductTransaction} />
    </Switch>
  </Router>,
  document.getElementById('root'),
);
