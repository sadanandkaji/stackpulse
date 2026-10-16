import { Request, Response } from "express";
import * as developerService from "../services/developer.service";

export async function getDeveloper(req: Request, res: Response) {
  res.json(await developerService.getDeveloper(String(req.params.username)));
}

export async function refreshDeveloper(req: Request, res: Response) {
  res.json(await developerService.getDeveloper(String(req.params.username), true));
}