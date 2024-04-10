const BANNER = `/**
 * @license
 * Copyright 2018-present dcel.js Authors
 * SPDX-License-Identifier: MIT
 */\n`;

export default [{
	input: 'src/DCEL.js',
	plugins: [],
	output: {
        name: 'DCEL',
        format: 'umd',
        file: './build/dcel.js',
        banner: BANNER
    }
}, {
	input: 'src/DCEL.js',
	plugins: [],
	output: { 
        format: 'esm',
        file: 'build/dcel.module.js',
        banner: BANNER
    }
}, {
    input: 'src/DCEL.js',
	plugins: [],
	output: {
        format: 'cjs',
        file: 'build/dcel.cjs',
        banner: BANNER
    }
}];