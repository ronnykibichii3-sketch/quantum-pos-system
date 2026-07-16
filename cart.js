const express = require("express");
const prisma = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { storeId, terminalId } = req.body;

  const cart = await prisma.cart.create({
    data: {
      storeId,
      terminalId,
      status: "OPEN"
    }
  });

  res.json(cart);
});

module.exports = router;
"@