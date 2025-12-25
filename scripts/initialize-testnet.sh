#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/..

# This is a test environment that uses the hardhat local accounts
# Define a function to clean up and kill all children
cleanup_and_exit() {
    echo "Interrupted. Killing all child processes."
    pgrep -P $$ | xargs kill
}

(npx hardhat node) &

echo "node started waiting...."
sleep 3

npx hardhat --network localhost ignition deploy ignition/modules/MockERC20Deploy.ts
npx hardhat --network localhost ignition deploy ignition/modules/DataOracleUpgradeable.ts 
npx hardhat --network localhost test

trap "cleanup_and_exit" INT  # Ctrl+C
sleep infinity

