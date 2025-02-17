//import expressAsyncHandler from "express-async-handler"
import asyncHandler from "express-async-handler"
import prisma from "../prisma-client"


export const getSilos = asyncHandler ( async (req, res) =>  {
     const {kalamu, mchuzi, kima} = req.query
 try {
    const markets = await prisma.market.findMany()
    res.status(200).json(markets)
 } catch (error) {
    res.status(400).json(error)
 }  
})