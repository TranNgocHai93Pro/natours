// synchronous
const fs = require('fs');

const replaceContent = require('./modules/replaceTemplate');

// đoc file 1 cách đồng bộ
// const readInput = fs.readFileSync('./input/input.txt', 'utf8');
//ghi vào file mới
// const writeInput = fs.writeFileSync(
//   './input/output.txt',
//   `Data read from input.txt is: ${readInput},\n date: ${Date.now()}`,
// );
// synchronous and asynchronous: đồng bộ và bât đồng bộ
//synchronous - blocking: các mã được thực hiện 1 cách tuần tự, mã sau sẽ được thực thi khi mã trước đó kêt thúc
// nodeJs được thiết kế đơn luồng

// Non-Blocking

// fs.readFile('./input111/input.txt', 'utf-8', (err, data1) => {
//     if(err) return console.log('Error .....')
//     fs.readFile(`./input/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2)
//     })
// })

// console.log('print after fs.readFile')

const User = function (name, email) {
  this.name = name;
  this.email = email;
  this.onLine = false;
};
User.prototype.logIn = function () {
  this.onLine = true;
  return `${this.name} successfully logged in`;
};

User.prototype.logOut = function () {
  if (this.onLine) {
    this.onLine = false;
    return `${this.name} successfully logged out`;
  }
  return 'You are not logged in.';
};
// const sharedState = {
//   onlineUsers: [],
// };

// const user1 = new User('John', 'john@example.com', sharedState);
// const user2 = new User('Alice', 'alice@example.com', sharedState);

function Admin(...arg) {
  User.apply(this, arg);
  this.role = 'super admin';
}
Admin.prototype = Object.create(User.prototype);

const admin = new Admin('Win', 'hacker@gmail.com');
console.log(admin);
console.log(admin.logIn());
admin.logOut();

const http = require('http');
const url = require('url');

const path = require('path');

const templateProduct = fs.readFileSync(
  path.join(__filename, 'product.html'),
  'utf-8',
);

const templateOverview = fs.readFileSync(
  path.join(__filename, 'overview.html'),
  'utf-8',
);

const templateCard = fs.readFileSync(
  path.join(__filename, 'card.html'),
  'utf-8',
);

const data = fs.readFileSync(path.join(__filename, 'data.js'), 'utf-8');
const arrayData = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.URL(req.url, true);

  //OverView
  if (pathname === '/' || pathname === '/overview') {
    const htmlCard = arrayData
      .map((el) => replaceContent(templateCard, el))
      .join('');
    const overViewHtml = templateOverview.replace(
      /{%PRODUCT_CARDS%}/g,
      htmlCard,
    );
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(overViewHtml);

    // Api
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
      'my-own-header': 'fetcht api successfull',
    });
    res.end(data);

    // product Id
  } else if (pathname === '/product') {
    // const id = query.id;
    const { id } = query;
    const htmlProduct = replaceContent(templateProduct, arrayData[id]);
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(htmlProduct);

    // 404 Not Found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': '404 not Found',
    });
    res.end('<h1>404 Not Found</h1>');
  }
});

server.listen(5800, '127.0.0.1', () => {
  console.log('Connected with port 5800');
});

// npm i namePackage --global , với MacOs sudo npm i namePackage --global
// npm update namePackage
// npm outdated: watch the list các package hết hạn
// có 2 dependences : similar dependences và dev dependences,
// dev dependences: dùng cho môi trường phát triển, khi lên môt trường product thì không còn nưa
// Ex: weback, nodemon...
// Khi cập nhật package : '^..' : nâng cấp lên phiên bản 1.x. không lên 2.x
// "~..." chỉ cập nhật phiên bản vá lỗi
// '*...' cập nhật tất cả các phiên bản
// Chú ý rằng; việc cập nhật phiên bản ảnh hưởng lớn đến các dự án đã làm
// các packages được nâng cấp thường xuyên nên việc xung đột là có thể xảy ra : '^~'
// const tasks = [
//   { name: 'Task A', time: 6000 },
//   { name: 'Task B', time: 1000 },
//   { name: 'Task C', time: 4000 },
//   { name: 'Task D', time: 800 },
// ];

// function performTask(task) {
//   console.log(`Started ${task.name}`);
//   const startTime = Date.now(); // Thời điểm bắt đầu thực hiện tác vụ

//   const timeout = setTimeout(() => {
//     console.log(`Completed ${task.name}`);
//     performNextTask();
//   }, task.time);

//   const checkInterval = setInterval(() => {
//     const currentTime = Date.now();
//     const elapsedTime = currentTime - startTime;
//     // console.log(elapsedTime);

//     if (elapsedTime > 3000) {
//       // Nếu thời gian thực hiện vượt quá 3 giây, hủy tác vụ và thử lại sau.
//       clearTimeout(timeout);
//       clearInterval(checkInterval);
//       console.log(`Task ${task.name} took too long. Retrying...`);
//       console.log(`............`);
//       performNextTask();
//     }
//   }, 100);
// }

// function performNextTask() {
//   const task = tasks.shift();
//   if (task) {
//     performTask(task);
//   } else {
//     console.log('Complete ....');
//   }
// }

// performNextTask();

// timeout_vs_immediate.js

// Event Loop:
// Timers, I/O , setImmediate(), close();
const crypto = require('crypto');
const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1;
setTimeout(() => {
  console.log('Timer 1 complete.');
}, 0);

fs.readFile(path.join(__filename, 'input.txt'), 'utf-8', () => {
  console.log(' I/O complete.');

  setTimeout(() => {
    console.log('Timer 2 complete.');
  }, 0);

  setImmediate(() => {
    console.log('Immediate 2 complete.');
  });

  process.nextTick(() => {
    console.log('nextTick complete...');
  });

  const x = crypto.pbkdf2Sync('password', 'salt', 10000, 2048, 'sha512');
  console.log(Date.now() - start, x);
  crypto.pbkdf2('password', 'salt', 10000, 2048, 'sha512', () => {
    console.log(Date.now() - start, 'crypto 2...');
  });
  crypto.pbkdf2('password', 'salt', 10000, 2048, 'sha512', () => {
    console.log(Date.now() - start, 'crypto 3...');
  });
  crypto.pbkdf2('password', 'salt', 10000, 2048, 'sha512', () => {
    console.log(Date.now() - start, 'crypto 4...');
  });
});

setImmediate(() => {
  console.log('Immediate complete.');
});

console.log('Hello Everyone - this code is Top-level.');
// vì phụ thuộc và hiệu dẫn đến không biết thứ tự setTimeout hay setImmediate sẽ được thực thi trước
// nhưng nếu đặt trong callback của I/O thì sẽ setImmeadiate sẽ luôn được thực thi đầu tiên
// dùng process.env.UV_THREADPOOL_SIZE = 4; Thi tương đương với số nhớm luồng được thực thi đôc lập bên ngaoi
// trả về ngay sau đó,
// nếu để các hoạt động năng như,
//1. I/O file Api, 2. Compress, 3.Cryptgraph,

// Chú ý không thưc hiên các nhiệm vụ này trong Event-Loop
//. 1. độc file. nên file, Cryptgraph
// 2. truyền tải JSON lớn
// 3. thực hiện các tính toán phức tạp
// 4. sử dụng cac biểu thức phức tạp

// Event-driven Architecture: Cấu trúc hướng sự kiện
// Event emit ----> listen Event ---> Excuted Callbacks
