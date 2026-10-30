import { maskServiceAmount } from '@/utils/masks/maskServiceAmount';
import { unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';

it('removes letters from amount and phone inputs, including pasted values', () => {
    expect(maskServiceAmount('asd')).toBe('');
    expect(maskServiceAmount('R$ 100,50')).toBe('100,50');
    expect(maskServiceAmount('123.456')).toBe('123,45');
    expect(maskServiceAmount('100,123')).toBe('100,12');
    expect(unMaskPhoneNumber('telefone: (12) 99999-9999')).toBe('12999999999');
});
