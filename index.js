const express = require("express");
const { calculateVotingPower } = require("./utils");
require("dotenv").config();

const app = express();
const port = 3000;

// https://powercalculator-1dgm.onrender.com/
// http://localhost:3000/?campaignId=0x104f1f6583520c5b5d6c24bd49605f86d140940017f04fc04d2e2cf440919873&sender=0x9c86927934f9BD0184515681C44eE73e9f05c5c9
app.get("/", async (req, res) => {
  //   res.send("Hello World!!!");
  const { campaignId, sender } = req.query;
  const votingPower = await calculateVotingPower(campaignId, sender);
  res.send({ data: votingPower });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
