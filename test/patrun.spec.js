/* Copyright (c) 2013-2016 Richard Rodger, MIT License */
"use strict";


if( typeof patrun === 'undefined' ) {
  var patrun = require('..')
}

if( typeof _ === 'undefined' ) {
  var _ = require('lodash')
}

if( typeof gex === 'undefined' ) {
  var gex = require('gex')
}


function rs(x) {
  return x.toString(true).replace(/\s+/g,'').replace(/\n+/g,'')
}

describe('patrun', function(){

  it('toString', function() {
    var r = patrun()
    r.add({},'R')
    expect(r.toString(true)).toBe(' <R>')
    expect(r.toString(false)).toBe(' -> <R>')
  })


  it('empty', function(){
    var r = patrun()
    expect( r.toString() ).toBe('')

    expect( r.find(NaN) ).toBe( null )
    expect( r.find(void 0) ).toBe( null )
    expect( r.find(null) ).toBe( null )
    expect( r.find({}) ).toBe( null )
    expect( r.find({a:1}) ).toBe( null )

    r.add({a:1},'A')

    expect( r.find(NaN) ).toBe( null )
    expect( r.find(void 0) ).toBe( null )
    expect( r.find(null) ).toBe( null )
    expect( r.find({}) ).toBe( null )
    expect( r.find({a:1}) ).toBe( 'A' )
  })


  it('root-data', function() {
    var r = patrun()
    r.add({},'R')
    expect( ''+r ).toBe( " -> <R>" )
    expect( rs(r) ).toBe( "<R>")
    expect( JSON.stringify(r.list()) ).toBe('[{"match":{},"data":"R"}]')

    expect( r.find({}) ).toBe( "R" )
    expect( r.find({}, true) ).toBe( "R" )
    expect( r.find({x:1}) ).toBe( "R" )
    expect( r.find({x:1}, true) ).toBe( null )

    r.add( {a:'1'}, 'r1' )
    expect( ''+r ).toBe( " -> <R>\na=1 -> <r1>" )
    expect( rs(r) ).toBe( "<R>a:1-><r1>")

    expect( r.find({x:1}) ).toBe( "R" )
    expect( r.find({a:1}) ).toBe( "r1" )
    expect( r.find({a:2}) ).toBe( "R" )

    r.add( {a:'1', b:'1'}, 'r2' )
    expect( r.find({x:1}) ).toBe( "R" )
    expect( r.find({a:1}) ).toBe( "r1" )
    expect( r.find({a:1,b:1}) ).toBe( "r2" )
    expect( r.find({a:2}) ).toBe( "R" )
    expect( r.find({a:1,b:2}) ).toBe( "r1" ) // a:1 is defined
    expect( r.find({a:1,b:2}, true) ).toBe( null )  // exact must be ... exact
    expect( r.find({a:2,b:2}) ).toBe( "R" )
    expect( r.find({b:2}) ).toBe( "R" )


    r.add( {x:'1', y:'1'}, 'r3' )
    expect( r.find({x:1}) ).toBe( "R" )

    expect( r.find({x:1}, true) ).toBe( null )

    expect( JSON.stringify(r.list()) ).toBe(
      '[{"match":{},"data":"R"},{"match":{"a":"1"},"data":"r1"},{"match":{"a":"1","b":"1"},"data":"r2"},{"match":{"x":"1","y":"1"},"data":"r3"}]')
  })


  it('add', function() {
    var r

    r = patrun()
    r.add( {a:'1'}, 'r1' )
    expect( ''+r ).toBe( "a=1 -> <r1>" )
    expect( rs(r) ).toBe( "a:1-><r1>")

    expect( JSON.stringify(r.list()) ).toBe('[{"match":{"a":"1"},"data":"r1"}]')


    r = patrun()
    r.add( {a:'1',b:'2'}, 'r1' )
    expect( rs(r) ).toBe( "a:1->b:2-><r1>")

    r = patrun()
    r.add( {a:'1',b:'2',c:'3'}, 'r1' )
    expect( rs(r) ).toBe( "a:1->b:2->c:3-><r1>")

    r = patrun()
    r.add( {a:'1',b:'2'}, 'r1' )
    r.add( {a:'1',b:'3'}, 'r2' )
    expect( ''+r ).toBe( "a=1, b=2 -> <r1>\na=1, b=3 -> <r2>" )
    expect( rs(r) ).toBe( "a:1->b:2-><r1>3-><r2>")

    r = patrun()
    r.add( {a:'1',b:'2'}, 'r1' )
    r.add( {a:'1',c:'3'}, 'r2' )
    expect( rs(r) ).toBe( "a:1->b:2-><r1>|c:3-><r2>")

    r.add( {a:'1',d:'4'}, 'r3' )
    expect( rs(r) ).toBe( "a:1->b:2-><r1>|c:3-><r2>|d:4-><r3>")

    r = patrun()
    r.add( {a:'1',c:'2'}, 'r1' )
    r.add( {a:'1',b:'3'}, 'r2' )
    expect( rs(r) ).toBe( "a:1->b:3-><r2>|c:2-><r1>")

    expect( JSON.stringify(r.list()) ).toBe('[{"match":{"a":"1","b":"3"},"data":"r2"},{"match":{"a":"1","c":"2"},"data":"r1"}]')
  })


  it('basic', function() {
    var rt1 = patrun()
    
    rt1.add( {p1:'v1'}, 'r1' )
    expect( 'r1' ).toBe( rt1.find({p1:'v1'}))
    expect( null ).toBe( rt1.find({p2:'v1'}))

    rt1.add( {p1:'v1'}, 'r1x' )
    expect( 'r1x' ).toBe( rt1.find({p1:'v1'}))
    expect( null ).toBe( rt1.find({p2:'v1'}))

    rt1.add( {p1:'v2'}, 'r2' )
    expect( 'r2' ).toBe( rt1.find({p1:'v2'}))
    expect( null ).toBe( rt1.find({p2:'v2'}))

    rt1.add( {p2:'v3'}, 'r3' )
    expect( 'r3' ).toBe( rt1.find({p2:'v3'}))
    expect( null ).toBe( rt1.find({p2:'v2'}))
    expect( null ).toBe( rt1.find({p2:'v1'}))

    rt1.add( {p1:'v1',p3:'v4'}, 'r4' )
    expect( 'r4' ).toBe( rt1.find({p1:'v1',p3:'v4'}))
    expect( 'r1x' ).toBe( rt1.find({p1:'v1',p3:'v5'}))
    expect( null ).toBe( rt1.find({p2:'v1'}))
  })


  it('culdesac', function() {
    var rt1 = patrun()
    
    rt1.add( {p1:'v1'}, 'r1' )
    rt1.add( {p1:'v1',p2:'v2'}, 'r2' )
    rt1.add( {p1:'v1',p3:'v3'}, 'r3' )

    expect( 'r1' ).toBe( rt1.find({p1:'v1',p2:'x'}))
    expect( 'r3' ).toBe( rt1.find({p1:'v1',p2:'x',p3:'v3'}))
  }),

  
  it('remove', function(){
    var rt1 = patrun()
    rt1.remove( {p1:'v1'} )

    rt1.add( {p1:'v1'}, 'r0' )
    expect( 'r0' ).toBe( rt1.find({p1:'v1'}))

    rt1.remove( {p1:'v1'} )
    expect( null ).toBe( rt1.find({p1:'v1'}))

    rt1.add( {p2:'v2',p3:'v3'}, 'r1' )
    rt1.add( {p2:'v2',p4:'v4'}, 'r2' )
    expect( 'r1' ).toBe( rt1.find({p2:'v2',p3:'v3'}))
    expect( 'r2' ).toBe( rt1.find({p2:'v2',p4:'v4'}))

    rt1.remove( {p2:'v2',p3:'v3'} )
    expect( null ).toBe( rt1.find({p2:'v2',p3:'v3'}))
    expect( 'r2' ).toBe( rt1.find({p2:'v2',p4:'v4'}))

  })


  function listtest(mode) {
    return function() {
      var rt1 = patrun()
      
      'subvals==mode' && rt1.add( {a:'1'}, 'x' )

      rt1.add( {p1:'v1'}, 'r0' )

      rt1.add( {p1:'v1',p2:'v2a'}, 'r1' )
      rt1.add( {p1:'v1',p2:'v2b'}, 'r2' )

      var found = rt1.list({p1:'v1'})
      expect( '[{"match":{"p1":"v1"} ).toBe( "data":"r0"}]',JSON.stringify(found))


      found = rt1.list({p1:'v1',p2:'*'})
      expect( '[{"match":{"p1":"v1" ).toBe( "p2":"v2a"},"data":"r1"},{"match":{"p1":"v1","p2":"v2b"},"data":"r2"}]',JSON.stringify(found))


      rt1.add( {p1:'v1',p2:'v2c',p3:'v3a'}, 'r3a' )
      rt1.add( {p1:'v1',p2:'v2d',p3:'v3b'}, 'r3b' )
      found = rt1.list({p1:'v1',p2:'*',p3:'v3a'})
      expect( '[{"match":{"p1":"v1" ).toBe( "p2":"v2c","p3":"v3a"},"data":"r3a"}]',JSON.stringify(found))

      // gex can accept a list of globs
      found = rt1.list({p1:'v1',p2:['v2a','v2b','not-a-value']})
      expect( '[{"match":{"p1":"v1" ).toBe( "p2":"v2a"},"data":"r1"},{"match":{"p1":"v1","p2":"v2b"},"data":"r2"}]',JSON.stringify(found))
    }
  }

  it('list.topvals', listtest('topvals'))
  it('list.subvals', listtest('subvals'))


  it('null-undef-nan', function(){
    var rt1 = patrun()
    
    rt1.add( {p1:null}, 'r1' )
    expect(  '{"d":"r1"}' ).toBe(  rt1.toJSON() )

    rt1.add( {p2:void 0}, 'r2' )
    expect(  '{"d":"r2"}' ).toBe(  rt1.toJSON() )

    rt1.add( {p99:'v99'}, 'r99' )
    expect(  '{"d":"r2" ).toBe( "k":"p99","v":{"v99":{"d":"r99"}}}', rt1.toJSON() )
  })


  it('multi-star', function(){
    var p = patrun()

    p.add( {a:1}, 'A' )
    p.add( {a:1,b:2}, 'B' )
    p.add( {c:3}, 'C' )
    p.add( {b:1,c:4}, 'D' )

    expect( rs(p) ).toBe( "a:1-><A>b:2-><B>|b:1->c:4-><D>|c:3-><C>" )
    expect( ''+p ).toBe( "a=1 -> <A>\na=1, b=2 -> <B>\nb=1, c=4 -> <D>\nc=3 -> <C>" )

    expect( p.find({c:3}) ).toBe('C')
    expect( p.find({c:3,a:0}) ).toBe('C')
    expect( p.find({c:3,a:0,b:0}) ).toBe('C')
  })


  it('star-backtrack', function(){
    var p = patrun()
    
    p.add( {a:1,b:2}, 'X' )
    p.add( {c:3}, 'Y' )
    
    expect( p.find({a:1,b:2}) ).toBe('X')
    expect( p.find({a:1,b:0,c:3}) ).toBe('Y')

    p.add( {a:1,b:2,d:4}, 'XX' )
    p.add( {c:3,d:4}, 'YY' )

    expect( p.find({a:1,b:2,d:4}) ).toBe('XX')
    expect( p.find({a:1,c:3,d:4}) ).toBe('YY')
    expect( p.find({a:1,b:2}) ).toBe('X')
    expect( p.find({a:1,b:0,c:3}) ).toBe('Y')

    expect( p.list({a:1,b:'*'})[0].data ).toBe( 'X' )
    expect( p.list({c:3})[0].data ).toBe( 'Y' )
    expect( p.list({c:3,d:'*'})[0].data ).toBe( 'YY' )
    expect( p.list({a:1,b:'*',d:'*'})[0].data ).toBe( 'XX' )

    expect( ''+p ).toBe( "a=1, b=2 -> <X>\na=1, b=2, d=4 -> <XX>\nc=3 -> <Y>\nc=3, d=4 -> <YY>" )
  })


  it('remove-intermediate', function(){
    var p = patrun()
    
    p.add( {a:1,b:2,d:4}, 'XX' )
    p.add( {c:3,d:4}, 'YY' )
    p.add( {a:1,b:2}, 'X' )
    p.add( {c:3}, 'Y' )

    p.remove( {c:3} )

    expect( p.find({c:3}) ).toBe( null )
    expect( p.find({a:1,c:3,d:4}) ).toBe('YY')
    expect( p.find({a:1,b:2,d:4}) ).toBe('XX')
    expect( p.find({a:1,b:2}) ).toBe('X')

    p.remove( {a:1,b:2} )

    expect( p.find({c:3}) ).toBe( null )
    expect( p.find({a:1,c:3,d:4}) ).toBe('YY')
    expect( p.find({a:1,b:2,d:4}) ).toBe('XX')
    expect( p.find({a:1,b:2}) ).toBe( null )
  })

  
  it('exact', function(){
    var p = patrun()

    p.add( {a:1}, 'X' )
    
    expect( p.findexact({a:1}) ).toBe( 'X' )
    expect( p.findexact({a:1,b:2}) ).toBe( null )
  })


  it('all', function(){
    var p = patrun()

    p.add( {a:1}, 'X' )
    p.add( {b:2}, 'Y' )
    
    expect( JSON.stringify(p.list()) ).toBe('[{"match":{"a":"1"},"data":"X"},{"match":{"b":"2"},"data":"Y"}]')
  })



  it('custom-happy', function(){
    var p1 = patrun( function(pat){
      pat.q=9
    })

    p1.add( {a:1}, 'Q' )
    
    expect( p1.find({a:1}) ).toBe( null )
    expect( p1.find({a:1,q:9}) ).toBe( 'Q' )
  })


  it('custom-many', function(){
    var p1 = patrun( function(pat,data){
      var items = this.find(pat,true) || []
      items.push(data)

      return {
        find: function(args,data){
          return 0 < items.length ? items : null
        },
        remove: function(args,data){
          items.pop()
          return 0 == items.length;
        }
      }
    })

    p1.add( {a:1}, 'A' )
    p1.add( {a:1}, 'B' )
    p1.add( {b:1}, 'C' )
    
    expect( p1.find({a:1}).toString() ).toBe( ['A','B'].toString() )
    expect( p1.find({b:1}).toString() ).toBe( ['C'].toString() )
    expect( p1.list().length).toBe(2)

    p1.remove( {b:1} )
    expect( p1.list().length).toBe(1)
    expect( p1.find({b:1}) ).toBe( null )
    expect( p1.find({a:1}).toString() ).toBe( ['A','B'].toString() )

    p1.remove( {a:1} )
    expect( p1.list().length).toBe(1)
    expect( p1.find({b:1}) ).toBe( null )
    
    expect( JSON.stringify(p1.find({a:1})).toString() ).toBe( '["A"]' )

    p1.remove( {a:1} )
    expect( p1.list().length).toBe(0)
    expect( p1.find({b:1}) ).toBe( null )
    expect( p1.find({a:1}) ).toBe( null )
  })



  it('custom-gex', function(){

    // this custom function matches glob expressions
    var p2 = patrun( function(pat,data){
      var gexers = {}
      _.each(pat, function(v,k){
        if( _.isString(v) && ~v.indexOf('*') ) {
          delete pat[k]
          gexers[k] = gex(v)
        }
      })

      // handle previous patterns that match this pattern
      var prev = this.list(pat)
      var prevfind = prev[0] && prev[0].find
      var prevdata = prev[0] && this.findexact(prev[0].match)

      return function(args,data){
        var out = data
        _.each(gexers,function(g,k){
          var v = null==args[k]?'':args[k]
          if( null == g.on( v ) ) { out = null }
        })

        if( prevfind && null == out ) {
          out = prevfind.call(this,args,prevdata)
        }

        return out
      }
    })


    p2.add( {a:1,b:'*'}, 'X' )

    expect( p2.find({a:1}) ).toBe( 'X' )
    expect( p2.find({a:1,b:'x'}) ).toBe( 'X' )


    p2.add( {a:1,b:'*',c:'q*z'}, 'Y' )

    expect( p2.find({a:1}) ).toBe( 'X' )
    expect( p2.find({a:1,b:'x'}) ).toBe( 'X' )
    expect( p2.find({a:1,b:'x',c:'qaz'}) ).toBe( 'Y' )


    p2.add( {w:1}, 'W' )
    expect( p2.find({w:1}) ).toBe( 'W' )
    expect( p2.find({w:1,q:'x'}) ).toBe( 'W' )

    p2.add( {w:1,q:'x*'}, 'Q' )
    expect( p2.find({w:1}) ).toBe( 'W' )
    expect( p2.find({w:1,q:'x'}) ).toBe( 'Q' )
    expect( p2.find({w:1,q:'y'}) ).toBe( 'W' )
  })


  it('find-exact',function(){
    var p1 = patrun()
    p1.add({a:1},'A')
    p1.add({a:1,b:2},'B')
    p1.add({a:1,b:2,c:3},'C')

    expect( p1.find({a:1}) ).toBe('A')
    expect( p1.find({a:1},true) ).toBe('A')
    expect( p1.find({a:1,b:8}) ).toBe('A')
    expect( p1.find({a:1,b:8},true) ).toBe(null)
    expect( p1.find({a:1,b:8,c:3}) ).toBe('A')
    expect( p1.find({a:1,b:8,c:3},true) ).toBe(null)

    expect( p1.find({a:1,b:2}) ).toBe('B')
    expect( p1.find({a:1,b:2},true) ).toBe('B')
    expect( p1.find({a:1,b:2,c:9}) ).toBe('B')
    expect( p1.find({a:1,b:2,c:9},true) ).toBe(null)

    expect( p1.find({a:1,b:2,c:3}) ).toBe('C')
    expect( p1.find({a:1,b:2,c:3},true) ).toBe('C')
    expect( p1.find({a:1,b:2,c:3,d:7}) ).toBe('C')
    expect( p1.find({a:1,b:2,c:3,d:7},true) ).toBe(null)

  })


  it('list-any', function(){
    var p1 = patrun()
    p1.add({a:1},'A')
    p1.add({a:1,b:2},'B')
    p1.add({a:1,b:2,c:3},'C')
    
    var mA = '{"match":{"a":"1"},"data":"A"}'
    var mB = '{"match":{"a":"1","b":"2"},"data":"B"}'
    var mC = '{"match":{"a":"1","b":"2","c":"3"},"data":"C"}'

    expect( JSON.stringify(p1.list()) ).toBe( '['+[mA,mB,mC]+']' )

    expect( JSON.stringify(p1.list({a:1})) ).toBe( '['+[mA,mB,mC]+']' )
    expect( JSON.stringify(p1.list({b:2})) ).toBe( '['+[mB,mC]+']' )
    expect( JSON.stringify(p1.list({c:3})) ).toBe( '['+[mC]+']' )

    expect( JSON.stringify(p1.list({a:'*'})) ).toBe( '['+[mA,mB,mC]+']' )
    expect( JSON.stringify(p1.list({b:'*'})) ).toBe( '['+[mB,mC]+']' )
    expect( JSON.stringify(p1.list({c:'*'})) ).toBe( '['+[mC]+']' )

    expect( JSON.stringify(p1.list({a:1,b:2}) ) ).toBe( '['+[mB,mC]+']' )
    expect( JSON.stringify(p1.list({a:1,b:'*'}) ) ).toBe( '['+[mB,mC]+']' )
    expect( JSON.stringify(p1.list({a:1,b:'*',c:3}) ) ).toBe( '['+[mC]+']' )
    expect( JSON.stringify(p1.list({a:1,b:'*',c:'*'}) ) ).toBe( '['+[mC]+']' )

    expect( JSON.stringify(p1.list({a:1,c:'*'}) ) ).toBe( '['+[mC]+']' )


    // test star descent

    p1.add({a:1,d:4},'D')
    var mD = '{"match":{"a":"1","d":"4"},"data":"D"}'

    expect( JSON.stringify(p1.list()) ).toBe( '['+[mA,mB,mC,mD]+']' )
    expect( JSON.stringify(p1.list({a:1})) ).toBe( '['+[mA,mB,mC,mD]+']' )
    expect( JSON.stringify(p1.list({d:4})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({a:1,d:4})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({a:1,d:'*'})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({d:'*'})) ).toBe( '['+[mD]+']' )

    p1.add({a:1,c:33},'CC')
    var mCC = '{"match":{"a":"1","c":"33"},"data":"CC"}'

    expect( JSON.stringify(p1.list()) ).toBe( '['+[mA,mB,mC,mCC,mD]+']' )
    expect( JSON.stringify(p1.list({a:1})) ).toBe( '['+[mA,mB,mC,mCC,mD]+']' )

    expect( JSON.stringify(p1.list({d:4})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({a:1,d:4})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({a:1,d:'*'})) ).toBe( '['+[mD]+']' )
    expect( JSON.stringify(p1.list({d:'*'})) ).toBe( '['+[mD]+']' )

    expect( JSON.stringify(p1.list({c:33})) ).toBe( '['+[mCC]+']' )
    expect( JSON.stringify(p1.list({a:1,c:33})) ).toBe( '['+[mCC]+']' )
    expect( JSON.stringify(p1.list({a:1,c:'*'})) ).toBe( '['+[mC,mCC]+']' )
    expect( JSON.stringify(p1.list({c:'*'})) ).toBe( '['+[mC,mCC]+']' )


    // exact
    expect( JSON.stringify(p1.list({a:1},true)) ).toBe( '['+[mA]+']' )
    expect( JSON.stringify(p1.list({a:'*'},true)) ).toBe( '['+[mA]+']' )
    expect( JSON.stringify(p1.list({a:1,b:2},true) ) ).toBe( '['+[mB]+']' )
    expect( JSON.stringify(p1.list({a:1,b:'*'},true) ) ).toBe( '['+[mB]+']' )
    expect( JSON.stringify(p1.list({a:1,c:3},true) ) ).toBe( '[]' )
    expect( JSON.stringify(p1.list({a:1,c:33},true) ) ).toBe( '['+[mCC]+']' )
    expect( JSON.stringify(p1.list({a:1,c:'*'},true) ) ).toBe( '['+[mCC]+']' )
  })


  it('top-custom', function(){
    var p1 = patrun(function(pat,data){
      return function(args,data){
        data += '!'
        return data
      }
    })

    p1.add({},'Q')
    p1.add({a:1},'A')
    p1.add({a:1,b:2},'B')
    p1.add({a:1,b:2,c:3},'C')

    expect( p1.find({}) ).toBe( 'Q!' )
    expect( p1.find({a:1}) ).toBe( 'A!' )
    expect( p1.find({a:1,b:2}) ).toBe( 'B!' )
    expect( p1.find({a:1,b:2,c:3}) ).toBe( 'C!' )

  })


  it('mixed-values', function(){
    var p1 = patrun()

    p1.add({a:1},'A')
    p1.add({a:true},'AA')
    p1.add({a:0},'AAA')
    p1.add({a:'A',b:2},'B')
    p1.add({a:'A',b:'B',c:3},'C')

    expect( p1.find({a:1}) ).toBe( 'A' )
    expect( p1.find({a:true}) ).toBe( 'AA' )
    expect( p1.find({a:0}) ).toBe( 'AAA' )
    expect( p1.find({a:'A',b:2}) ).toBe( 'B' )
    expect( p1.find({a:'A',b:'B',c:3}) ).toBe( 'C' )

    expect( p1.list({a:1}).length ).toBe( 1 )
    expect( p1.list({a:true}).length ).toBe( 1 )
    expect( p1.list({a:0}).length ).toBe( 1 )

    p1.add({},'Q')
    expect( p1.find({}) ).toBe( 'Q' )
  })


  it('no-props', function(){
    var p1 = patrun()
    p1.add({},'Z')
    expect( p1.find({}) ).toBe( 'Z' )

    p1.add({a:1},'X')
    expect( p1.find({}) ).toBe( 'Z' )

    p1.add({b:2},'Y')
    expect( p1.find({}) ).toBe( 'Z' )

    p1.remove({b:2})
    expect( p1.find({}) ).toBe( 'Z' )
  })


  it('zero', function(){
    var p1 = patrun()
    p1.add({a:0},'X')
    expect( p1.find({a:0}) ).toBe( 'X' )
  })


  it('multi-match', function(){
    var p1 = patrun()
    p1.add({a:0},'P')
    p1.add({b:1},'Q')
    p1.add({c:2},'R')

    expect( p1.find({a:0}) ).toBe( 'P' )
    expect( p1.find({a:0,b:1}) ).toBe( 'P' )
    expect( p1.find({a:0,c:2}) ).toBe( 'P' )
    expect( p1.find({a:0,b:1,c:2}) ).toBe( 'P' )
    expect( p1.find({a:0,c:2}) ).toBe( 'P' )
    expect( p1.find({b:1,c:2}) ).toBe( 'Q' )
    expect( p1.find({c:2}) ).toBe( 'R' )

    p1.add({a:0,b:1},'S')
    expect( p1.find({a:0,b:1}) ).toBe( 'S' )
    expect( p1.find({a:0,c:2}) ).toBe( 'P' )

    p1.add({b:1,c:2},'T')
    expect( p1.find({a:0,b:1}) ).toBe( 'S' )
    expect( p1.find({a:0,c:2}) ).toBe( 'P' )
    expect( p1.find({b:1,c:2}) ).toBe( 'T' )

    p1.add({d:3},'U')
    expect( p1.find({d:3}) ).toBe( 'U' )
    expect( p1.find({a:0,d:3}) ).toBe( 'P' )
    expect( p1.find({b:1,d:3}) ).toBe( 'Q' )
    expect( p1.find({c:2,d:3}) ).toBe( 'R' )

    p1.add({c:2,d:3},'V')
    expect( p1.find({c:2,d:3}) ).toBe( 'V' )
    expect( p1.find({a:0,b:1}) ).toBe( 'S' )
    expect( p1.find({a:0,b:1,c:2,d:3}) ).toBe( 'S' )
  })



  it('noConflict', function() {
    var r = patrun().noConflict()
    r.add({},'R')
    expect(r.toString(true)).toBe(' <R>')
    expect(r.toString(false)).toBe(' -> <R>')
  })


  it('add-gex', function(){
    var p1 = patrun({gex:true})

    p1.add({a:'A'},'XA')
    expect( p1.find({a:'A'}) ).toBe( 'XA' )
    expect( p1.find({}) ).toBe( null )

    p1.add({b:'*'},'XB')
    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({b:'B'}) ).toBe( 'XB' )
    expect( p1.find({b:'0'}) ).toBe( 'XB' )
    expect( p1.find({b:2}) ).toBe( 'XB' )
    expect( p1.find({b:1}) ).toBe( 'XB' )
    expect( p1.find({b:0}) ).toBe( 'XB' )
    expect( p1.find({b:''}) ).toBe( 'XB' ) // this is correct
    expect( p1.find({}) ).toBe( null )

    p1.add({c:'*'},'XC')
    expect( p1.find({c:'A'}) ).toBe( 'XC' )
    expect( p1.find({c:'B'}) ).toBe( 'XC' )
    expect( p1.find({c:'0'}) ).toBe( 'XC' )
    expect( p1.find({c:2}) ).toBe( 'XC' )
    expect( p1.find({c:1}) ).toBe( 'XC' )
    expect( p1.find({c:0}) ).toBe( 'XC' )
    expect( p1.find({c:''}) ).toBe( 'XC' ) // this is correct
    expect( p1.find({}) ).toBe( null )

    
    expect( p1.find({b:'A',c:'A'}) ).toBe( 'XB' )

    p1.add({e:'*'},'XE')
    p1.add({d:'*'},'XD')

    //console.log(require('util').inspect(p1.top,{depth:99}))

    // alphanumeric ordering
    expect( p1.find({d:'A',e:'A'}) ).toBe( 'XD' )


    p1.add({b:0},'XB0')
    //console.log(require('util').inspect(p1.top,{depth:99}))

    p1.add({b:'B'},'XBB')
    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({b:0}) ).toBe( 'XB0' )
    expect( p1.find({b:'B'}) ).toBe( 'XBB' )
  })


  it('add-mixed-gex', function(){
    var p1 = patrun({gex:true})

    p1.add({a:'*'},'XAS')
    p1.add({a:'A'},'XA')

    p1.add({b:'A'},'XB')
    p1.add({b:'*'},'XBS')

    expect( p1.find({a:'A'}) ).toBe( 'XA' )
    expect( p1.find({a:'Q'}) ).toBe( 'XAS' )

    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({b:'Q'}) ).toBe( 'XBS' )


    p1.add({c:'B'},'XCB')
    p1.add({c:'A'},'XCA')
    p1.add({c:'*b'},'XCBe')
    p1.add({c:'*a'},'XCAe')
    p1.add({c:'b*'},'XCsB')
    p1.add({c:'a*'},'XCsA')

    expect( p1.find({c:'A'}) ).toBe( 'XCA' )
    expect( p1.find({c:'B'}) ).toBe( 'XCB' )
    expect( p1.find({c:'qb'}) ).toBe( 'XCBe' )
    expect( p1.find({c:'qa'}) ).toBe( 'XCAe' )
    expect( p1.find({c:'bq'}) ).toBe( 'XCsB' )
    expect( p1.find({c:'aq'}) ).toBe( 'XCsA' )


    expect( p1.find({a:'A'}) ).toBe( 'XA' )
    expect( p1.find({a:'Q'}) ).toBe( 'XAS' )
    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({b:'Q'}) ).toBe( 'XBS' )
  })


  it('add-order-gex', function(){
    var p1 = patrun({gex:true})

    p1.add({c:'A'},'XC')
    p1.add({c:'*'},'XCS')

    p1.add({a:'A'},'XA')
    p1.add({a:'*'},'XAS')

    p1.add({b:'A'},'XB')
    p1.add({b:'*'},'XBS')

    //console.log('\n'+require('util').inspect(p1.top,{depth:99}))
    //console.log(p1.toString(true))

    expect( p1.find({c:'A'}) ).toBe( 'XC' )
    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({a:'A'}) ).toBe( 'XA' )

    expect( p1.find({c:'Q'}) ).toBe( 'XCS' )
    expect( p1.find({b:'Q'}) ).toBe( 'XBS' )
    expect( p1.find({a:'Q'}) ).toBe( 'XAS' )
  })


  it('multi-gex', function(){
    var p1 = patrun({gex:true})

    p1.add({a:1,b:2},'Xa1b2')
    p1.add({a:1,b:'*'},'Xa1b*')
    p1.add({a:1,c:3},'Xa1c3')
    p1.add({a:1,c:'*'},'Xa1c*')
    p1.add({a:1,b:4,c:5},'Xa1b4c5')
    p1.add({a:1,b:'*',c:5},'Xa1b*c5')
    p1.add({a:1,b:4,c:'*'},'Xa1b4c*')
    p1.add({a:1,b:'*',c:'*'},'Xa1b*c*')

    //console.log(p1.toString(true))

    expect( p1.find({a:1,b:2}) ).toBe( 'Xa1b2' )
    expect( p1.find({a:1,b:0}) ).toBe( 'Xa1b*')
    expect( p1.find({a:1,c:3}) ).toBe( 'Xa1c3')
    expect( p1.find({a:1,c:0}) ).toBe( 'Xa1c*')
    expect( p1.find({a:1,b:4,c:5}) ).toBe( 'Xa1b4c5')
    expect( p1.find({a:1,b:0,c:5}) ).toBe( 'Xa1b*c5')
    expect( p1.find({a:1,b:4,c:0}) ).toBe( 'Xa1b4c*')
    expect( p1.find({a:1,b:0,c:0}) ).toBe( 'Xa1b*c*')

  })


  it('remove-gex', function(){
    var p1 = patrun({gex:true})

    p1.add({a:'A'},'XA')
    expect( p1.find({a:'A'}) ).toBe( 'XA' )
    expect( p1.find({}) ).toBe( null )

    p1.add({b:'*'},'XB')
    expect( p1.find({b:'A'}) ).toBe( 'XB' )
    expect( p1.find({b:'B'}) ).toBe( 'XB' )
    expect( p1.find({}) ).toBe( null )
    expect( p1.find({a:'A'}) ).toBe( 'XA' )

    p1.remove({b:'*'})
    expect( p1.find({b:'A'}) ).toBe( null )
    expect( p1.find({b:'B'}) ).toBe( null )
    expect( p1.find({}) ).toBe( null )
    expect( p1.find({a:'A'}) ).toBe( 'XA' )
  })

})

