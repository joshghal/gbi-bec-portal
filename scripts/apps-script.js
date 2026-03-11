function createFormSheets() {
  var SA_EMAIL = "firebase-adminsdk-fbsvc@baranangsiang-evening-chur.iam.gserviceaccount.com";
  var sheets = {
    "kom": "Formulir KOM",
    "baptism": "Formulir Baptisan",
    "child-dedication": "Formulir Penyerahan Anak",
    "prayer": "Formulir Pokok Doa"
  };
  var result = {};
  for (var key in sheets) {
    var ss = SpreadsheetApp.create(sheets[key]);
    ss.getSheets()[0].setName("Setup");
    DriveApp.getFileById(ss.getId()).addEditor(SA_EMAIL);
    DriveApp.getFileById(ss.getId()).setSharing(
      DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW
    );
    result[key] = { id: ss.getId(), url: ss.getUrl() };
  }
  Logger.log(JSON.stringify(result));
}
