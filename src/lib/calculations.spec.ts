import { describe, it, expect } from 'vitest';
import { calcularDivergenciaPercentual } from './calculations';

describe('calcularDivergenciaPercentual', () => {
  it('deve calcular corretamente o aumento de 20%', () => {
    const result = calcularDivergenciaPercentual(120, 100);
    expect(result).toBe(20);
  });

  it('deve calcular corretamente a redução de 10%', () => {
    const result = calcularDivergenciaPercentual(90, 100);
    expect(result).toBe(-10);
  });

  it('deve retornar 0 se o preço atual for zero (evita divisão por zero)', () => {
    const result = calcularDivergenciaPercentual(100, 0);
    expect(result).toBe(0);
  });

  it('deve retornar 0 se o preço atual for negativo', () => {
    const result = calcularDivergenciaPercentual(100, -50);
    expect(result).toBe(0);
  });

  it('deve retornar 0 se o preço atual for nulo ou indefinido', () => {
    expect(calcularDivergenciaPercentual(100, null as any)).toBe(0);
    expect(calcularDivergenciaPercentual(100, undefined as any)).toBe(0);
  });

  it('deve tratar o novo preço como zero se for nulo ou indefinido', () => {
    const result = calcularDivergenciaPercentual(null as any, 100);
    expect(result).toBe(-100);
  });

  it('deve retornar 0 se ambos forem 100', () => {
    const result = calcularDivergenciaPercentual(100, 100);
    expect(result).toBe(0);
  });
});
