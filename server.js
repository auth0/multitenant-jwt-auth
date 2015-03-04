var express = require('express');
var expressJwt = require('express-jwt');
var LRU = require('lru-cache');
var data =require('./data');

var app = express();

var secretsCacheOptions = {
  // 5 M unicode points => ~10 MB
  max: 1024 * 1024 * 5,
  length: function (s) { return s.length },
  maxAge: 1000 * 60 * 5
};

var jtiCacheOptions = {
  // 5 M unicode points => ~10 MB
  max: 1024 * 1024 * 5,
  length: function (s) { return 1; },
  // 5 minutes, x509 CRLs expire in ~1hour so this should be ok
  maxAge: 1000 * 60 * 5
};

var secretsCache = LRU(secretsCacheOptions);
var jtiCache = LRU(jtiCacheOptions);

var secretCallback = function(req, payload, done){
  var audience = payload.aud;
  var cachedSecret = secretsCache.get(audience);

  if (cachedSecret) { return done(null, cachedSecret); }

  data.getTenantByIdentifier(audience, function(err, tenant){
    if (err) { return done(err); }
    if (!tenant) { return done(new Error('missing_secret')); }

    var secret = tenant.secret;
    secretsCache.set(audience, secret);
    done(null, secret);
  });
};

var isRevokedCallback = function(req, payload, done){
  var tokenId = payload.jti;
  if (!tokenId){
    // if it does not have jti it cannot be revoked
    return done(null, false);
  }

  var tokenIdentifier = payload.aud + ':' + payload.jti;
  var blacklisted = jtiCache.get(tokenIdentifier);
  if (typeof blacklisted !== 'undefined') { return done(null, blacklisted); }

  data.getRevokedTokenByIdentifier(tokenIdentifier, function(err, token){
    if (err) { return done(err); }
    blacklisted = !!token;
    jtiCache.set(tokenIdentifier,blacklisted)
    return done(null, blacklisted);
  });
};

var check_scopes = function(scopes) {
  return function(req, res, next) {
    //
    // check if any of the scopes defined in the token,
    // is one of the scopes declared on check_scopes
    //
    var user = req.user;

    var sufficientScope = scopes.some(function(expectedScope){
      return user.scopes.indexOf(expectedScope) !== -1;
    });

    if (sufficientScope){ return next(); }

    return res.status(401).json({ name: 'UnauthorizedError', code: 'insufficient_scopes'});
  }
}

// to protect /api routes with JWTs
app.use('/api', expressJwt({
  secret: secretCallback,
  isRevoked: isRevokedCallback
}));

app.get('/api/users',
  check_scopes(['read_users']),
  function (req, res) {
  data.getUsersByTenantIdentifier(req.user.aud, function(err, users){
    res.json(users);
  });
});

app.use('/api', function(err, req, res, next){
  if (err.status){
    return res.status(err.status).json({ name: err.name, code: err.code });
  }

  next();
});

app.listen(8080, function () {
  console.log('listening on http://localhost:8080');
});