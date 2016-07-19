# Ember-l10n

[![Build Status](https://travis-ci.org/Cropster/ember-l10n.svg?branch=master)](https://travis-ci.org/Cropster/ember-l10n)

> A GNU gettext based localization workflow for ember.

## Installation

* `ember install ember-l10n`

Using the string extractor requires:

* GNU gettext, xgettext
*  OS X: `brew install gettext; brew link --force gettext`
* [xgettext-template](https://www.npmjs.com/package/xgettext-template) - extracts strings from handlebars templates
* [gettext.js](https://www.npmjs.com/package/gettext.js) - lightweight port of gettext for JS

ember-l10n uses ember-ajax to fetch locale data.

## Usage

There are two primary parts to ember-l10n

1. Ember side: Service, Helpers, and Components
2. CLI: Contains a string extractor for `JS` and `HBS` files generating `POT`/`PO` files, a converter to convert `PO` files to `JSON` as well as a synchronizer for exchanging message ids in `JS` and `HBS` files (f.e. after proof read original version).

ember-l10n follows the gettext convention that the message ids in your source files
are the default language (usually English).

In the ember-l10n workflow, you use the `t`, and `n` helpers and `l10n.t()` / `l10n.n()`
functions to define your strings in your project. Then you run the extractor script
to generate pot and po files, which you send off to your translators.

After receiving the translated po files for additional locales, you use the same script
to convert them into json files. These json files are then loaded by ember-l10n in your application
and replaced at runtime.

ember-l10n provides powerful string substitution and even component
substitution for dynamic strings. See the Components section below.


## Ember Side

### Service

The  service translates through gettext.js. There are two available methods to
be used for translations message ids from JS source:

* `t(msgid, hash)`
* `n(msgid, msgidPlural, count, hash)`
* `tVar(msgid, hash)`

`tVar()` works exactly the same as `t()`, but it will be ignored by the 
gettext parser. This is useful if your message ids are variables, for example:
`l10n.t(myProperty)` would create a `myProperty` entry in your po-file
when gettext is run. So in this case, `l10n.tVar(myProperty)` should be used
instead.

Furthermore, there's an auto initialization feature (default: true), which
detects user's locale according to system preferences. If the user's locale is
supported in `availableLocales`, the corresponding translations are loaded. If
the user's locale is not supported, the default locale will be used instead
(default: "en"). Please use the following method to change locales:

* `setLocale(locale)` 

The following utility methods are also available:

* `getLocale()`
* `hasLocale(locale)`
* `detectLocale()`

To configure the path of the JSON files (depending on the path configured via
extractor's `-j` option) use the `jsonPath` property (default:
"/assets/locales").

When installing via `ember install ember-l10n`, an `l10n` service will be created for you under `app/services/l10n.js`.
There, you can configure (and overwrite) all service properties/methods:

```js
import Ember from 'ember';
import L10n from 'ember-l10n/services/l10n';

export default L10n.extend({
  availableLocales: Ember.computed(function() {
    return {
      'en': this.t('en')
    };
  }),
  autoInitialize: true,
  jsonPath: '/assets/locales'
});
```

You can create an initializer to inject the l10n-service everywhere with the following blueprint:

```bash
ember g ember-l10n-initializer my-l10n-initializer
```

This will produce an initializer such as:

```js
export function initialize(application) {
  application.inject('model', 'l10n', 'service:l10n');
  application.inject('route', 'l10n', 'service:l10n');
  application.inject('controller', 'l10n', 'service:l10n');
  application.inject('component', 'l10n', 'service:l10n');
}

export default {
  initialize: initialize,
  name: 'my-l10n-initializer'
};
```

### Helpers

For handling your translations within your handlebar templates you can use `t`
and `n` helper:

###### Singular translations:

The `t` helper provides gettext singularization for message ids. It takes
singular message id as positional arguments. All placeholders can be provided
through named arguments.

```hbs
{{t "Your current role: {{role}}" role=someBoundProperty}}
```

If you have strings which are variables (e.g. enums), you can also
use the t-var helper: `{{t-var myProperty}}`. It works the same way
as the t-helper, but it will be ignored by the gettext parser.

###### Plural translations:

The `n` helper provides gettext pluralization for message ids. It takes
singular and plural message ids as well as actual amount as positional
arguments. All placeholders can be provided through named arguments (hash).

_Short version:_

```hbs
{{n "{{count}} apple" "{{count}} apples" countProperty}}
```
_Long version:_

Please note: If your count placeholder has another name than "{{count}}", 
you have to explicitly provide it as named hashed in addition to positional 
parameter (as well as for all other placeholders within those message ids!).

```hbs
{{n "{{customCount}} apple from shop {{shopName}}" "{{customCount}} apples from shop {{shopName}}" countProperty customCount=countProperty shopName=shopProperty}}
```

### Components

If you have complex message ids, which should contain "dynamic" placeholders,
which can also be replaced with components (such as a `link-to`), you can use
the `get-text` component.

```hbs
{{#get-text 
  message=(t "My translation with {{dynamicLink 'optional link text'}} and {{staticLink}}.") as |text placeholder|}}
  {{!-- You can omit the if helper if you have only one placeholder --}}
  {{~#if (eq placeholder 'dynamicLink')}}
      {{~#link-to 'my-route'}}
        {{~text}} {{!-- will render 'optional link text' so that it's contained in PO file! --}}
    {{~/link-to~}}
   {{~/if~}}
   {{~#if (eq placeholder 'staticLink')}}
      <a href="http://www.google.com">Google</a>
   {{~/if~}}
{{/get-text}}
```

Please note: If your message id contains HTML, you have to set
`escapeText=true` on the component.

### Testing

In acceptance tests, ember-l10n should work without any further work.
In integration tests, you can use the provided test helpers to provide easy to use `{{t}}` and `{{n}}` helpers:

```js
// tests/integration/components/my-component-test.js
import l10nTestHelper from 'ember-l10n/test-helpers';

moduleForComponent('my-component', 'Integration | Component | my component', {
  integration: true,

  beforeEach() {
    l10nTestHelper(this);
  }
});
```

These helpers will basically just pass the string through.

## 2. CLI

### Extractor

The extractor extracts message ids from the JS and HBS files in your Ember project. It generates the corresponding PO files for translation. Later, it will convert the translated POs into JSON files to be used for client side translation within your Ember app.

Run the following command from your Ember project root for extraction:

* `ember l10n:extract`

To see all available command line options for the extractor script please run:

* `ember l10n:extract -h`

```
ember l10n:extract <options...>
  Extract message ids from app
  --default-language (String) (Default: en) The default language used in message ids
    aliases: -d <value>
  --bug-address (String) (Default: support@mycompany.com) The email address for translation bugs
    aliases: -b <value>
  --copyright (String) (Default: My Company) The copyright information
    aliases: -c <value>
  --from-code (String) (Default: UTF-8) The encoding of the input files
    aliases: -e <value>
  --input-directories (Array) (Default: ./app) The directory from which to extract the strings
    aliases: -i <value>
  --output-directory (String) (Default: ./translations) Output directory of the PO file
    aliases: -o <value>
  --keys (Array) (Default: t,n:1,2) Function/Helper Keys to be used for lookup
    aliases: -k <value>
  --language (String) (Default: en) Target language of the PO-file
    aliases: -l <value>
  --package (String) (Default: My App) The name of the package
    aliases: -p <value>
  --version (String) (Default: 1.0) The version of the package
    aliases: -v <value>
  --generate-only (Boolean) (Default: false) If only PO file should be created from POT without extraction
    aliases: -g
  --xgettext-template-path (String) (Default: ./node_modules/xgettext-template/bin/xgettext-template) The path where xgettext-template is available
  --gettextjs-path (String) (Default: ./node_modules/gettext.js/bin/po2json) The path where gettext.js is available
```

### Converter

The converter will turn a given `PO` into a `JSON` file to be loaded by the service.

Run the following command from your Ember project root for conversion:

* `ember l10n:convert`

To see all available command line options for the converter script please run:

* `ember l10n:convert -h`

```
ember l10n:convert <options...>
  Convert PO files to JSON
  --input-directory (String) (Default: ./translations) Directory of PO file to convert
    aliases: -i <value>
  --output-directory (String) (Default: ./public/assets/locales) Directory to write JSON files to
    aliases: -o <value>
  --language (String) (Default: en) Target language for PO to JSON conversion
    aliases: -l <value>
  --gettextjs-path (String) (Default: ./node_modules/gettext.js/bin/po2json) The path where gettext.js is available
```

### Synchronizer

The synchronizer will parse a given `PO` file, use the message ids from each entry and uses them as new message ids accross `JS` and `HBS` files in your app. This is especially helpful if you proof read your current message ids before handing them over to translators for other languages.

Run the following command from your Ember project root for synchronization:

* `ember l10n:sync`

To see all available command line options for the synchronization script please run:

* `ember l10n:sync -h`

```
ember l10n:sync <options...>
  Synchronize message strings with message ids (proof reading)
  --input-directory (String) (Default: ./translations) Directory of PO file to convert
    aliases: -i <value>
  --output-directories (Array) (Default: ./app) Directory to write JSON files to
    aliases: -o <value>
  --language (String) (Default: en) Target language for PO to JSON conversion
    aliases: -l <value>
  --keys (Array) (Default: t,n:1,2) Function/Helper Keys to be used for lookup
    aliases: -k <value>
```

## Looking for help? ##

If it is a bug [please open an issue on github](https://github.com/cropster/ember-l10n/issues).

## Versioning ##

This library follows [Semantic Versioning](http://semver.org)

## Legal

[Cropster](https://cropster.com), GmbH &copy; 2016

[@cropster](http://twitter.com/cropster)

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
