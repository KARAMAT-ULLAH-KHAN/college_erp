 import express from "express";

        export default function logout(){
            const router = express.Router();

            router.get('/', (req, res, next) => {
                        req.logout(function(err) {

                            if (err) { 
                                    return next(err); 
                            }
                            req.session.destroy(() => {
                                    res.clearCookie('connect.sid'); // clears the session cookie
                                    res.redirect('/'); // redirect to login page
                            });
                        });
                        });


            return router;
        }