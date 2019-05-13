import ShipmentEntry from './globals/ShipmentEntry';
import {enums} from './globals/enums';
import {emailCredentials} from './credentials';

const nodemailer = require('nodemailer');
const path = require('path');

export function getEmailTitle(/** @type {ShipmentEntry} */entry) {
  return `${entry.supplier} - DAFF Results - ${ShipmentEntry.getResultsMsg(entry)} - ${ShipmentEntry.getFormatedDate(entry.deliveryDate)} - AWB:${entry.awb} - ${entry.entryNumber}`;
}

export function getEmailBody(entry) {
  return `Dear All,<br><br>Inspection Results for ${entry.supplier} shipment delivered on ${ShipmentEntry.getFormatedDate(entry.deliveryDate)} are:<br>${ShipmentEntry.getResultsMsg(entry)}.<br><br>${convertToHtml(entry.comments)}`;
}

function convertToHtml(str) {
  return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

export async function sendEmail(/** @type {ShipmentEntry} */entry) {
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
    cc: 'afi@afi.net.au',
    subject: getEmailTitle(entry),
    html: getEmailBody(entry),
  };
  if (entry.resultsImgs.length > 0) {
    mailOptions.attachments = [];
  }
  entry.resultsImgs.forEach((img, i) => {
    const cid = `cid-for-${entry.entryNumber}-${i}`;
    mailOptions.html += `<br><br><img src="cid:${cid}"/>`;
    mailOptions.attachments.push({
      cid: cid,
      path: img,
      filename: path.basename(img),
    });
  });
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('error sending email', err);
        reject(err);
      } else {
        resolve(info.messageId);
      }
    });
  });
}

export async function sendEmails(/** @type {ShipmentEntry[]} */entries) {
  const sendEmailPromises = [];
  entries.forEach(entry => sendEmailPromises.push(sendEmail(entry)));
  return Promise.all(sendEmailPromises);
}
