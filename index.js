const BroccoliFunnel = require('broccoli-funnel');
const VersionChecker = require('ember-cli-version-checker');
const { UnwatchedDir } = require('broccoli-source');
const replace = require('broccoli-string-replace');
const fs = require('fs');

const MATCHER = new RegExp(
  'var Class =' +
  '[\\s\\S]*function \\(_this\\) {' +
  '[\\s\\S]*\\(0, _emberBabel\\.inheritsLoose\\)\\(Class, _this\\);' +
  '[\\s\\S]*function Class\\(\\) {' +
  '[\\s\\S]*return _this\\.apply\\(this, arguments\\) \\|\\| this;' +
  '[\\s\\S]*}' +
  '[\\s\\S]*return Class;[\\s\\S]*}\\(this\\);'
);

const OLD_MATCHER = new RegExp(
  'var Class =' +
  '[\\s\\S]*function \\(_ref\\) {' +
  '[\\s\\S]*\\(0, _emberBabel\\.inherits(Loose)?\\)\\(Class, _ref\\);' +
  '[\\s\\S]*function Class\\(\\) {' +
  '[\\s\\S]*return \\(0, _emberBabel\\.possibleConstructorReturn\\)\\(this, _ref.apply\\(this, arguments\\)\\)' +
  '[\\s\\S]*}' +
  '[\\s\\S]*return Class;[\\s\\S]*}\\(this\\);'
);

const REPLACEMENT = 'let Class = class extends this {};';

module.exports = {
  name: require('./package').name,

  treeForVendor() {
    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    if (!emberVersion.lt('3.13.0-alpha.0')) {
      // bailout early for perf
      return this._super.treeForVendor.apply(this, arguments);
    }

    let emberSource = this.project.addons.find(a => a.name === 'ember-source');
    let emberCliBabel = emberSource.addons.find(a => a.name === 'ember-cli-babel');

    let needsLegacyBuild = [
      'transform-template-literals',
      'transform-literals',
      'transform-arrow-functions',
      'transform-destructuring',
      'transform-spread',
      'transform-parameters',
      'transform-computed-properties',
      'transform-shorthand-properties',
      'transform-block-scoping',
      'transform-classes',
    ].some(p => emberCliBabel.isPluginRequired(p));

    let doesNotNeedClassesTransform = !emberCliBabel.isPluginRequired('transform-classes');

    let hasLegacyBuild = fs.statSync(`${emberSource.root}/dist/legacy`).isDirectory();

    let shouldPatch =
      hasLegacyBuild
      && needsLegacyBuild
      && doesNotNeedClassesTransform;

    if (!shouldPatch) {
      // bailout if other constraints are not met
      return this._super.treeForVendor.apply(this, arguments);
    }

    let patchedEmberTree = replace(new UnwatchedDir(`${emberSource.root}/dist/legacy`), {
      files: ['ember.prod.js', 'ember.debug.js'],
      pattern: {
        match: emberVersion.lt('3.8.0-alpha.0') ? OLD_MATCHER : MATCHER,
        replacement: REPLACEMENT,
      }
    });

    return new BroccoliFunnel(patchedEmberTree, {
      destDir: 'ember'
    });
  },
};
