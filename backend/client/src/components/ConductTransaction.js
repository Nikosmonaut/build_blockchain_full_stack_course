import React, { Component } from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component {
  state = {
    recipient: '',
    amount: 0,
  };

  updateRecipient = (event) => {
    this.setState({ recipient: event.target.value });
  };

  updateAmount = (event) => {
    this.setState({ amount: Number(event.target.value) });
  };

  conductTransaction = () => {
    const { recipient, amount } = this.state;

    fetch(`${document.location.origin}/api/transact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((response) => response.json())
      .then((json) => {
        alert(json.message || json.type);
        history.push('/transaction-pool');
      });
  };

  render() {
    return (
      <div className="ConductTransaction">
        <Link to="/">Home</Link>
        <h3>Conduct a transaction</h3>
        <FormGroup>
          <FormControl
            inputMode="text"
            placeholder="recipient"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            inputMode="text"
            placeholder="amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button variant="outline-danger" onClick={this.conductTransaction}>
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

export default ConductTransaction;
