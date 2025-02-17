import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma-client";

interface TokenQueryParams {
   symbol?: string;
   aprBorrowMin?: string; // Always comes as a string in req.query
   aprBorrowMax?: string;
   aprDepositMin?: string
   aprDepositMax?: string
   tvlMin?: string;
   tvlMax?: string;
 }
 export const getTokens = expressAsyncHandler( async (req, res) =>  {
   const query = req.query as TokenQueryParams; 
    const filters : any = {}

    if (query.symbol) {
      filters.symbol = query.symbol ; 
    }

    if (query.aprBorrowMin || query.aprBorrowMax) {
      filters.silos = { some: { aprBorrow: {} } };
      if (query.aprBorrowMin) filters.silos.some.aprBorrow.gte = Number(query.aprBorrowMin);
      if (query.aprBorrowMax) filters.silos.some.aprBorrow.lte = Number(query.aprBorrowMax);
    }

    if (query.aprDepositMin || query.aprDepositMax) {
      filters.silos = { some: { aprDeposit: {} } };
      if (query.aprDepositMin) filters.silos.some.aprDeposit.gte = Number(query.aprDepositMin);
      if (query.aprDepositMax) filters.silos.some.aprDeposit.lte = Number(query.aprDepositMax);
    }

    if (query.tvlMin || query.tvlMax) {
      filters.silos = { some: { tvl: {} } };  // 👈 Ensure we filter within the related Silos
    
      if (query.tvlMin) filters.silos.some.tvl.gte = Number(query.tvlMin);
      if (query.tvlMax) filters.silos.some.tvl.lte = Number(query.tvlMax);
    }

try { 
 const items = await prisma.token.findMany({
    where : filters,
    include: {
silos : {
   select : {
      aprDeposit : true,
      aprBorrow : true,
      name : true,
      siloAddress : true
   }
}
    }
 })
 res.status(200).json({data : {items}})
} catch (error) {
   res.status(400).json(error) 
}
})



