class AppErrors extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true; // Liên quan đến hoạt động lỗi liên quan hệ thống, đánh dấu lỗi nào
    // là lỗi hệ thống xuất phát từ người dùng

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppErrors;

// Mỗi khi 1 error được bắt thì đều đi qua AppErrors nhắm :
//1. Đánh dấu là lỗi hệ thống thông qua biến isOperatinal = true từ đó xuất ra dạng lỗi
//2. Làm tinh gọn lỗi dễ hiểu hơn thay vì xuất ra cả tá dong lỗi
