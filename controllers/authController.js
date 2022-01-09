const User = require('../models/User')
const jwt = require('jsonwebtoken');

//handle errors

const handleErrors = (error) => {
  console.log(error.message, error.code);
  let errors = { email: '', password: ''};

//incorrect email

if (error.message === 'You no right email') {
    errors.email = 'that email is not registered'
}

//incorrect password

if (error.message === 'You no right password') {
    errors.password = 'that password is not right'
}

  //duplicate error code

  if (error.code === 11000) {
      errors.email = 'That email is already in use';
      return errors;
  }

    //validation errors
    if (error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
        return errors;
    }

    //create web token

    const maxAge = 3 * 24 * 60 * 60;

    const createToken = (id) => {
        return jwt.sign({ id }, 'super secret', {
            expiresIn: maxAge
        });
    }

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

//signup funtionality
module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;

    try {
     const user = await User.create({ email, password });
     const token = createToken(user._id);
     res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
     res.status(201).json({ user: user._id });
    } catch (error) {
      const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id})
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
    
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1});
    res.redirect('/');
}