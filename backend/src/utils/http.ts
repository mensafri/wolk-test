import { Response } from 'express';

function takeFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseIntegerParam(
  value: string | string[] | undefined,
  fieldName: string,
  res: Response
) {
  const normalizedValue = takeFirstValue(value);
  const parsed = Number.parseInt(String(normalizedValue), 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  res.status(400).json({ error: `Invalid ${fieldName}` });
  return null;
}

export function parseIntegerBody(value: unknown, fieldName: string, res: Response) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  res.status(400).json({ error: `Invalid ${fieldName}` });
  return null;
}
