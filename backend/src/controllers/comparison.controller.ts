import { Request, Response } from "express";
import { parseId } from "../lib/parseId";
import * as comparisonService from "../services/comparison.service";

export async function list(req: Request, res: Response) {
  res.json(await comparisonService.listComparisons(req.userId!));
}

export async function get(req: Request, res: Response) {
  res.json(await comparisonService.getComparison(req.userId!, parseId(req.params.id)));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await comparisonService.createComparison(req.userId!, req.body));
}

export async function update(req: Request, res: Response) {
  res.json(await comparisonService.updateComparison(req.userId!, parseId(req.params.id), req.body));
}

export async function remove(req: Request, res: Response) {
  await comparisonService.deleteComparison(req.userId!, parseId(req.params.id));
  res.status(204).send();
}