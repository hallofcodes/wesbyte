import * as Babel from '@babel/standalone';

export function compileJSX(jsxCode: string): string {
  const result = Babel.transform(jsxCode, {
    presets: [['react', { runtime: 'classic' }]],
    filename: 'component.jsx',
  });
  return result.code || '';
}