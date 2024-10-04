const express = require("express");
const { calculateVotingPower } = require("./utils");
const { isError } = require("ethers");
require("dotenv").config();

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  try {
    let { campaignId, sender } = req.query;

    if (!sender && campaignId) {
      let data = campaignId.split("=");
      sender = data[1];
      data = data[0].split("\\u0026");
      campaignId = data[0];
    }

    if (!campaignId || !sender) res.send({ data: 0, error: "No parameters" });
    else {
      const votingPower = await calculateVotingPower(campaignId, sender);
      res.send({ data: votingPower });
    }
  } catch (e) {
    console.log(`Error caught: `, e);
    res.send({ data: 0, isError: true });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
