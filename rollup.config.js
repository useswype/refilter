import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import svgr from '@svgr/rollup';

/** @type {import('rollup').RollupOptions} */
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'output',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json' }), svgr()],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  {
    input: 'output/types/index.d.ts',
    output: {
      file: 'output/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

export default config;
