import { describe, it, expect } from 'vitest'

// Mock state
let focusedCell: { category: string, month: number } | null = null;

// Mock formatter logic from Vue component
const formatMoney = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === '') return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const getFormatter = (category: string, month: number) => {
  return (val: number | string) => {
    if (focusedCell?.category === category && focusedCell?.month === month) {
      return val !== undefined && val !== null ? `${val}` : '';
    }
    return formatMoney(val);
  };
};

describe('BudgetAdjustment Input Format Logic Refined', () => {
  it('should show raw value when focused', () => {
    focusedCell = { category: 'overtime', month: 1 };
    const formatter = getFormatter('overtime', 1);
    
    expect(formatter(1234.5)).toBe('1234.5'); // Raw
    expect(formatter(100)).toBe('100');       // Raw
  });

  it('should show formatted value when not focused', () => {
    focusedCell = null;
    const formatter = getFormatter('overtime', 1);
    
    expect(formatter(1234.5)).toBe('1,234.5');
    expect(formatter(100)).toBe('100.0');     // Forced decimal
  });

  it('should show formatted value when another cell is focused', () => {
    focusedCell = { category: 'overtime', month: 2 }; // Different month
    const formatter = getFormatter('overtime', 1);
    
    expect(formatter(1234.5)).toBe('1,234.5');
  });

  it('should handle blur logic (rounding)', () => {
    // Mock blur handler logic
    const handleBlur = (valStr: string) => {
      if (valStr === '' || valStr === '-') return null;
      const val = parseFloat(valStr.replace(/,/g, ''));
      return isNaN(val) ? null : parseFloat(val.toFixed(1));
    };

    expect(handleBlur('1234.56')).toBe(1234.6);
    expect(handleBlur('100')).toBe(100.0);
    expect(handleBlur('')).toBe(null);
  });
})
