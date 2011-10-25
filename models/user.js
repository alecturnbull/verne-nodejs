var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/library');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

function validatePresenceOf(value) {
  return value && value.length;
}

var User = new Schema({
    'name'        : String
  , 'email'       : { type: String, validate: [validatePresenceOf, 'an email is required'], unique: true }
  , 'hashed_pass' : String
  , 'salt'        : String
});

User.virtual('password')
  .set(function(password){
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function(){ return this._password });
  
User.pre('save', function(next){
  if(!validatePresenceOf(this.password)){
    next(new Error('Invalid Password'));
  } else {
    next();
  }
});

User.method('authenticate', function(plainText) {
  return this.encryptPassword(plainText) === this.hashed_password;
});

User.method('makeSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

User.method('encryptPassword', function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});