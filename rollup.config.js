import typescript from '@rollup/plugin-typescript';
import svgr from '@svgr/rollup'

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'src/index.ts',
    output: {
        dir: 'output',
        format: 'es',
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' }), svgr()],
    external: ['react', 'react-dom', 'react/jsx-runtime']
};

export default config;