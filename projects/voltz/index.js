
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const irsPools = require('./poolsData.js');

async function tvl(timestamp, block) {
  const balances = {};

  const marginBalance = (await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: irsPools.map((pool) => ({
        params: [pool.marginEngine],
        target: pool.underlying,
    })),
    block: block,
  })).output;

  irsPools.forEach((pool) => {
    const margin = marginBalance.find(
        (result) => result.input.params[0] === pool.marginEngine
    );
    balances[pool.underlying] = BigNumber(balances[pool.underlying] || 0)
        .plus(margin.output)
        .toFixed();
  });

  return balances;
}

module.exports = {
  timetravel: true,
  ethereum: {
    tvl,
  },
  methodology: `Counts the tokens locked in the contracts to be used as collateral to either enter an intereast rate swap or to provide liquidity`,
};