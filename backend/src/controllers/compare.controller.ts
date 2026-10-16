import { Request, Response } from "express";
import * as compareService from "../services/compare.service";

export async function compare(req: Request, res: Response) {
  res.json(await compareService.compareDevelopers(String(req.query.users ?? "")));
}