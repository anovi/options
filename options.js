(function(window) {
  'use strict';

  function Options ( schema, initial ) {
    if ( typeof schema !== 'object' ) { throw new TypeError('First argument must be an object with scheme of default options.'); }
    this._schema    = schema;
    this._options   = {};
    this._callbacks = {};
    this.set( initial, true );
    return this;
  }

  var itContains = function( array, elem ) {
    if ( array instanceof Array && array.length > 0 && elem !== undefined ) {
      for (var i = 0; i < array.length; i++) { if (elem === array[i]) {return true;} }
    }
    return false;
  };

  Options.extend = function() {
    var target = arguments[0],
    args = Array.prototype.slice.call(arguments), source;
    args.shift();
    for (var i = 0; i < args.length; i++) {
      source = args[i];
      for ( var key in source ) { target[key] = source[key]; }
    }
    return target;
  };

  Options.checkType = function(val, schema) {
    var type = typeof val, isNullable = val === null && schema.nullable;
    return ( schema.type instanceof Array ) ? itContains(schema.type, type) || isNullable : type === schema.type || isNullable;
  };

  Options.prototype.set = function( obj, isNew ) {
    var schema = this._schema,
    newOptions = isNew ? {} : this.get(),
    defaults = {},
    option, callback;
    obj = obj || {};

    // Check options
    for ( option in obj ) {
      var val = obj[ option ],
      defOption = schema[ option ];

      if ( defOption !== undefined ) {
        // unchangeable
        if ( defOption.unchangeable && !isNew ) {
          throw new Error( 'Option \"' + option + '\" could be setted once at the begining.' );
        }
        // wrong type
        if ( !Options.checkType(val, defOption) ) {
          var msg = 'Option \"' + option + '\" must be ' +
            ( defOption.type instanceof Array ? defOption.type.join(', ') : defOption.type ) +
            ( defOption.nullable ? ' or null.' : '.' );
          throw new TypeError( msg );
        }
        // out of values
        if ( defOption.values && !itContains(defOption.values, val) ) {
          throw new RangeError( 'Option \"' + option + '\" only could be in these values: \"' + defOption.values.join('\", \"') + '\".' );
        }
      }
    }
    // Create new options object
    if ( isNew ) {
      for ( option in schema ) {
        if ( schema[ option ]['default'] !== undefined ) { defaults[ option ] = schema[ option ]['default']; }
      }
    }
    newOptions = isNew ? Options.extend( defaults, obj ) : obj;
    // Callbacks
    for ( option in obj ) {
      if ( (callback = this._callbacks[option]) ) {
        obj[option] = callback.call( this, obj[option] );
      }
    }
    this._options = Options.extend( this._options, newOptions );
  };

  Options.prototype.get = function( opt ) {
    return opt ? this._options[ opt ] : Options.extend( {}, this._options );
  };

  Options.prototype.on = function( option, cb ) {
    this._callbacks[ option ] = cb;
  };

  Options.prototype.off = function( option ) {
    if ( this._callbacks[ option ] ) { delete this._callbacks[option]; }
  };


  window.SuperOptions = Options;

})(window);