"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testingController_1 = require("../controller/testingController");
const router = express_1.default.Router();
router.route("/").get(testingController_1.testGetLtv);
exports.default = router;
