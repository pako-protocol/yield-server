
import { SILO_LENS, RPC_URL } from "../lib/constants";
import { ethers } from "ethers";
import LENS_ABI from "../abis/lens.json";
import prisma from "../prisma-client";

// Create an Ethers provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export const cronOnchainUpdates = async () => {
  console.log(`[cron] Job started at ${new Date().toLocaleString()}`);

  try {
    const silos = await prisma.silo.findMany();
    const siloLens = new ethers.Contract(SILO_LENS, LENS_ABI, provider);

    const updates = []; // Store updates in batch

    for (let silo of silos) {
      try {
        console.log(`[cron] Fetching data for ${silo.name}`);

        const borrowAPR = await siloLens.getBorrowAPR(silo.siloAddress);
        const depositAPR = await siloLens.getDepositAPR(silo.siloAddress);
        const maxLtv = await siloLens.getMaxLtv(silo.siloAddress);
        const getLoanThreshold = await siloLens.getLt(silo.siloAddress);


            // Format values
            const borrowAPRPercentage =
            parseFloat(ethers.utils.formatUnits(borrowAPR, 18)) * 100;
          const depositAPRPercentage =
            parseFloat(ethers.utils.formatUnits(depositAPR, 18)) * 100;
            const maxLtvPercentage =
            parseFloat(ethers.utils.formatUnits(maxLtv, 18)) * 100;
            const loanThreshouldPercentage =
            parseFloat(ethers.utils.formatUnits(getLoanThreshold, 18)) * 100;
    
            // FIXED VALUES
            const borrowDecimal = parseFloat(borrowAPRPercentage.toFixed(2));
            const depositDecimal = parseFloat(depositAPRPercentage.toFixed(2));

        console.log(
          `[cron] ${silo.name} | Borrow: ${borrowDecimal} | Deposit: ${depositDecimal} | LTV: ${maxLtvPercentage} | LT: ${loanThreshouldPercentage}`
        );

        // Store update in batch array
        updates.push(
          prisma.silo.update({
            where: { siloAddress: silo.siloAddress },
            data: {
              aprBorrow: borrowDecimal,
              aprDeposit: depositDecimal,
              liquidationThreshold: loanThreshouldPercentage,
              ltv: maxLtvPercentage,
            },
          })
        );
      } catch (error) {
        console.error(`[cron] Error updating ${silo.name}:`, error);
      }
    }

    // Execute batch updates
    await Promise.all(updates);
    console.log(`[cron] All updates completed successfully.`);
  } catch (error) {
    console.error(`[cron] Critical error:`, error);
  } finally {
    await prisma.$disconnect(); // Close Prisma connection
  }
};


































// LEGACY CODE

/*import { SILO_LENS, RPC_URL } from "../lib/constants"
import  {ethers} from "ethers";
import LENS_ABI from '../abis/lens.json'
import prisma from "../prisma-client";
// Create an Ethers provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
function logMessage() {
    console.log('Cron job executed at:', new Date().toLocaleString());
    }

export const cronOnchainUpdates =  async () => {
  const silos =  await prisma.silo.findMany()
   for(let silo of silos){
     console.log("we're running smootly", silo.name)
  
      try {
             // Step 2: Fetch APRs for each market's address
             const siloLens = new ethers.Contract(SILO_LENS, LENS_ABI, provider);
         const borrowAPR = await siloLens.getBorrowAPR(silo.siloAddress);
         const depositAPR = await siloLens.getDepositAPR(silo.siloAddress);
         const maxLtv = await siloLens.getMaxLtv(silo.siloAddress)
         const getLoanThreshould  = await siloLens.getLt(silo.siloAddress)
              // Format values
        const borrowAPRPercentage =
        parseFloat(ethers.utils.formatUnits(borrowAPR, 18)) * 100;
      const depositAPRPercentage =
        parseFloat(ethers.utils.formatUnits(depositAPR, 18)) * 100;
        const maxLtvPercentage =
        parseFloat(ethers.utils.formatUnits(maxLtv, 18)) * 100;
        const loanThreshouldPercentage =
        parseFloat(ethers.utils.formatUnits(getLoanThreshould, 18)) * 100;

        // FIXED VALUES
        const borrowDecimal = parseFloat(borrowAPRPercentage.toFixed(2));
        const depositDecimal = parseFloat(depositAPRPercentage.toFixed(2));
         console.log(`Borrow decimal of ${silo.name} is ${borrowDecimal}`)
         console.log(`Deposit decimal of ${silo.name} is ${depositDecimal}`)
         console.log(`Max ltv big n  of ${silo.name} is ${maxLtvPercentage}`)
         console.log(`Max LT big n  of ${silo.name} is ${loanThreshouldPercentage}`)

            // Update database
        await prisma.silo.update({
            where: { siloAddress: silo.siloAddress },
            data: { aprBorrow: borrowDecimal,
                 aprDeposit: depositDecimal,
                 liquidationThreshold : loanThreshouldPercentage,
                 ltv : maxLtvPercentage
                },
          });
      } catch (error) {
        console.log(error)
      }
   }
   
}*/