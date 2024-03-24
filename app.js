const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
// const { MongoClient, ObjectId } = require('mongodb');

const routerTours = require('./Routes/tours');
const routerUsers = require('./Routes/user');
const routerReviews = require('./Routes/reviews');
const routerViews = require('./Routes/views');
const AppErrors = require('./utils/appError');
const GlobalErrorHandle = require('./controllers/errorController');
const routerBooking = require('./Routes/bookingTours');

// Call app
const app = express();

// Míddleware
if (process.env.NODE_ENV === 'development') {
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
  );
}
app.use(express.json()); // kiểm tra dữ liệu trong body có phải đinh dạng JSON không --> Object JS
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Đọc dữ liệu URL khi ta dùng action form name=Owen&age=35

//thư viện querystring để xem dối tượng lồng nhau hoặc array
app.use(express.static(path.join(__dirname, './public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// Router
app.use('/', routerViews);
app.use('/api/v1/tours', routerTours);
app.use('/api/v1/users', routerUsers);
app.use('/api/v1/reviews', routerReviews);
app.use('/api/v1/bookings', routerBooking);

app.all('*', (req, res, next) => {
  next(new AppErrors(`Can't find ${req.originalUrl} on server`, 404)); // class xử lý các lỗi
});

app.use(GlobalErrorHandle);

module.exports = app;

//I. Middleware là gì?
// middleware là các hàm chức năng trung gian tham gia trong chu trình req-res, nó có thể
// được truy cập và chình sửa res và req Object, kếts thúc chu trình req-res
// nếu không sẽ dùng next() để chuyển tới middware tiếp theo
//II. Có các loại middleware nào?
// 5 dạng middleware thường thấy
//1.application-level Middle: mà middle được áp dụng ở cấp độ toàn bộ app mà không phải áp dụng cho 1 route cụ thể nào cả
// Ví dụ như: Logging - kiểm soát request tới app, xử lý lỗi, Authetication- Autherization, nén file, xử lý CORS,...
//
//2.Router Middle
//3.Error middle
//4.Built-level middle: Các middle được tích hợp sẵn như : express.static(), express.json(), express.urlencoded() --> gửi file static , xứ lý thông tin req

//5.Third-party middle: nhưng middle được dùng từ bên ngoài như là body-parse, mogan: dùng để log req

//III.Triển khai api kèm theo middleware như nào
// Tách Api thành các tài nguyên riểng rẽ
//2. định tuyến cho api kèm theo các phương thức HTTP
//3. Các middware viết app.get(midd1) nó khá khí nhìn khi maintain code
// Tiến hành viết riêng rẽ ra bên ngoài --> đặt tên theo từng chức năng cụ thể
//3. Vì cú pháp app.get(), app.post() ... --> lặp lại nhiều nên sửa thành
// app.route('path1').get(midd1).post(midd2)
//4. Sử dụng Routes để tạo ra các đường dẫn con, tách thành các file riêng trong routes
// 1.tạo routerTours  = express.Router() ---> tạo bộ định tuyến
// 2.app.use('path', routerTours) ---> gắn bộ định tuyến
// 3.routerTours.route('/).get().post() --> khai báo phương thức cho bộ định tuyến

// Tạo file controller để chứa các middleware xử lý cho từng Router
