var jwt = require('jsonwebtoken');
const config = require('../config');

function verifyToken(req, res, next) {
    var token = req.headers['x-access-token'];
    if (token == null || !token)
    {
        token = req.headers['authorization'];
        token = token.replace("Bearer ", "");
    }
    if (!token || token == null)
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err)
      return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
      // if everything good, save to request for use in other routes
      req.userId = decoded.id;
      req.spaceId = req.headers.spaceid;
      req.account_type = decoded.account_type;
      console.log("auth : " + JSON.stringify(decoded));
      next();
    });
  }

  exports.verifyToken = verifyToken;