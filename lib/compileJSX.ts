import * as Babel from '@babel/standalone';

export function compileJSX(jsxCode: string): string {
  const result = Babel.transform(jsxCode, {
    presets: ['react'],
    plugins: ['transform-modules-commonjs'], // ✅ converts import/export to require/module.exports
    filename: 'component.tsx',
  });
  return result.code || '';
}