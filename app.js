var express           =     require('express')
  , passport          =     require('passport')
  , app               =     express()
    ,util            =     require('util')
    , FacebookStrategy  =     require('passport-facebook').Strategy
    , session           =     require('express-session')
    , cookieParser      =     require('cookie-parser')
    , bodyParser        =     require('body-parser')
    , config            =     require('./configuration/config')
    , mysql             =     require('mysql');
var connection = mysql.createConnection({
    host     : config.host,
    user     : config.username,
    password : config.password,
    database : config.database
});
if(config.use_database==='true')
{
    connection.connect();
}

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
        clientID: config.facebook_api_key,
        clientSecret:config.facebook_api_secret ,
        callbackURL: config.callback_url,
        profileFields:config.Profile_fields
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            //Check whether the User exists or not using profile.id
            if(config.use_database==='true')
            {
                connection.query("SELECT * from user_info where user_id="+profile.id,function(err,rows,fields){
                    if(err) throw err;
                    if(rows.length===0)
                    {
                        console.log("There is no such user, adding now");
                        connection.query("INSERT into user_info(user_id,user_data) VALUES('"+profile.id+"','"+JSON.stringify(profile._json)+"')");
                    }
                    else
                    {
                        console.log("User already exists in database");
                    }
                });
            }
            return done(null, profile);
        });
    }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'viral', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(config.PORT);
require('./route/routes')(app, passport,io);
