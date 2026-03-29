import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
    ...fsd.configs.recommended,
    {
        rules: {
            'fsd/no-reserved-folder-names': 'off',
            'fsd/no-segmentless-slices': 'off',
            'fsd/segments-by-purpose': 'off',
            'fsd/insignificant-slice': 'off',
            'fsd/no-public-api-sidestep': 'off',
            'fsd/public-api': 'warn',
        },
    },
]);
