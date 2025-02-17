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
exports.getSilos = void 0;
//import expressAsyncHandler from "express-async-handler"
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_client_1 = __importDefault(require("../prisma-client"));
exports.getSilos = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { kalamu, mchuzi, kima } = req.query;
    try {
        const markets = yield prisma_client_1.default.market.findMany();
        res.status(200).json(markets);
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
