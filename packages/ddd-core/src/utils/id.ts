import { nanoid } from 'nanoid';

export interface IdOptions {
  generateId?: () => string;
}

const ID_CONFIG: Required<IdOptions> = {
  generateId: nanoid,
};

export const generateId = ID_CONFIG.generateId;

export function updateIdGenerator(opts: IdOptions = {}) {
  for (const [k, v] of Object.entries(opts)) {
    if (k in ID_CONFIG && v !== undefined) (ID_CONFIG as any)[k] = v;
  }
}
