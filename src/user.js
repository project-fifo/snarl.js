var bert = require('bert');
var net = require('net');
var _user = {type: 'atom', value: 'user'};

function t(L) {
  L.type = 'tuple';
  return L;
};

function m(C, P) {
  var T = C.map(bert.atom);
  T = T.concat(P);
  T.unshift(_user);
  return bert.encode(t(T));
}


User = {
  list: function(Realm) {
    return m(['list'], [Realm]);
  },
  get: function(Realm, User) {
    return m(['get'], [Realm, User]);
  },
  set: function(Realm, User, Attribute, Value) {
    return m(['set'], [Realm, User, Attribute, Value]);
  },
  lookup: function(Relam, Name) {
    return m(['lookup'], [Realm, Name]);
  },
  add: function(Relam, Name) {
    return m(['add'], [Realm, Name]);
  },
  auth: function(Relam, Login, Pass) {
    return m(['auth'], [Realm, Login, Pass]);
  },
  test_list: function(Host, Port, Realm) {
    var User = this;
    var client = net.connect({
      host: Host,
      port: Port}, function() { //'connect' listener
        var size = null, buf = "";
        console.log('client connected');

        client.on('data', function(data) {
          buf += data.toString("binary");
          while (size || buf.length >= 4) {
            if (size == null) {
              // read BERP length header and adjust buffer
              size = bert.bytes_to_int(buf, 4);
              buf = buf.substring(4);
            } else if (buf.length >= size) {
              // TODO: improve error handling
              // should take care of:
              // * incorrect BERT-packet
              // * call exception
              try {
                var s = bert.decode(buf.substring(0, size));
                console.log("data:", s);
                console.log("bin:", bert.bin_repr(s));
                console.log("decoded:", bert.decode(s));
              } catch (e) {
                console.log(e);
              }
              buf = buf.substring(size);
              size = null;
            } else {
              // nothing more we can do
              break;
            }
          }
        });
        var data = User.list(Realm);
        var packet = new Buffer(bert.int_to_bytes(data.length, 4) + data, "binary");
        client.write(packet);
      });
  }
};

// common JS
exports = module.exports = User;
