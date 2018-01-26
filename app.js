const express = require('express');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const configurePassport = require('./configure-passport');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'templates');

app.use(morgan('default'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'some secret',
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use(csrf());

// Middleware to force a single csrf token per session.
// Must be added after session and csrf middleware.
app.use((req, res, next) => { 
    try {
        if (!req.session.currentCsrfToken) {
            req.session.currentCsrfToken = req.csrfToken();
        }
    }
    catch(error) {
        return next(error);
    }

    return next();
});

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    if (0 && req.isAuthenticated()) {
        return res.redirect('/page');
    }
    else {
        return res.render('index', { token: req.session.currentCsrfToken });
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/'); }
        req.logIn(user, err => {
            if (err) { return next(err); }
            delete req.session.currentCsrfToken;
            return res.redirect('/page');
        });
    })(req, res, next);
});

/*
app.post('/login', passport.authenticate('local', {
    successRedirect: '/page',
    failureRedirect: '/',
}));
*/

app.post('/logout', (req, res) => {
    delete req.session.currentCsrfToken;
    req.logout();
    res.redirect('/');
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        console.log('ERROR: User not authenticated');
        res.redirect('/');
    }
}

app.get('/page', isAuthenticated, (req, res) => {
    res.render('page', { token: req.session.currentCsrfToken });
});

app.post('/page', isAuthenticated, (req, res) => {
    res.render('page');
});

app.post('/test-token', isAuthenticated, (req, res) => {
    res.status(200).send({ success: true });
});

app.get('/session-data', (req, res) => {
    res.status(200).send({ session: req.session });
});

app.listen(3000, () => {
    console.log('listening...');
});
