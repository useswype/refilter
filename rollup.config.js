import typescript from '@rollup/plugin-typescript';
import image from '@rollup/plugin-image';

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'src/index.ts',
    output: {
        dir: 'output',
        format: 'es',
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' }), image()],
    external: ['react', 'react-dom', 'react/jsx-runtime']
};

export default config;