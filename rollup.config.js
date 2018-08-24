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
    input: './index_umd.js',
	plugins: [
	],
	// sourceMap: true,
	output: {
        input: './index.js',
        format: 'es',
        file: './build/dcel.module.js',
        banner: BANNER
    }
}];