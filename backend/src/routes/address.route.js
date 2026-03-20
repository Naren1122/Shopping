import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.route("/").get(getAddresses).post(addAddress);

router.route("/:id").put(updateAddress).delete(deleteAddress);

router.patch("/:id/default", setDefaultAddress);

export default router;
