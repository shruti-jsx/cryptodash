// updated server/api/controllers/portfolioController.ts
import { Request, Response } from "express";
import { User } from "../models/User";
import { isCoinIdValid } from "../services/coinServices";
import {
  fetchPortfolioValue,
  addPortfolioValue,
} from "../services/portfolioServices";

interface RequestUser {
  id?: string;
}

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

export const getPortfolio = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        msg: "User ID could not be extracted from req.user",
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.status(200).json({
      success: true,
      msg:
        user.portfolio.length > 0
          ? "Portfolio retrieved successfully"
          : "Portfolio is empty",
      data: user.portfolio,
    });
  } catch (err: any) {
    console.error("Failed to retrieve portfolio:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPortfolioValues = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        msg: "User ID could not be extracted from req.user",
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    console.log(user.portfolioValues);
    res.json({ success: true, data: user.portfolioValues });
  } catch (err: any) {
    console.error("Failed to retrieve portfolio values:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCoin = async (req: AuthenticatedRequest, res: Response) => {
  const { id, amount } = req.body;

  if (!req.user) {
    return res.status(400).json({
      success: false,
      msg: "User ID could not be extracted from req.user",
    });
  }

  const userId = req.user.id;
  const isValidCoinId = await isCoinIdValid(id);
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
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    const coinExists = user.portfolio.some((coin) => coin.id === id);
    if (coinExists) {
      return res.status(409).json({ success: false, msg: "Coin already exists within portfolio." });
    }

    user.portfolio.push({
      id,
      amount: numericAmount,
      addedAt: new Date() // ✅ Valid Date object
    });


    await user.save();

    const totalValue = await fetchPortfolioValue(userId);
    await addPortfolioValue(userId, totalValue);

    const io = req.app.get("socketio");
    io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });

    res.json({ success: true, message: "Coin added to portfolio successfully" });
  } catch (err: any) {
    console.error("Failed to add coin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoin = async (req: AuthenticatedRequest, res: Response) => {
  const { coinId } = req.body;

  if (!req.user) {
    return res.status(400).json({ success: false, msg: "User ID could not be extracted from req.user" });
  }

  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.portfolio = user.portfolio.filter((coin) => coin.id !== coinId);
    await user.save();

    const totalValue = await fetchPortfolioValue(userId);
    await addPortfolioValue(userId, totalValue);

    const io = req.app.get("socketio");
    io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });

    res.json({ success: true, msg: `Coin ${coinId} removed from portfolio` });
  } catch (err: any) {
    console.error("Failed to delete coin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editCoin = async (req: AuthenticatedRequest, res: Response) => {
  const { coinId, editedAmount } = req.body;

  if (!req.user) {
    return res.status(400).json({ success: false, msg: "User ID could not be extracted from req.user" });
  }

  const userId = req.user.id;

  if (!coinId || isNaN(Number(editedAmount)) || Number(editedAmount) < 0) {
    return res.status(400).json({ success: false, msg: "Invalid request" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    const coin = user.portfolio.find((c) => c.id === coinId);
    if (!coin) return res.status(404).json({ success: false, msg: "Coin not found in portfolio" });

    coin.amount = editedAmount;
    await user.save();

    const totalValue = await fetchPortfolioValue(userId);
    await addPortfolioValue(userId, totalValue);

    const io = req.app.get("socketio");
    io.emit("portfolioUpdated", { userId, portfolio: user.portfolio });

    res.json({ success: true, msg: "Coin updated successfully" });
  } catch (err: any) {
    console.error("Failed to edit coin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
