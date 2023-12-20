// const e = require('express')
const nodemailer = require('nodemailer')
const {SMTP_MAIL, SMTP_PASSWORD} = process.env

const sendMail = async (email, mailsubject, content) => {

    try{
        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:SMTP_MAIL,
                pass:SMTP_PASSWORD
            },
            tls:{
                rejectUnauthorized: false
            }
        })

        const mailOptions = {
            from:SMTP_MAIL,
            to:email,
            subject: mailsubject,
            html:content
        }

        transport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
            }else{
                console.log('MAIL SENT SUCCES', info.response)
            }
        })
    }catch(err){
        console.log(err)
    }
}

module.exports = sendMail