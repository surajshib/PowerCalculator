const { ethers } = require("ethers");
const VOTING_CONTRACT = require("./constants/voting.json");
const STAKING_CONTRACT = require("./constants/shibStaking.json");
const TOKEN_CONTRACT = require("./constants/token.json");

const SCALING_FACTOR = 1;
const TUNING_FACTOR = 8;
const DECIMAL_MULTIPLIER = 100000;
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);

const votingContract = new ethers.Contract(
  VOTING_CONTRACT.address,
  VOTING_CONTRACT.ABI,
  provider
);

const shibStakingContract = new ethers.Contract(
  STAKING_CONTRACT.address,
  STAKING_CONTRACT.ABI,
  provider
);

const tokenContract = new ethers.Contract(
  TOKEN_CONTRACT.address,
  TOKEN_CONTRACT.ABI,
  provider
);

// omega = marketcap / sum of marketcaps of all coins
async function calculateOmega(campaignId, coinId) {
  let omega = 0;

  const details = await votingContract.getCampaignDetails(campaignId);
  const coinsLength = details[5].length;

  for (let i = 0; i < coinsLength; i++) {
    omega += Number(details[5][i]);
  }
  omega = Number(details[5][coinId]) / Number(omega);

  return omega;
}

// rho = staked | balance / total supply of
// for our calculations we will remove the divisibility factor because it will result in fractional values
async function calculateRho(
  staked,
  campaignId,
  coinId, // TODO: currently only 1 coin is supported so it will be 0
  sender
) {
  let rho;
  const details = await votingContract.getCampaignDetails(campaignId);

  if (staked) {
    const stakes = await shibStakingContract.stakes(sender);
    rho = Number(stakes[1]) / Number(details[6][coinId]);
  } else {
    const balance = await tokenContract.balanceOf(sender);
    rho = Number(balance) / Number(details[6][coinId]);
  }
  return rho;
}

// Co-relation factor = rho * (e ** (-pi/3*rho))
async function calculateCoRelationFactor(
  staked,
  campaignId,
  coinId, // TODO: currently only 1 coin is supported so it will be 0
  sender
) {
  const rho = await calculateRho(staked, campaignId, coinId, sender);

  const exp = (3.14157 / 3) * rho;

  corFactor = rho * Math.pow(2.71828, -exp);

  return corFactor;
}

async function calculateVotingPower(campaignId, sender) {
  const details = await votingContract.getCampaignDetails(campaignId);

  const coinsLength = details[5].length;
  let power = 0;

  for (let coinId = 0; coinId < coinsLength; coinId++) {
    const omega = await calculateOmega(campaignId, coinId);

    const stakedVal = await calculateCoRelationFactor(
      true,
      campaignId,
      coinId,
      sender
    );
    const unStakedVal = await calculateCoRelationFactor(
      false,
      campaignId,
      coinId,
      sender
    );
    power +=
      SCALING_FACTOR *
      (TUNING_FACTOR * stakedVal * omega +
        (10 - TUNING_FACTOR) * unStakedVal * omega);
  }

  return parseInt(power * DECIMAL_MULTIPLIER);
}

module.exports = {
  calculateOmega,
  calculateRho,
  calculateCoRelationFactor,
  calculateVotingPower,
};
