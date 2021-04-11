import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} };

  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then((response) => response.json())
      .then((json) => {
        this.setState({ transactionPoolMap: json });
      });
  };

  componentDidMount() {
    this.fetchTransactionPoolMap();

    this.intervalId = setInterval(
      this.fetchTransactionPoolMap,
      POLL_INTERVAL_MS,
    );
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  fetchMineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then(
      (response) => {
        if (response.status === 200) {
          alert('success');
          history.push('/blocks');
        } else {
          alert('The min-transactions block request did not complete.');
        }
      },
    );
  };

  render() {
    return (
      <div className="TransactionPool">
        <div>
          <Link to="/">Home</Link>
        </div>
        <h3>Transaction Pool</h3>
        {Object.values(this.state.transactionPoolMap).map((transaction) => {
          return (
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
            </div>
          );
        })}

        <hr />
        <Button onClick={this.fetchMineTransactions} variant="outline-danger">
          Mine the Transaction
        </Button>
      </div>
    );
  }
}

export default TransactionPool;
