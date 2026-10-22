import { describe, expect, it } from 'vitest';
import { passwordProblem } from '@/lib/password-rules';

describe('passwordProblem', () => {
    it('passes a password the backend accepts', () => {
        expect(passwordProblem('Avelon!Ana2026')).toBeNull();
    });

    it('names every rule a weak password breaks', () => {
        expect(passwordProblem('abc')).toBe(
            'Password must have: at least 8 characters, one uppercase letter, one number, one special character',
        );
    });

    it('asks only for what is missing', () => {
        expect(passwordProblem('Avelon2026')).toBe('Password must have: one special character');
    });
});
