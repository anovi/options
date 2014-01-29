(function( SuperOptions ) {

  /*
  *
  * Helpers
  *
  */
  var
  assert  = QUnit.assert,
  Options = SuperOptions,
  scheme  = {
    optionBoolean:   { default: true,      type: 'boolean'                             },
    optionString:    { default: 'test',    type: 'string'                              },
    optionValues:    { default: '2',       type: 'string', values:       ['1','2','3'] },
    optionNullable:  { default: 123,       type: 'number', nullable:     true          },
    optionFirstTime: { default: 'notouch', type: 'string', unchangeable: true          },
    noDefault:       { type: 'string' },
    twoTypes:        { type: ['boolean', 'string'] }
  };


  /*
  *
  * Config
  *
  */
  QUnit.testStart( function () {});
  QUnit.testDone( function () {});

  /*
  *
  * Basic suite
  *
  */
  module("Basic");

  test( 'Options created', 1, function() {
    var options = new Options( scheme );
    ok( options.get, "Ok, options created" );
  });

  test( 'default values', 6, function() {
    var options = new Options( scheme );
    ok( options.get('optionBoolean') === true        );
    ok( options.get('optionString') === 'test'       );
    ok( options.get('optionValues') === '2'          );
    ok( options.get('optionNullable') === 123        );
    ok( options.get('optionFirstTime') === 'notouch' );
    ok( options.get('noDefault') === void 0          );
  });

  test( 'custom values', 6, function() {
    var options = new Options( scheme, {
      optionBoolean: false,
      optionString: 'new',
      optionValues: '3',
      optionNullable: null,
      optionFirstTime: 'first touch',
      noDefault: 'but custom'
    });
    ok( options.get('optionBoolean') === false           );
    ok( options.get('optionString') === 'new'            );
    ok( options.get('optionValues') === '3'              );
    ok( options.get('optionNullable') === null           );
    ok( options.get('optionFirstTime') === 'first touch' );
    ok( options.get('noDefault') === 'but custom'        );
  });

  test( 'Set', 1, function() {
    var options = new Options( scheme );
    options.set( {optionString: 'superNew'} );
    ok( options.get('optionString') === 'superNew', 'Options setted' );
  });

  test( 'Set wrong type', 1, function() {
    var options = new Options( scheme );
    try {
      options.set( {optionString: 123} );
    } catch (err) {
      ok( err instanceof TypeError, 'Error' );
    }
  });

  test( 'Set unchangeable', 1, function() {
    var options = new Options( scheme );
    try {
      options.set( {optionFirstTime: 'asdfasdf'} );
    } catch (err) {
      ok( err instanceof Error, 'Error' );
    }
  });

  test( 'Set out of values', 2, function() {
    var options = new Options( scheme );
    options.set( {optionValues: '1'} );
    ok( options.get('optionValues') === '1' );

    try {
      options.set( {optionValues: 'qweqw'} );
    } catch (err) {
      ok( err instanceof RangeError, 'Error' );
    }
  });

  test( 'Set nullable', 2, function() {
    var options = new Options( scheme );
    options.set( {optionNullable: null} );
    ok( options.get('optionNullable') === null );

    try {
      options.set( {optionFirstTime: null} );
    } catch (err) {
      ok( err instanceof Error, 'Error' );
    }
  });

  asyncTest( 'Callbacks', 2, function() {
    var options = new Options( scheme ), res = [];
    options.on( 'optionValues', function( option ) {
      res.push( option );
    });
    options.on( 'noDefault', function( option ) {
      res.push( option );
      ok( res[0] === '1' );
      ok( res[1] === '2' );
      start();
    });

    options.set( {optionValues: '1'} );
    options.set( {noDefault: '2'} );
  });

  test( 'two types', 3, function() {
    var options = new Options( scheme );
    options.set( {twoTypes: 'super'} );
    ok( options.get('twoTypes') === 'super', 'string setted' );

    options.set( {twoTypes: false} );
    ok( options.get('twoTypes') === false, 'boolean setted' );

    try {
      options.set( {twoTypes: 123} );
    } catch (err) {
      ok( err instanceof TypeError, 'Error' );
    }
  });

}( SuperOptions ));