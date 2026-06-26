// jest.config.ts
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Onde o Jest deve procurar os testes
    testMatch: [
        '<rootDir>/tests/**/*.spec.ts', 
        '<rootDir>/tests/**/*.test.ts'
    ],
    // Configuração para gerar o relatório de cobertura (Teste Estrutural)
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        // 'src/**/*.ts',
        'src/utils/masks/**/*.ts',
        'src/utils/validate/**/*.ts',
        'src/utils/several/**/*.ts',
        // '!utils/getCurrentDateAndTime.ts'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};