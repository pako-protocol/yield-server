
import { SILO_LENS, RPC_URL } from "../lib/constants";
import { ethers } from "ethers";
import LENS_ABI from "../abis/lens.json";
import expressAsyncHandler from "express-async-handler";

// Create an Ethers provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export const testGetLtv = expressAsyncHandler ( async (req, res) => {
    const siloLens = new ethers.Contract(SILO_LENS, LENS_ABI, provider);
    try {
      const liquidityData = await siloLens.getRawLiquidity("0x396922EF30Cf012973343f7174db850c7D265278")
      const availableToBorrow =
            parseFloat(ethers.utils.formatUnits(liquidityData, 18));

            // Format with commas and rounded to 2 decimal places
const readableBorrowAmount = availableToBorrow.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
      res.status(200).json({availableToBorrow})
    } catch (error) {
        res.status(400).json({
            error
        })
    }
})