import expressAsyncHandler from 'express-async-handler';
import prisma from '../prisma-client'; // Adjust the import based on your project structure
import { formatPlatformName } from '../lib/formatNameQuery';


interface MarketQueryParams {
  marketId?: string;
  marketName?: string;
  platformName? : string
  baseAssetSymbol?: string;
  bridgeAssetSymbol?: string;
  aprMin?: string;
  aprMax?: string;
  liquidationThresholdMin?: string;
  liquidationThresholdMax?: string;
  tvlMin?: string;
  tvlMax?: string;
  utilizationMin?: string;
  utilizationMax?: string;
    sonicXpMultiplierMin?: string;
    sonicXpMultiplierMax?: string;
    sonicXpBaseMultiplierMin?: string;
    sonicXpBaseMultiplierMax?: string;
    siloRewardAPRMin?: string;
    siloRewardAPRMax?: string;
    sTokenRewardAPRMin?: string;
    sTokenRewardAPRMax?: string;
  sortBy?: string; // e.g., apr, tvl
  orderBy?: string; // e.g., asc, desc
  page?: string;
  limit?: string;
}



export const getMarkets = expressAsyncHandler(async (req, res) => {
  const query = req.query as MarketQueryParams;
  const filters: any = {};

  // Market Filtering
  if (query.marketId) {
    filters.marketId = query.marketId;
  }

  if (query.marketName) {
    filters.name = { contains: query.marketName, mode: 'insensitive' };
  }

  if (query.baseAssetSymbol) {
    filters.baseAsset = { symbol: query.baseAssetSymbol };
  }

  if (query.bridgeAssetSymbol) {
    filters.bridgeAsset = { symbol: query.bridgeAssetSymbol };
  }

     // Filter by platform name
  if (query.platformName) {
    const formattedPlatformName = formatPlatformName(query.platformName);
    filters.platform = { name: { contains: formattedPlatformName, mode: 'insensitive' } };
  }
// APR Filtering
if (query.aprMin || query.aprMax) {
  filters.baseSilo = filters.baseSilo || {};  // Ensure baseSilo is defined if not already

  if (query.aprMin) filters.baseSilo.aprDeposit = filters.baseSilo.aprDeposit || {};  // Ensure aprDeposit exists
  if (query.aprMin) filters.baseSilo.aprDeposit.gte = Number(query.aprMin);

  if (query.aprMax) filters.baseSilo.aprDeposit = filters.baseSilo.aprDeposit || {};  // Ensure aprDeposit exists
  if (query.aprMax) filters.baseSilo.aprDeposit.lte = Number(query.aprMax);
}


console.log("filters", JSON.stringify(filters, null, 2))
  // Liquidation Threshold Filters
  if (query.liquidationThresholdMin || query.liquidationThresholdMax) {
    filters.liquidationThreshold = {};
    if (query.liquidationThresholdMin) filters.liquidationThreshold.gte = Number(query.liquidationThresholdMin);
    if (query.liquidationThresholdMax) filters.liquidationThreshold.lte = Number(query.liquidationThresholdMax);
  }

  // TVL Filtering
  if (query.tvlMin || query.tvlMax) {
    filters.tvl = {};
    if (query.tvlMin) filters.tvl.gte = Number(query.tvlMin);
    if (query.tvlMax) filters.tvl.lte = Number(query.tvlMax);
  }


  // Sorting Logic
  const orderBy: any = {};
  if (query.sortBy && query.orderBy) {
    orderBy[query.sortBy] = query.orderBy === 'asc' ? 'asc' : 'desc';
  }

  // Pagination Logic
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  try {
    // Query the markets table with the filters
    const items = await prisma.market.findMany({
      where: filters,
      include : {
      baseSilo : {
select : {
  name : true,
  siloAddress : true,
  aprDeposit : true,
  aprBorrow : true,
  availableToBorrow : true,
  utilization : true,
  tvl : true,
  token : {
    select : { 
      name : true,
      logo : true,
      symbol : true,
      tokenAddress : true
    }
  },
  siloRewards : {
     select : {
      xpPerDollarBorrow : true,
      xpPerDollarDeposit : true,
      sTokenRewardAPR : true,
      siloRewardAPR : true,
      sonicXpMultiplier : true,
      sonicXpMultiplierAction : true
     }
  }
}
},
        bridgeSilo : {
          select : {
            name : true,
            siloAddress : true,
            aprDeposit : true,
            aprBorrow : true,
            availableToBorrow : true,
            utilization : true,
            tvl : true,
            token : {
              select : {
                name : true,
                logo : true,
                symbol : true,
                tokenAddress : true
              }
            },
            siloRewards : {
              select : {
               xpPerDollarBorrow : true,
               xpPerDollarDeposit : true,
               sTokenRewardAPR : true,
               siloRewardAPR : true,
               sonicXpMultiplier : true,
               sonicXpMultiplierAction : true
              }
           }
          }
          },
        platform : {
          select : {
            name : true
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    });

    // Count total items for pagination
    const totalMarkets = await prisma.market.count({ where: filters });
   

    res.status(200).json({
      data: {items},
      meta: {
        totalMarkets,
        page,
        totalPages: Math.ceil(totalMarkets / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

interface SiloRewards {
   siloId? : string
}

export const getSiloRewards  = expressAsyncHandler( async (req, res) => {
  try {
    const { siloId } = req.query as { siloId?: string };

    // Validate query params
    if (!siloId) {
       res.status(400).json({ message: "siloId is required" });
    }

    // Fetch rewards for the given silo
    const items = await prisma.silo.findUnique({
      where: { siloAddress: siloId },
      select: {
        name: true,
        aprBorrow : true,
        aprDeposit : true,
        siloRewards: true
      }
    });

    // Handle not found case
    if (!items) {
     res.status(404).json({ message: "Silo not found" });
    }

    res.status(200).json({ data : {items} });
  } catch (error) {
    console.error("Error fetching silo rewards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




