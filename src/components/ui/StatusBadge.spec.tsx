import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('deve renderizar o texto do status corretamente', () => {
    render(<StatusBadge status="PENDENTE" />);
    expect(screen.getByText('PENDENTE')).toBeInTheDocument();
  });

  it('deve aplicar as classes de cor corretas para o status ENTREGUE (verde)', () => {
    const { container } = render(<StatusBadge status="ENTREGUE" variant="green" />);
    const span = container.firstChild as HTMLElement;
    
    // Verificando se contém as classes do colorMap[green]
    expect(span).toHaveClass('bg-[#0E9F6E]/10');
    expect(span).toHaveClass('text-[#0E9F6E]');
  });

  it('deve aplicar as classes de cor corretas para o status CANCELADO (cinza)', () => {
    const { container } = render(<StatusBadge status="CANCELADO" variant="gray" />);
    const span = container.firstChild as HTMLElement;
    
    // Verificando se contém as classes do colorMap[gray]
    expect(span).toHaveClass('bg-[#6B7280]/10');
    expect(span).toHaveClass('text-[#6B7280]');
  });

  it('deve permitir a sobrescrita de classes via className', () => {
    render(<StatusBadge status="TESTE" className="custom-class" />);
    const span = screen.getByText('TESTE');
    expect(span).toHaveClass('custom-class');
  });
});
