// Paste this into script.google.com → New Project → Run
function createMClassSheet() {
  var SA_EMAIL = "firebase-adminsdk-fbsvc@baranangsiang-evening-chur.iam.gserviceaccount.com";
  var ss = SpreadsheetApp.create("Formulir M-Class");
  ss.getSheets()[0].setName("Setup");
  DriveApp.getFileById(ss.getId()).addEditor(SA_EMAIL);
  DriveApp.getFileById(ss.getId()).setSharing(
    DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW
  );
  Logger.log(JSON.stringify({ mclass: { id: ss.getId(), url: ss.getUrl() } }));
}
