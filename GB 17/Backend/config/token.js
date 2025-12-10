const jwt = require('jsonwebtoken');

const secret = process.env.secret;


function setUser(user,expiresIn){
    const payload = {
        _id: user._id,
        email:user.email
    };
    return jwt.sign(payload,secret,{expiresIn});
}

function getUser(token){
    return jwt.verify(token,secret);
}

module.exports = {setUser,getUser}