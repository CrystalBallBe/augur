"use strict";

var BigNumber = require("bignumber.js");

var ten = new BigNumber(10, 10);
var decimals = new BigNumber(4, 10);
var multiple = ten.toPower(decimals);

var SECONDS_PER_DAY = 3600 * 24;

module.exports = {

  REPORTING_STATE: {
    PRE_REPORTING: "PRE_REPORTING",
    DESIGNATED_REPORTING: "DESIGNATED_REPORTING",
    OPEN_REPORTING: "OPEN_REPORTING",
    CROWDSOURCING_DISPUTE: "CROWDSOURCING_DISPUTE",
    AWAITING_NEXT_WINDOW: "AWAITING_NEXT_WINDOW",
    FINALIZED: "FINALIZED",
    FORKING: "FORKING",
    AWAITING_NO_REPORT_MIGRATION: "AWAITING_NO_REPORT_MIGRATION",
    AWAITING_FORK_MIGRATION: "AWAITING_FORK_MIGRATION",
  },

  ORDER_STATE: {
    ALL: "ALL",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    CANCELED: "CANCELED",
  },

  STAKE_TOKEN_STATE: {
    ALL: "ALL",
    UNCLAIMED: "UNCLAIMED",
    UNFINALIZED: "UNFINALIZED",
  },

  CONTRACT_INTERVAL: {
    DESIGNATED_REPORTING_DURATION_SECONDS: 3 * SECONDS_PER_DAY,
    DISPUTE_ROUND_DURATION_SECONDS: 7 * SECONDS_PER_DAY,
    CLAIM_PROCEEDS_WAIT_TIME: 3 * SECONDS_PER_DAY,
    FORK_DURATION_SECONDS: 60 * SECONDS_PER_DAY,
  },

  ZERO: new BigNumber(0),

  PRECISION: {
    decimals: decimals.toNumber(),
    limit: ten.dividedBy(multiple),
    zero: new BigNumber(1, 10).dividedBy(multiple),
    multiple: multiple,
  },
  MINIMUM_TRADE_SIZE: new BigNumber("0.01", 10),

  ETERNAL_APPROVAL_VALUE: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // 2^256 - 1

  DEFAULT_NETWORK_ID: "3",
  DEFAULT_GASPRICE: 20000000000,
  DEFAULT_MAX_GAS: "0x632ea0",
  DEFAULT_SCALAR_TICK_SIZE: "0.0001",
  DEFAULT_NUM_TICKS: {
    2: 10000,
    3: 10002,
    4: 10000,
    5: 10000,
    6: 10002,
    7: 10003,
    8: 10000,
  },

  CREATE_BINARY_MARKET_GAS: "0x5b8d80",
  CREATE_SCALAR_MARKET_GAS: "0x5b8d80",
  CREATE_CATEGORICAL_MARKET_GAS: "0x632ea0",

  CANCEL_ORDER_GAS: "0x5b8d80",
  CREATE_ORDER_GAS: "0x5b8d80",
  TRADE_GAS: "0x632ea0",

  BLOCKS_PER_CHUNK: 10,

  AUGUR_UPLOAD_BLOCK_NUMBER: "0x1",

  GET_LOGS_DEFAULT_FROM_BLOCK: "0x1",
  GET_LOGS_DEFAULT_TO_BLOCK: "latest",

  // maximum number of transactions to auto-submit in parallel
  PARALLEL_LIMIT: 5,

  TRADE_GROUP_ID_NUM_BYTES: 32,
};
