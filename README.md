ember-class-constructor-fix
==============================================================================

This addon fixes a common bug that occured in versions of Ember prior to 3.13,
where if a particular combination of browser targets was used, it was possible
to have failures when attempting to zebra-stripe native and Classic class
definitions:

```js
class Foo extends EmberObject {}

const Bar = Foo.extend();

class Baz extends Bar {}

const Qux = Baz.extend();
```

Zebra-striping here refers to the fact that we are extending using native
syntax, then classic syntax, then native syntax again.

The bug came down to Ember using a precompiled build that targeted legacy
browsers such as IE11. In some cases, it was possible that Ember would use this
build, even though _classes_ didn't need to be transformed. The user's classes
would not be transformed, but one particular class in Ember would - the class
that is created in `EmberObject.extend()`. Native classes _cannot_ interop with
traditional function based classes, at all, so this breaks completely:

```js
// modern class
class Foo {}

// pre-es6 class
function Bar() {
  // constructor "super"
  return Foo.apply(this, arguments) || this;
}

// breaks
new Bar();
```

This patches Ember's legacy build _if and only if_ Babel says we aren't going to
transform classes. Since class syntax is supported according to Babel/targets,
patching it back in won't cause issues, in general.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.6 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-class-constructor-fix
```


Usage
------------------------------------------------------------------------------

Once installed the addon does not need further setup.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
