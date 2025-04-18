// Google Apps Script để kết nối ứng dụng web với Google Sheets
// Hướng dẫn: Tạo một Google Sheets mới, sau đó vào Extensions > Apps Script và dán code này vào

// ID của Google Sheets (lấy từ URL của Sheets)
const SHEET_ID = '1ReKxAPopqAaSdeVj0yyapp7jX3vQm2fAYw3iHVmOQG4'; // ID đã được cập nhật
const SHEET_NAME = 'Transactions'; // Tên sheet trong bảng tính

// Hàm xử lý các yêu cầu từ ứng dụng web
function doPost(e) {
  try {
    // Lấy dữ liệu từ yêu cầu
    const data = JSON.parse(e.postData.contents);
    
    // Lấy tham chiếu đến sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Nếu sheet không tồn tại, tạo mới
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Tạo hàng tiêu đề
      newSheet.appendRow(['ID', 'Ngày', 'Mô tả', 'Số tiền', 'Thời gian đồng bộ']);
      
      // Định dạng hàng tiêu đề
      newSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f3f3f3');
      
      return handleTransactions(data, newSheet);
    }
    
    return handleTransactions(data, sheet);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify({
      result: 'error',
      error: error.toString()
    }));
  }
}

// Xử lý CORS - cho phép OPTIONS request
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

// Hàm xử lý chính
function handleRequest(e) {
  try {
    // Lấy dữ liệu từ yêu cầu
    const data = JSON.parse(e.postData.contents);
    
    // Lấy tham chiếu đến sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Nếu sheet không tồn tại, tạo mới
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Tạo hàng tiêu đề
      newSheet.appendRow(['ID', 'Ngày', 'Mô tả', 'Số tiền', 'Thời gian đồng bộ']);
      
      // Định dạng hàng tiêu đề
      newSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f3f3f3');
      
      return handleTransactions(data, newSheet);
    }
    
    return handleTransactions(data, sheet);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Xử lý dữ liệu giao dịch
function handleTransactions(data, sheet) {
  // Xóa dữ liệu cũ (giữ lại hàng tiêu đề)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Thời gian đồng bộ
  const syncTime = new Date().toLocaleString();
  
  // Thêm dữ liệu mới
  data.forEach(transaction => {
    sheet.appendRow([
      transaction.id,
      transaction.date,
      transaction.description,
      transaction.amount,
      syncTime
    ]);
  });
  
  // Định dạng cột số tiền
  const lastRowAfterUpdate = sheet.getLastRow();
  if (lastRowAfterUpdate > 1) {
    const amountRange = sheet.getRange(2, 4, lastRowAfterUpdate - 1, 1);
    amountRange.setNumberFormat('#,##0.00 ₫');
    
    // Đặt màu cho số dương và số âm
    const amountValues = amountRange.getValues();
    for (let i = 0; i < amountValues.length; i++) {
      if (amountValues[i][0] >= 0) {
        sheet.getRange(i + 2, 4).setFontColor('green');
      } else {
        sheet.getRange(i + 2, 4).setFontColor('red');
      }
    }
  }
  
  // Lấy dữ liệu để trả về cho client
  const allData = getAllTransactions(sheet);
  
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success',
    transactions: allData
  })).setMimeType(ContentService.MimeType.JSON);
}

// Lấy tất cả giao dịch từ sheet
function getAllTransactions(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  
  return data.map(row => {
    return {
      id: row[0],
      date: row[1],
      description: row[2],
      amount: row[3]
    };
  });
}

// Hàm này được sử dụng khi bạn muốn test web app
function doGet() {
  return ContentService.createTextOutput("Web app đang hoạt động!")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Hàm khởi tạo để tạo menu trong Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Ứng dụng Thu Chi')
    .addItem('Thiết lập Web App', 'setupWebApp')
    .addToUi();
}

// Hàm hiển thị hướng dẫn thiết lập Web App
function setupWebApp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Hướng dẫn Thiết lập',
    '1. Chọn Deploy > New deployment\n' +
    '2. Chọn "Web app" cho Type of deployment\n' +
    '3. Thiết lập trong mục "Execute as" là bạn\n' +
    '4. Thiết lập trong mục "Who has access" là "Anyone"\n' +
    '5. Bấm Deploy và cấp quyền khi được yêu cầu\n' +
    '6. Sao chép URL được cung cấp và dán vào biến GOOGLE_SCRIPT_URL trong file script.js của ứng dụng web',
    ui.ButtonSet.OK
  );
} 