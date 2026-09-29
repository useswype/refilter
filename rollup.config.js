import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import svgr from '@svgr/rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

import packageJson from './package.json' with { type: 'json' };

const banner = `/*!
 * ${packageJson.name} v${packageJson.version}
 * (c) ${new Date().getFullYear()} ${packageJson.author}
 * @license MIT
 */`;

/** @type {import('rollup').RollupOptions} */
const config = [
  {
    input: { index: 'src/index.ts', utils: 'src/utils.ts' },
    output: [
      {
        dir: 'output',
        format: 'es',
        sourcemap: true,
        banner,
      },
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      svgr(),
      nodeResolve({ resolveOnly: ['tailwind-merge', '@headlessui/react'] }),
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  {
    input: { index: 'output/types/index.d.ts', utils: 'output/types/utils.d.ts' },
    output: {
      dir: 'output',
      format: 'es',
      banner,
    },
    plugins: [dts()],
    external: ['/.css$/'],
  },
];

export default config;
