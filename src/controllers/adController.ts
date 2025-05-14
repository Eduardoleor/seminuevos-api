import { Request, Response } from "express";
import { publishAdOnSemiNuevos } from "../services/puppeteerService";
import { logger } from "../utils/logger";

export const publishAd = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { price, description } = body;

    const data = await publishAdOnSemiNuevos(price, description);
    res.status(200).json({
      message: "Anuncio publicado exitosamente",
      data,
    });
  } catch (error) {
    logger.error("Error al publicar el anuncio", error);
    res.status(500).json({
      error: "Error al publicar el anuncio",
      details: error instanceof Error ? error.message : String(error),
      time: new Date().toISOString(),
    });
  }
};
