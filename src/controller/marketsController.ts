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
    if (query.aprMin) filters.apr.gte = Number(query.aprMin);
    if (query.aprMax) filters.apr.lte = Number(query.aprMax);
  }

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

  // Utilization Filters
  if (query.utilizationMin || query.utilizationMax) {
    filters.utilization = {};
    if (query.utilizationMin) filters.utilization.gte = Number(query.utilizationMin);
    if (query.utilizationMax) filters.utilization.lte = Number(query.utilizationMax);
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
  tvl : true
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
            tvl : true
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
