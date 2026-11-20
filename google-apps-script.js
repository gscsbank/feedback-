/**
 * GSCS Bank - Customer Satisfaction System
 * Galapitiyagama SANASA Co-operative Society
 * Google Apps Script Web App Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any default code in Code.gs, paste this entire file contents, and click Save (💾).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Execute as: "Me" (your email).
 * 7. Who has access: "Anyone".
 * 8. Click "Deploy", authorize permissions if prompted, and copy the "Web app URL".
 * 9. Paste that URL into the Kiosk App settings (⚙️).
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests from multiple counters
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Feedback") || ss.getActiveSheet();

    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      setupSheetHeaders(sheet);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "Asia/Colombo", "yyyy-MM-dd HH:mm:ss");

    var row = [
      formattedDate,
      data.counter || "Counter 01",
      data.branch || "Galapitiyagama",
      data.rating || 0,
      data.emoji || "",
      data.experienceSinhala || "",
      data.experienceEnglish || ""
    ];

    sheet.appendRow(row);

    // Color code the rating cell
    var lastRow = sheet.getLastRow();
    var ratingCell = sheet.getRange(lastRow, 4);
    var ratingVal = Number(data.rating);
    if (ratingVal === 5) ratingCell.setBackground("#dcfce7"); // Green
    else if (ratingVal === 4) ratingCell.setBackground("#f0fdf4");
    else if (ratingVal === 3) ratingCell.setBackground("#fefce8"); // Yellow
    else if (ratingVal === 2) ratingCell.setBackground("#fff7ed"); // Orange
    else if (ratingVal === 1) ratingCell.setBackground("#fee2e2"); // Red

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Feedback recorded successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "GSCS SANASA Customer Feedback API is active."
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupSheetHeaders(sheet) {
  var headers = [
    "දිනය සහ වේලාව (Date & Time)",
    "කවුන්ටරය (Counter / Cashier)",
    "ශාඛාව (Branch)",
    "තරු ගණන (Rating 1-5)",
    "ඉමෝජි (Emoji)",
    "ප්‍රතිචාරය (සිංහල)",
    "Feedback (English)"
  ];
  sheet.appendRow(headers);

  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0b3260");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}
