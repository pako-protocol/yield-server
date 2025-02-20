//import expressAsyncHandler from "express-async-handler"
import asyncHandler from "express-async-handler"
import prisma from "../prisma-client"
import { formatPlatformName } from "../lib/formatNameQuery";

interface MarketQueryParams {
   vaultName?: string;
   platformName? : string
   token0Symbol?: string;
   token1Symbol?: string;
   aprMin?: string;
   aprMax?: string;
   liquidationThresholdMin?: string;
   liquidationThresholdMax?: string;
   tvlMin?: string;
   tvlMax?: string;
   utilizationMin?: string;
   utilizationMax?: string;
   sortBy?: string; // e.g., apr, tvl
   orderBy?: string; // e.g., asc, desc
   page?: string;
   limit?: string;
 }

export const getVaults = asyncHandler ( async (req, res) =>  {
   const query = req.query as MarketQueryParams;
   const filters: any = {};

    // Market Filtering
  if (query.vaultName) {
   filters.name = query.vaultName;
 }

       // Filter by platform name
    if (query.platformName) {
      const formattedPlatformName = formatPlatformName(query.platformName);
      filters.platform = { name: { contains: formattedPlatformName, mode: 'insensitive' } };
    }

    if (query.token0Symbol || query.token1Symbol) {
    filters.token0 = {symbol : {contains : query.token0Symbol, mode : "insensitive"}}
    }
 try {
    const items = await prisma.vault.findMany({
      where : filters,
      include : {
         platform : {
            select : {
               name : true
            }
         },
         token0 : {
            select : {
               name : true,
               symbol : true,
               logo : true
            }
         },
         token1 : {
            select : {
               name : true,
               symbol : true,
               logo : true,
            }
         },
      }
    })
    res.status(200).json({
      data : {items}
    })
 } catch (error) {
    res.status(400).json(error)
 }  
})