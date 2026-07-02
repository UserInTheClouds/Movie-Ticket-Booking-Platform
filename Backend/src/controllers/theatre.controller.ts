import { type Request, type Response } from 'express';
import Theatre from '../models/theatre.js';

export const getAllTheatres = async (req: Request, res: Response) => {
  try {
    const theatres = await Theatre.find();
    res.json(theatres);
  } catch (err) {
    console.error("Error fetching theatres:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching theatres.' });
  }
};

export const getTheatreById = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
    res.json(theatre);
  } catch (err) {
    console.error("Error fetching theatre by ID:", err);
    res.status(500).json({ error: 'An unexpected error occurred while fetching theatre.' });
  }
};
