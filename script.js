// Khởi tạo ngày hiện tại cho input
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('date-input').value = formattedDate;
    
    // Tải dữ liệu đã lưu
    loadData();

    // Thêm sự kiện cho nút thêm
    document.getElementById('add-btn').addEventListener('click', addTransaction);
    
    // Thêm sự kiện cho nút đồng bộ
    document.getElementById('sync-btn').addEventListener('click', syncWithGoogleSheets);
});

// URL của Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNcw0gL89Qx36ucruCuv06mAp6kAK2cOGElou1fD9NcGnyxLCJAwxuC7e9DMBhiXdN/exec'; // URL mới được cập nhật

// Lưu trữ dữ liệu
let transactions = JSON.parse(localStorage.getItem('transactions')) || {};

// Thêm giao dịch mới
function addTransaction() {
    const dateInput = document.getElementById('date-input').value;
    const amountInput = document.getElementById('amount-input').value;
    const descriptionInput = document.getElementById('description-input').value;
    
    if (!dateInput || !amountInput) {
        alert('Vui lòng nhập ngày và số tiền!');
        return;
    }
    
    const amount = parseFloat(amountInput);
    
    // Tạo đối tượng giao dịch
    const transaction = {
        id: Date.now(), // ID duy nhất dựa trên timestamp
        date: dateInput,
        amount: amount,
        description: descriptionInput || (amount >= 0 ? 'Thu nhập' : 'Chi phí')
    };
    
    // Thêm vào mảng giao dịch
    if (!transactions[dateInput]) {
        transactions[dateInput] = [];
    }
    
    transactions[dateInput].push(transaction);
    
    // Lưu vào localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Xóa nội dung input
    document.getElementById('amount-input').value = '';
    document.getElementById('description-input').value = '';
    
    // Hiển thị lại dữ liệu
    loadData();
}

// Tải và hiển thị dữ liệu
function loadData() {
    const dailyRecordsElement = document.querySelector('.daily-records');
    dailyRecordsElement.innerHTML = '';
    
    // Sắp xếp các ngày theo thứ tự giảm dần (mới nhất trước)
    const sortedDates = Object.keys(transactions).sort().reverse();
    
    if (sortedDates.length === 0) {
        dailyRecordsElement.innerHTML = '<p class="no-data">Chưa có dữ liệu nào. Hãy thêm giao dịch đầu tiên của bạn!</p>';
        return;
    }
    
    // Hiển thị từng ngày
    sortedDates.forEach(date => {
        const dayTransactions = transactions[date];
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';
        
        // Tính tổng của ngày
        const dayTotal = dayTransactions.reduce((total, transaction) => {
            return total + transaction.amount;
        }, 0);
        
        // Tạo HTML cho header ngày
        const formattedDate = formatDate(date);
        dayContainer.innerHTML = `
            <div class="day-header">
                <h2>Ngày ${formattedDate}</h2>
            </div>
        `;
        
        // Tạo container cho các giao dịch
        const transactionsContainer = document.createElement('div');
        transactionsContainer.className = 'transactions';
        
        // Thêm từng giao dịch
        dayTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction';
            
            const amountClass = transaction.amount >= 0 ? 'amount-positive' : 'amount-negative';
            const formattedAmount = formatCurrency(transaction.amount);
            
            transactionElement.innerHTML = `
                <span class="description">${transaction.description}</span>
                <span class="amount ${amountClass}">${formattedAmount}</span>
            `;
            
            transactionElement.addEventListener('click', () => {
                if (confirm('Bạn có muốn xóa giao dịch này không?')) {
                    deleteTransaction(date, transaction.id);
                }
            });
            
            transactionsContainer.appendChild(transactionElement);
        });
        
        dayContainer.appendChild(transactionsContainer);
        
        // Thêm tổng ngày
        const totalElement = document.createElement('div');
        totalElement.className = `day-total ${dayTotal >= 0 ? 'total-positive' : 'total-negative'}`;
        totalElement.textContent = `Tổng cộng: ${formatCurrency(dayTotal)}`;
        dayContainer.appendChild(totalElement);
        
        dailyRecordsElement.appendChild(dayContainer);
    });
}

// Xóa giao dịch
function deleteTransaction(date, id) {
    transactions[date] = transactions[date].filter(transaction => transaction.id !== id);
    
    // Nếu ngày không còn giao dịch nào, xóa ngày đó
    if (transactions[date].length === 0) {
        delete transactions[date];
    }
    
    // Lưu vào localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Hiển thị lại dữ liệu
    loadData();
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Đồng bộ với Google Sheets
function syncWithGoogleSheets() {
    const syncStatus = document.getElementById('sync-status');
    syncStatus.textContent = 'Đang đồng bộ...';
    
    // Chuyển đổi dữ liệu thành mảng để gửi đi
    const dataToSend = [];
    
    for (const date in transactions) {
        transactions[date].forEach(transaction => {
            dataToSend.push({
                id: transaction.id,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount
            });
        });
    }
    
    // Thêm mode=no-cors để giải quyết vấn đề CORS
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.result === 'success') {
            syncStatus.textContent = 'Đồng bộ thành công lúc ' + new Date().toLocaleTimeString();
            
            // Nếu có dữ liệu mới từ Google Sheets, cập nhật dữ liệu cục bộ
            if (data.transactions) {
                updateFromGoogleSheets(data.transactions);
            }
        } else {
            syncStatus.textContent = 'Lỗi: ' + data.error;
        }
    })
    .catch(error => {
        // Hiển thị hướng dẫn khi có lỗi
        syncStatus.innerHTML = `Lỗi kết nối: ${error.message}<br>
            <small>Có thể Google chặn CORS. Mở Google Sheets và kiểm tra dữ liệu trực tiếp:</small><br>
            <a href="https://docs.google.com/spreadsheets/d/1ReKxAPopqAaSdeVj0yyapp7jX3vQm2fAYw3iHVmOQG4/edit" target="_blank">Mở Google Sheets</a>`;
    });
}

// Cập nhật dữ liệu từ Google Sheets
function updateFromGoogleSheets(sheetsData) {
    // Xóa dữ liệu cũ
    transactions = {};
    
    // Thêm dữ liệu mới
    sheetsData.forEach(item => {
        if (!transactions[item.date]) {
            transactions[item.date] = [];
        }
        
        transactions[item.date].push({
            id: item.id,
            date: item.date,
            amount: parseFloat(item.amount),
            description: item.description
        });
    });
    
    // Lưu dữ liệu mới vào localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Hiển thị lại dữ liệu
    loadData();
} 