"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkets = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_client_1 = __importDefault(require("../prisma-client")); // Adjust the import based on your project structure
const formatNameQuery_1 = require("../lib/formatNameQuery");
exports.getMarkets = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const filters = {};
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
        const formattedPlatformName = (0, formatNameQuery_1.formatPlatformName)(query.platformName);
        filters.platform = { name: { contains: formattedPlatformName, mode: 'insensitive' } };
    }
    // APR Filtering
    if (query.aprMin || query.aprMax) {
        if (query.aprMin)
            filters.apr.gte = Number(query.aprMin);
        if (query.aprMax)
            filters.apr.lte = Number(query.aprMax);
    }
    // Liquidation Threshold Filters
    if (query.liquidationThresholdMin || query.liquidationThresholdMax) {
        filters.liquidationThreshold = {};
        if (query.liquidationThresholdMin)
            filters.liquidationThreshold.gte = Number(query.liquidationThresholdMin);
        if (query.liquidationThresholdMax)
            filters.liquidationThreshold.lte = Number(query.liquidationThresholdMax);
    }
    // TVL Filtering
    if (query.tvlMin || query.tvlMax) {
        filters.tvl = {};
        if (query.tvlMin)
            filters.tvl.gte = Number(query.tvlMin);
        if (query.tvlMax)
            filters.tvl.lte = Number(query.tvlMax);
    }
    // Utilization Filters
    if (query.utilizationMin || query.utilizationMax) {
        filters.utilization = {};
        if (query.utilizationMin)
            filters.utilization.gte = Number(query.utilizationMin);
        if (query.utilizationMax)
            filters.utilization.lte = Number(query.utilizationMax);
    }
    // Sorting Logic
    const orderBy = {};
    if (query.sortBy && query.orderBy) {
        orderBy[query.sortBy] = query.orderBy === 'asc' ? 'asc' : 'desc';
    }
    // Pagination Logic
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;
    try {
        // Query the markets table with the filters
        const items = yield prisma_client_1.default.market.findMany({
            where: filters,
            include: {
                baseSilo: {
                    select: {
                        name: true,
                        siloAddress: true,
                        aprDeposit: true,
                        aprBorrow: true,
                        availableToBorrow: true,
                        utilization: true,
                        tvl: true,
                        token: {
                            select: {
                                name: true,
                                logo: true,
                                symbol: true,
                                tokenAddress: true
                            }
                        }
                    }
                },
                bridgeSilo: {
                    select: {
                        name: true,
                        siloAddress: true,
                        aprDeposit: true,
                        aprBorrow: true,
                        availableToBorrow: true,
                        utilization: true,
                        tvl: true,
                        token: {
                            select: {
                                name: true,
                                logo: true,
                                symbol: true,
                                tokenAddress: true
                            }
                        }
                    }
                },
                platform: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy,
            skip,
            take: limit,
        });
        // Count total items for pagination
        const totalMarkets = yield prisma_client_1.default.market.count({ where: filters });
        res.status(200).json({
            data: { items },
            meta: {
                totalMarkets,
                page,
                totalPages: Math.ceil(totalMarkets / limit),
                limit,
            },
        });
    }
    catch (error) {
        res.status(400).json({ error: error });
    }
}));
