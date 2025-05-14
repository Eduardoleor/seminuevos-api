import { Router } from "express";
import { publishAd } from "../controllers/adController";

const router = Router();

router.post("/publish", publishAd);

export { router };
