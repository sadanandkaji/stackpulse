import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.signup(email, password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  res.json(await authService.login(email, password));
}

export async function me(req: Request, res: Response) {
  res.json({ user: await authService.getUserById(req.userId!) });
}