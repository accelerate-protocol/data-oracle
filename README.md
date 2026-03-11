# DataOracle

DataOracle is a Solidity smart contract designed to store and retrieve timestamped data with a decentralized voting mechanism to ensure integrity and prevent unauthorized changes .

## Features

* **Voting Mechanism:** Data updates require approval from a defined number of users (configured via threshold) to ensure consensus before the new value is applied .
* **Vote Integrity:** The system prevents double voting by tracking individual votes. If a voter attempts to change the value or vote again before the threshold is met, the system invalidates the vote and resets the counter .
* **Data Sanity Checks:** To maintain data stability, the oracle enforces limits on the percentage change relative to the previous value. It uses configurable maxUpPercent and maxDownPercent settings to prevent drastic data spikes .
* **Historical Records:** All valid updates are permanently stored in a historical mapping, allowing for retrieval of past data points and timestamps .

## Configuration

The contract supports role-based access control and customizable limits:

* **Threshold:** The number of votes required to update the data.
* **Percentage Limits:** maxUpPercent and maxDownPercent define the maximum allowable increase or decrease relative to the previous data point.
* **Bounds Cutoff:** A safety limit (default 10**8) is applied to disable relative checks if the current data falls below this threshold .

## Installation

### To compile (requires node 22)

```
npm install
npx hardhat compile
npx hardhat test
```

### Also there is a docker image that runs the regression tests

```
docker compose build
docker compose up
```

## Usage

* **Initialize:** Deploy the contract and call the initialize function to set the threshold and grant the VOTER_ROLE to relevant accounts.
* **Set Data:** Users with the VOTER_ROLE can call setData with the new value. The contract will track the vote count until the threshold is reached.
* **Retrieve Data:** Call getLastData() to retrieve the most recent data value and timestamp.

## License
Licensed under MIT Open Source License

