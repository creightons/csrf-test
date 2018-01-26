const { Strategy: LocalStrategy } = require('passport-local');

const users = [
    { id: 1, username: 'user', password: 'pass' },
];

function findUserById(id) {
    let user;
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            user = users[i];
        }
    }

    return user;
}

function findUserByUsername(username) {
    let user;
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            user = users[i];
        }
    }

    return user;
}

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        let err = null;
        const user = findUserById(id);

        if (user === undefined || user === null) {
            err = new Error('could not find user to deserialize');
        }

        return done(err, user);
    });

    passport.use('local',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true,
            },
            function(req, username, password, done) {
                let err = null;
                const user = findUserByUsername(username);

                if (user === undefined || user === null) {
                    err = new Error('user missing');
                }
                else if (user.password !== password) {
                    err = new Error('password mismatch');
                }

                return done(err, user);
            }
        )
    );
};
