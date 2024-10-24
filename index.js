const express = require("express");
const { calculateVotingPower } = require("./utils");
const { isError } = require("ethers");
require("dotenv").config();

const app = express();
const port = 3000;

// https://powercalculator-1dgm.onrender.com/
// http://localhost:3000/?proposalId=0x104f1f6583520c5b5d6c24bd49605f86d140940017f04fc04d2e2cf440919873&sender=0x9c86927934f9BD0184515681C44eE73e9f05c5c9
app.get("/", async (req, res) => {
  try {
    let { proposalId, sender } = req.query;

    if (!sender && proposalId) {
      let data = proposalId.split("=");
      sender = data[1];
      data = data[0].split("\\u0026");
      proposalId = data[0];
    }

    if (!proposalId || !sender) res.send({ data: 0, error: "No parameters" });
    else {
      const votingPower = await calculateVotingPower(proposalId, sender);
      res.send({ data: votingPower, testData: 10 });
    }
  } catch (e) {
    console.log(`Error caught: `, e);
    res.send({ data: 0, isError: true });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
