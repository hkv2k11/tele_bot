const statusMessages = {
    "1": "✅ Thành công",
    "2": "⚠️ Sai mệnh giá",
    "3": "❌ Thẻ lỗi",
    "4": "🛠 Bảo trì",
    "99": "⏳ Chờ xử lý",
    "100": "📩 Gửi thẻ thất bại",
  };
  
  exports.formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };
  
  exports.hasDataChanged = (newData, previousData) => {
    const keys = ['db1', 'db2', 'db3'];
    return keys.some(key => 
      JSON.stringify(newData[key]) !== JSON.stringify(previousData[key])
    );
  };
  
  exports.generateTextData = (data) => {
    if (!data) return null;
    
    return ['db1', 'db2', 'db3', 'db4']
      .map((tableKey, index) => {
        if (!data[tableKey]?.length) return '';
        
        const shop = [
          "bloxmmo 🤓-atm",
          "khocloud 🍀-atm", 
          "Khocloud 😺", 
          "bloxmmo 🤓"
        ][index] || 'Unknown Shop';
  
        return data[tableKey]
          .map((row, idx) => formatRow(row, idx, shop, tableKey))
          .join('\n');
      })
      .filter(Boolean)
      .join('\n\n');
  };
  
  function formatRow(row, idx, shop, tableKey) {
    const isATM = ['db1', 'db2'].includes(tableKey);
    
    return isATM 
      ? `#${idx + 1}
  Mã GD: ${row.reference_number}
  Ngày GD: ${row.transaction_date}
  Số tiền: ${row.amount_in} VND
  Người dùng: ${row.code}
  Số TK: ${row.sub_account}
  Web: ${shop}`
      : `#${idx + 1}
  Mã GD: ${row.trans_id || row.code}
  Ngày GD: ${row.created_at}
  Trạng thái: ${statusMessages[row.status] || "🔍 Không xác định"}
  Số tiền: ${row.amount} VNĐ
  Serial: ${row.serial}
  Nhà mạng: ${row.telco}
  Web: ${shop}`;
  }