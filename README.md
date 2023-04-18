## Requirements

### Node.js

To run some TS scripts in the project, Node.js 18 is required.

```shell
# To install
$ nvm install 18

# To switch version
$ nvm use 18
```

### TS Node

```shell
$ npm install -g ts-node
```

## Run unit-tests

```shell
$ sui move test
```

## Build the project

```shell
$ sui move build
```

## Publish the package

```shell
$ sui client publish --gas-budget 30000000
```

## Interact with the contracts

```shell
$ ts-node scripts/call/claim.ts
```