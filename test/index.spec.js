const test = require('ava');
const { bundle, filePath, fixture } = require('./bundle');
const { join } = require('path');

test('should contain the correct content', async (t) => {
  const fs = await bundle();
  t.is(fs.readFileSync(filePath('bundle.css'), 'utf-8'), '.a{float:left}');
  t.is(fs.readFileSync(filePath('bundle.rtl.css'), 'utf-8'),'.a{float:right}');
});

test('should create bundle per chunk', async (t) => {
  const fs = await bundle(undefined, { 'bundle2': fixture('index2.js') });
  t.is(fs.readFileSync(filePath('bundle.rtl.css'), 'utf-8'), '.a{float:right}');
  t.is(fs.readFileSync(filePath('bundle2.rtl.css'), 'utf-8'), '.b{float:right}');
});

test('should set filename according to options as object', async (t) => {
  const fs = await bundle({ filename: 'foo.rtl.css' });
  t.true(fs.existsSync(filePath('foo.rtl.css')));
});

test('should set filename according to options as string', async (t) => {
  const fs = await bundle('foo.rtl.css');
  t.true(fs.existsSync(filePath('foo.rtl.css')));
});

test('should support [fullhash]', async (t) => {
  const fs = await bundle('foo.[fullhash].rtl.css');
  const hashedFileName = fs
    .readdirSync(join(process.cwd(), 'dist'))
    .find((s) => s.startsWith('foo'));
  t.not(hashedFileName, 'foo.[fullhash].rtl.css');
  t.regex(hashedFileName, /foo\.\w+\.rtl\.css/);
});

test('should support [name]', async (t) => {
  const fs = await bundle('[name]-rtl.css');
  t.is(fs.readFileSync(filePath('bundle-rtl.css'), 'utf-8'), '.a{float:right}');
});
