import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma-client";

interface SiloQueryParams {
    tokenSymbol?: string;
    aprBorrowMin?: string;
    aprBorrowMax?: string;
    aprDepositMin?: string;
    aprDepositMax?: string;
    tvlMin?: string;
    tvlMax?: string;
    utilizationMin?: string;
    utilizationMax?: string;
    riskLevel?: string; // LOW, MEDIUM, HIGH
    ltvMin?: string;
    ltvMax?: string;
    liquidationThresholdMin?: string;
    liquidationThresholdMax?: string;
    availableToBorrowMin?: string;
    availableToBorrowMax?: string;
    platformId?: string;
    marketBaseSymbol?: string;
    marketBridgeSymbol?: string;
    sortBy?: string; // e.g., aprBorrow, tvl
    orderBy?: string; // e.g., asc, desc
    page?: string;
    limit?: string;
  }
 export const getPools = expressAsyncHandler( async (req, res) =>  {
   const query = req.query as SiloQueryParams; 
    const filters : any = {}

      // Token Filtering

    if (query.tokenSymbol) {
        filters.token = { symbol: query.tokenSymbol };
      }

   // APR Borrow Filters
   if (query.aprBorrowMin || query.aprBorrowMax) {
    filters.aprBorrow = {};
    if (query.aprBorrowMin) filters.aprBorrow.gte = Number(query.aprBorrowMin);
    if (query.aprBorrowMax) filters.aprBorrow.lte = Number(query.aprBorrowMax);
  }

   // APR Deposit Filters
   if (query.aprDepositMin || query.aprDepositMax) {
    filters.aprDeposit = {};
    if (query.aprDepositMin) filters.aprDeposit.gte = Number(query.aprDepositMin);
    if (query.aprDepositMax) filters.aprDeposit.lte = Number(query.aprDepositMax);
  }

   // TVL Filters
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

  // Risk Level Filter
  if (query.riskLevel) {
    filters.riskLevel = query.riskLevel.toUpperCase();
  }

  // LTV Filters
  if (query.ltvMin || query.ltvMax) {
    filters.ltv = {};
    if (query.ltvMin) filters.ltv.gte = Number(query.ltvMin);
    if (query.ltvMax) filters.ltv.lte = Number(query.ltvMax);
  }

  // Liquidation Threshold Filters
  if (query.liquidationThresholdMin || query.liquidationThresholdMax) {
    filters.liquidationThreshold = {};
    if (query.liquidationThresholdMin) filters.liquidationThreshold.gte = Number(query.liquidationThresholdMin);
    if (query.liquidationThresholdMax) filters.liquidationThreshold.lte = Number(query.liquidationThresholdMax);
  }

  // Available to Borrow Filters
  if (query.availableToBorrowMin || query.availableToBorrowMax) {
    filters.availableToBorrow = {};
    if (query.availableToBorrowMin) filters.availableToBorrow.gte = Number(query.availableToBorrowMin);
    if (query.availableToBorrowMax) filters.availableToBorrow.lte = Number(query.availableToBorrowMax);
  }

  // Platform Filter
  if (query.platformId) {
    filters.platformId = query.platformId;
  }

  // Market Filters
  if (query.marketBaseSymbol || query.marketBridgeSymbol) {
    filters.marketBase = { symbol: query.marketBaseSymbol };
    filters.marketBridge = { symbol: query.marketBridgeSymbol };
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
// Query the database
const silos = await prisma.silo.findMany({
    where: filters,
    include: {
      token: { select: { symbol: true, name: true, tokenAddress : true } },
      marketBase: { select: { name: true,  } },
      marketBridge: { select: { name: true } },
    },
    orderBy,
    skip,
    take: limit,
  });

  // Count total items for pagination
  const totalSilos = await prisma.silo.count({ where: filters });
  res.status(200).json({
    data: silos,
    meta: {
      totalSilos,
      page,
      totalPages: Math.ceil(totalSilos / limit),
      limit,
    },
  });
} catch (error) {
   res.status(400).json(error) 
}
})



