const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash'); // We are useing flashes for sending data to the routes when the server is redirect('/routeName') - and its part of the session methods
const mongodbStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');   // NOTICE: By using mongoose, we dont need to create the connection (typiclly the database.js)
// mongoose dose it auto for us, so we just need to listen to our local server after using .connect()

const URI = 'mongodb+srv://ido_adar:239738416@cluster0.krggc.mongodb.net/shop';
const User = require('./models/user');

const shopRoutes = require('./routes/shopRoutes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes/adminRoutes');

const app = express();
const store = new mongodbStore({    // The way we implementing session (user data - THE SAME USER!) on our database.
    uri: URI,                       // NOTICE: We stored this session once for the same user.
    collection: 'sessions'          // We can valided this by using firefox or any diffrent browser.
});
app.use(session({secret: 'my_secret_session', resave: false, saveUninitialized: false, store: store}));   // configure user session
app.use(flash()); // Configure flash
const bodyParser = require('body-parser');  // body-parser for forms
app.use(bodyParser.urlencoded());

app.set('view engine', 'ejs');  // ejs
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public'))); // css

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
})
app.use('/admin', adminRoutes); // routes
app.use('/', shopRoutes);

mongoose.connect(URI)
.then(result => {
    app.listen(3000);
})
.catch(err => console.log(err));