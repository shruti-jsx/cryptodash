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
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCoin = exports.deleteCoin = exports.addCoin = exports.getPortfolioValues = exports.getPortfolio = void 0;
const User_1 = require("../models/User");
const coinServices_1 = require("../services/coinServices");
const portfolioServices_1 = require("../services/portfolioServices");
const getPortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                msg: "User ID could not be extracted from req.user",
            });
        }
        const userId = req.user.id;
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }
        res.status(200).json({
            success: true,
            msg: user.portfolio.length > 0
                ? "Portfolio retrieved successfully"
                : "Portfolio is empty",
            data: user.portfolio,
        });
    }
    catch (err) {
        console.error("Failed to retrieve portfolio:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.getPortfolio = getPortfolio;
const getPortfolioValues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                msg: "User ID could not be extracted from req.user",
            });
        }
        const userId = req.user.id;
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }
        console.log(user.portfolioValues);
        res.json({ success: true, data: user.portfolioValues });
    }
    catch (err) {
        console.error("Failed to retrieve portfolio values:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.getPortfolioValues = getPortfolioValues;
const addCoin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, amount } = req.body;
    if (!req.user) {
        return res.status(400).json({
            success: false,
            msg: "User ID could not be extracted from req.user",
        });
    }
    const userId = req.user.id;
    const isValidCoinId = yield (0, coinServices_1.isCoinIdValid)(id);
    if (!isValidCoinId) {
        return res.status(400).json({ success: false, msg: "Invalid coin ID" });
    }
    if (!amount || !id || Number(amount) < 0) {
        return res.status(400).json({
            success: false,
            msg: "Please enter a valid coin and amount.",
        });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return res.status(400).json({
            success: false,
            msg: "Please enter a valid holding amount.",
        });
    }
    try {
        const user = yield User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, msg: "User not found" });
        const coinExists = user.portfolio.some((coin) => coin.id === id);
        if (coinExists) {
            return res.status(409).json({ success: false, msg: "Coin already exists within portfolio." });
        }
        user.portfolio.push({
            id,
            amount: numericAmount,
            addedAt: new Date() // ✅ Valid Date object
        });
        yield user.save();
        const totalValue = yield (0, portfolioServices_1.fetchPortfolioValue)(userId);
        yield (0, portfolioServices_1.addPortfolioValue)(userId, totalValue);
        const io = req.app.get("socketio");
        io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });
        res.json({ success: true, message: "Coin added to portfolio successfully" });
    }
    catch (err) {
        console.error("Failed to add coin:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.addCoin = addCoin;
const deleteCoin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coinId } = req.body;
    if (!req.user) {
        return res.status(400).json({ success: false, msg: "User ID could not be extracted from req.user" });
    }
    const userId = req.user.id;
    try {
        const user = yield User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, msg: "User not found" });
        user.portfolio = user.portfolio.filter((coin) => coin.id !== coinId);
        yield user.save();
        const totalValue = yield (0, portfolioServices_1.fetchPortfolioValue)(userId);
        yield (0, portfolioServices_1.addPortfolioValue)(userId, totalValue);
        const io = req.app.get("socketio");
        io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });
        res.json({ success: true, msg: `Coin ${coinId} removed from portfolio` });
    }
    catch (err) {
        console.error("Failed to delete coin:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.deleteCoin = deleteCoin;
const editCoin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coinId, editedAmount } = req.body;
    if (!req.user) {
        return res.status(400).json({ success: false, msg: "User ID could not be extracted from req.user" });
    }
    const userId = req.user.id;
    if (!coinId || isNaN(Number(editedAmount)) || Number(editedAmount) < 0) {
        return res.status(400).json({ success: false, msg: "Invalid request" });
    }
    try {
        const user = yield User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, msg: "User not found" });
        const coin = user.portfolio.find((c) => c.id === coinId);
        if (!coin)
            return res.status(404).json({ success: false, msg: "Coin not found in portfolio" });
        coin.amount = editedAmount;
        yield user.save();
        const totalValue = yield (0, portfolioServices_1.fetchPortfolioValue)(userId);
        yield (0, portfolioServices_1.addPortfolioValue)(userId, totalValue);
        const io = req.app.get("socketio");
        io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });
        res.json({ success: true, msg: "Coin updated successfully" });
    }
    catch (err) {
        console.error("Failed to edit coin:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.editCoin = editCoin;
