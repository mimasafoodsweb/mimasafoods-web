/**
 * Mimasa Foods - receives website enquiries, appends them to the first tab
 * of the "Website-Enquiries" sheet, and emails a notification.
 * Deploy as a Web app (Execute as: Me, Who has access: Anyone).
 */
const NOTIFY_EMAIL = 'mimasafoods@gmail.com';
// The "Website-Enquiries" spreadsheet (ID is the long part of its URL between /d/ and /edit)
const SPREADSHEET_ID = '1RSntpv83OwdmMUijyGv9UD1kVZvynHpgmikDeYgfhuU';
// Leave empty to write to the FIRST tab (Sheet1); or set a tab name, which is created if missing
const SHEET_NAME = '';
const HEADERS = ['Submitted at', 'Business line', 'Name', 'Company', 'Phone', 'Email', 'City', 'Message'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    // openById works whether or not the script is attached to the sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = SHEET_NAME ? (ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)) : ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    // Prefix with ' so spreadsheet formulas in user input are never executed
    const safe = (v) => (v == null ? '' : "'" + String(v).slice(0, 2000));
    sheet.appendRow([
      d.submitted_at || new Date().toISOString(),
      safe(d.business_line), safe(d.name), safe(d.company),
      safe(d.phone), safe(d.email), safe(d.city), safe(d.message),
    ]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: d.email || NOTIFY_EMAIL,
      subject: 'New website enquiry: ' + d.business_line + ' - ' + d.company,
      body: [
        'Business line: ' + d.business_line,
        'Name: ' + d.name,
        'Company: ' + d.company,
        'Phone: ' + d.phone,
        'Email: ' + d.email,
        'City: ' + d.city,
        '',
        'Message:',
        d.message || '(none)',
      ].join('\n'),
    });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}
