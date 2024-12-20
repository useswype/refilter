import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import svgr from '@svgr/rollup';
import postcss from "rollup-plugin-postcss";
import nodeResolve from "@rollup/plugin-node-resolve";

import packageJson from './package.json' with { type: 'json' };

const banner = `/*!
 * ${packageJson.name} v${packageJson.version}
 * (c) ${new Date().getFullYear()} ${packageJson.author}
 * @license MIT
 */`;

/** @type {import('rollup').RollupOptions} */
const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'output',
        format: 'es',
        sourcemap: true,
        banner,
      },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json' }), svgr(), nodeResolve({ resolveOnly: ['tailwind-merge', '@headlessui/react', 'qs'] }), postcss({
      extract: true,
      minimize: true,
    })],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  {
    input: "src/main.css",
    output: [{ file: 'output/main.css', }],
    plugins: [
      postcss({
        extract: true,
        minimize: true,
      }),
    ],
  },
  {
    input: 'output/types/index.d.ts',
    output: {
      file: 'output/index.d.ts',
      format: 'es',
      banner,
    },
    plugins: [
      dts(),
    ],
    external: [
      '/\.css$/',
    ]

  },
];

export default config;