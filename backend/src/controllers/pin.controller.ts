import { Request, Response } from "express";
import { parseId } from "../lib/parseId";
import * as pinService from "../services/pin.service";

export async function list(req: Request, res: Response) {
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  res.json(await pinService.listPins(req.userId!, tag));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await pinService.createPin(req.userId!, req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await pinService.updatePin(req.userId!, parseId(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await pinService.deletePin(req.userId!, parseId(req.params.id));
  res.status(204).send();
}