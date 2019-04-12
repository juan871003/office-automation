import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';
import {emailCredentials} from './credentials';

const nodemailer = require('nodemailer');

/*
getEmailTitle(entry) {
        // emailLogic.getEmailTitle(entry);
        return `${entry.supplier} - DAFF Results - ${ShipmentEntry.getInsectMsg(entry)} - ${this.getFormatedDate(entry.deliveryDate)} - AWB:${entry.awb} - ${entry.entryNumber}`;
      },
      getEmailBody(entry) {
        // emailLogic.getEmailBody(entry);
        return `Dear All,\n\nInspection Results for ${entry.supplier} shipment delivered on ${this.getFormatedDate(entry.deliveryDate)} is:\n${ShipmentEntry.getInsectMsg(entry)}.\n\n${entry.comments}`;
      },
*/

export function getEmailTitle(entry) {
  return `${entry.supplier} - DAFF Results - ${ShipmentEntry.getInsectMsg(entry)} - ${ShipmentEntry.getFormatedDate(entry.deliveryDate)} - AWB:${entry.awb} - ${entry.entryNumber}`;
}

export function getEmailBody(entry) {
  return `Dear All,\n\nInspection Results for ${entry.supplier} shipment delivered on ${ShipmentEntry.getFormatedDate(entry.deliveryDate)} is:\n${ShipmentEntry.getInsectMsg(entry)}.\n\n${entry.comments}`;
}

export async function sendEmail(entry) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailCredentials.user,
      pass: emailCredentials.password,
    },
  });
  const mailOptions = {
    from: 'afi@afi.net.au',
    to: enums.EmailTo[entry.supplier],
    subject: getEmailTitle(entry),
    html: getEmailBody(entry),
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('error sending email', err);
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}
