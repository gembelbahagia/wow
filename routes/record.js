const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const Multer = require('multer')
const imgUpload = require('../modules/imgUpload')
const { validationResult, Result } = require('express-validator')
const bcrypt = require('bcryptjs')
const randomstring = require('randomstring')
const sendMail = require('../helpers/sendMail')
const jwt = require('jsonwebtoken')
// const e = require('express')
const { JWT_SECRET } = process.env

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
})

// TODO: Sesuaikan konfigurasi database
const connection = mysql.createConnection({
    host: 'public_ip_sql_instance_Anda',
    user: 'root',
    database: 'nama_database_Anda',
    password: 'password_sql_Anda'
})

// router.get("/dashboard", (req, res) => {
//     const query = "select (select count(*) from records where month(records.date) = month(now()) AND year(records.date) = year(now())) as month_records, (select sum(amount) from records) as total_amount;"
//     connection.query(query, (err, rows, field) => {
//         if(err) {
//             res.status(500).send({message: err.sqlMessage})
//         } else {
//             res.json(rows)
//         }
//     })
// })

router.post("/register", (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    connection.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER(${conn.escape(
            req.body.email
        )})`,
        (err, result) => {
            if (result && result.length) {
                return res.status(409).send({
                    msg: 'This user is already in use',
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(400).send({
                            msg: err,
                        });
                    } else {
                        connection.query(
                            `INSERT INTO users (name, email, password) VALUES ('${req.body.name}',${conn.escape(
                                req.body.email
                            )},${conn.escape(hash)})`,
                            (err, result) => {
                                if (err) {
                                    return res.status(400).send({
                                        msg: err,
                                    });
                                }

                                let mailsubject = 'Mail Verif';
                                const randomToken = randomstring.generate();
                                let content = '<p> HAHAHA' + req.body.name + ', hahaha <a href="http://localhost:4000/mail-verif?token=' + randomToken + '"> hahaha </a>'
                                sendMail(req.body.email, mailsubject, content)

                                connection.query('UPDATE users set token=? where email=?', [randomToken, req.body.email], function (error, result, fields) {
                                    if (error) {
                                        return res.status(400).send({
                                            msg: err,
                                        });
                                    }
                                })
                                return res.status(200).send({
                                    msg: 'That user has been registered with us',
                                });
                            }
                        );
                    }
                });
            }
        }
    );
});

router.get("/verify-mail", (req, res) => {
    const token = req.query.token;

    connection.query('SELECT * FROM users WHERE token=? LIMIT 1', [token], (err, result, fields) => {
        if (err) {
            console.log(err.message);
        }

        if (result.length > 0) {
            connection.query('UPDATE users SET token=null, is_verified = 1 WHERE id = ?', [result[0].id], (err, result, fields) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).send({ message: 'Failed to update user verification status' });
                }

                return res.render('mailVerif', { message: 'Verification successful' });
            });
        } else {
            return res.render('404');
        }
    });
});




router.post("/login", (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    connection.query(
        `SELECT * FROM users WHERE email = ${conn.escape(req.body.email)}`,
        (err, result) => {
            if (err) {
                return res.status(400).send({
                    msg: err
                });
            }

            if (!result.length) {
                return res.status(401).send({
                    msg: 'Email or Password incorrect'
                });
            }

            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    if (bErr) {
                        return res.status(400).send({
                            msg: bErr
                        });
                    }

                    if (bResult) {
                        const token = jwt.sign({ id: result[0]['id'], is_admin: result[0]['is_admin'] }, JWT_SECRET, { expiresIn: '1h' });
                        connection.query(
                            `UPDATE users SET last_login = now() WHERE id = ${result[0]['id']}`,
                            (updateErr, updateResult) => {
                                if (updateErr) {
                                    return res.status(500).send({
                                        msg: updateErr.sqlMessage
                                    });
                                }
                                return res.status(200).send({
                                    msg: 'Logged in',
                                    token,
                                    user: result[0]
                                });
                            }
                        );
                    } else {
                        return res.status(401).send({
                            msg: 'Email or Password incorrect'
                        });
                    }
                }
            );
        }
    );
});


router.get("/getdata", (req, res) => {
    const query = "SELECT * FROM data"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

router.get("/getlast10data", (req, res) => {
    const query = "SELECT * FROM data ORDER BY date DESC LIMIT 10"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

// router.get("/gettopexpense", (req, res) => {
//     const query = "SELECT * FROM records WHERE amount < 0 ORDER BY amount ASC LIMIT 10"
//     connection.query(query, (err, rows, field) => {
//         if(err) {
//             res.status(500).send({message: err.sqlMessage})
//         } else {
//             res.json(rows)
//         }
//     })
// })

router.get("/getdata/:id", (req, res) => {
    const id = req.params.id

    const query = "SELECT * FROM data WHERE id_user = ?"
    connection.query(query, [id], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})

// router.get("/searchrecords", (req, res) => {
//     const s = req.query.s;

//     console.log(s)
//     const query = "SELECT * FROM records WHERE name LIKE '%" + s + "%' or notes LIKE '%" + s + "%'"
//     connection.query(query, (err, rows, field) => {
//         if(err) {
//             res.status(500).send({message: err.sqlMessage})
//         } else {
//             res.json(rows)
//         }
//     })
// })

// 

router.post("/insertdata", upload.single('img_url'), async (req, res) => {
    try {
        // Pastikan request memiliki header yang diperlukan
        const authToken = req.headers.authorization?.split(' ')[1];

        if (!authToken) {
            return res.status(401).json({
                error: true,
                message: 'Unauthorized: Missing JWT token',
            });
        }

        // Extract the name from the form data
        const name = req.body.name;

        // Validate the name field
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid or missing name in the form data',
            });
        }

        // Extract user information from the JWT token
        const decode = jwt.verify(authToken, JWT_SECRET);

        // Construct the data to be inserted
        const dataToAdd = {
            name,
            date: req.body.date,
            user_id: decode.id,
            img_url: req.file ? req.file.cloudStoragePublicUrl : '',
        };

        // Perform the database insertion
        await new Promise((resolve, reject) => {
            connection.query('INSERT INTO data SET ?', dataToAdd, (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    reject({
                        error: true,
                        message: 'Failed to add data to the database',
                    });
                }
                resolve();
            });
        });

        return res.status(200).json({
            error: false,
            message: 'Success',
        });
    } catch (error) {
        return res.status(500).json(error);
    }
});

// module.exports = router;

router.put("/editdata/:id", multer.single('img_url'), imgUpload.uploadToGcs, (req, res) => {
    const id = req.params.id
    const name = req.body.name
    // const amount = req.body.amount
    const date = req.body.date
    const user_id = req.body.user_id
    var imageUrl = ''

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }

    const query = "UPDATE records SET name = ?, date = ?, img_url = ?, user_id = ? WHERE id = ?"
    
    connection.query(query, [name, amount, date, notes, imageUrl, id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Update Successful"})
        }
    })
})

router.delete("/deleterecord/:id", (req, res) => {
    const id = req.params.id
    
    const query = "DELETE FROM records WHERE id = ?"
    connection.query(query, [id], (err, rows, fields) => {
        if (err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Delete successful"})
        }
    })
})

router.post("/uploadImage", multer.single('image'), imgUpload.uploadToGcs, (req, res, next) => {
    const data = req.body
    if (req.file && req.file.cloudStoragePublicUrl) {
        data.imageUrl = req.file.cloudStoragePublicUrl
    }

    res.send(data)
})

module.exports = router