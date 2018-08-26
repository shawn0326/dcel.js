const BANNER = 
    '/**\n' +
    ' * dcel.js (https://github.com/shawn0326/dcel.js)\n' +
    ' * @author shawn0326 http://www.halflab.me/\n' +
    ' */';

export default [{
	input: './index_umd.js',
	plugins: [
	],
	// sourceMap: true,
	output: { 
        format: 'umd',
        file: './build/dcel.js',
        banner: BANNER
    }
}, {
    input: './index.js',
	plugins: [
	],
	// sourceMap: true,
	output: {
        format: 'cjs',
        file: './build/dcel.c.js',
        banner: BANNER
    }
}];