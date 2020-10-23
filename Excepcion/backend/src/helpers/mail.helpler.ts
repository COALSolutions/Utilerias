import * as nodemailer from 'nodemailer';
// email sender function
export const sendEmail = function(req: any, res : any){
    // Definimos el transporter
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'appgrupoandrade@gmail.com',
            pass: 'Andrade13*123'
        }
    });
// Definimos el email
var mailOptions = {
    from: 'AppAndrade',
    to: req.email,
    subject: req.subject,
    html: req.body,
    attachments: req.attachments
};
// Enviamos el email
transporter.sendMail(mailOptions, function(error: any,info:any){
    if (error){
        //console.log(error);
        res.status(200).jsonp(req.body)
       // res.send(500, error.message);
    } else {
        res.status(200).jsonp(req.body);
    }
});
};