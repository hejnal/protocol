#!/usr/bin/env bash

parity \
  --chain dev --rpcport 8545 \
  --jsonrpc-apis web3,eth,pubsub,net,parity,parity_pubsub,traces,rpc,secretstore,signer \
  --author=0x00a329c0648769a73afac7f9381e08fb43dbea72 \
  --unlock=0x00a329c0648769a73afac7f9381e08fb43dbea72 \
  --password=./scripts/empty.txt --force-ui

