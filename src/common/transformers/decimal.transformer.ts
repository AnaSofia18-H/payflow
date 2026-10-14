import { ValueTransformer } from 'typeorm';

export const decimalTransformer: ValueTransformer = {
  to: (valor: number) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};
