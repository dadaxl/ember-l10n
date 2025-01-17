import { get, observer } from '@ember/object';
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * This helper provides gettext singularization for message ids.
 * It takes singular message id as positional arguments. All
 * placeholders can be provided through named arguments.
 *
 * ```html
 * {{t 'Your current role: {{role}}' role=someBoundProperty}}
 * ```
 *
 * @namespace Helper
 * @class T
 * @extends Ember.Helper
 * @public
 */
export default Helper.extend({
  l10n: service(),

  compute([msgid], hash) {
    let l10n = get(this, 'l10n');

    if (!msgid) {
      return msgid;
    }

    return l10n.t(msgid, hash);
  },

  // eslint-disable-next-line ember/no-observers
  _watchLocale: observer('l10n.locale', function() {
    this.recompute();
  })
});
