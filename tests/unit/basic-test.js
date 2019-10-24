import { module, test } from 'qunit';
import EmberObject from '@ember/object';

module('Unit | Utility | polyfill', function() {
  test('it works with zebra-striping', function(assert) {
    assert.expect(0);

    class Foo extends EmberObject {}

    const Bar = Foo.extend();

    class Baz extends Bar {}

    const Qux = Baz.extend();

    Qux.create();
  });
});
