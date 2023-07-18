const mailer = require('nodemailer');
const  goodbye  = require('./goodbye_template');
const welcome = require('./welcome_template');

const getEmailData = (to, name, template) => {
  let data = null;

  switch (template) {
    case "welcome":
      data = {
        from: '우사기 <userId@gmail.com>',
        to: to,
        subject: `Hello ${name}`,
        html: welcome()
      }
    break;

    case "goodbye":
      data = {
        from: '우사기 <userId@gmail.com>',
        to: to,
        subject: `Goodbye ${name}`,
        html: goodbye()
      }
    break;
    default: data;
  }
  return data;
}

const sendEMail = (to, name, type) => {
  const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.EMAIL
    }
  });
  
  const mail = getEmailData(to, name, type); // 누구에게, 이름, 환영 이메일인지 탈퇴 이메일인지 등

  transporter.sendMail(mail, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log('email sent successfully!');
    }
    transporter.close();
  })
}

module.exports = sendEMail;