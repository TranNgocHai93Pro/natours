const { Transform } = require('stream')
const fs = require('fs')
// const commaSplitter = new Transform({
//   readableObjectMode: true,

//   transform(chunk, encoding, callback) {
//     // this.push(chunk.toString().trim().split(','));
//     callback(null, chunk.toString().trim().split(','));
//   },
// });

// const arrayToObject = new Transform({
//   readableObjectMode: true,
//   writableObjectMode: true,

//   transform(chunk, encoding, callback) {
//     console.log(chunk);
//     const obj = {};
//     for (let i = 0; i < chunk.length; i += 2) {
//       obj[chunk[i]] = chunk[i + 1];
//     }
//     this.push(obj);
//     callback();
//   },
// });

// const objectToString = new Transform({
//   writableObjectMode: true,

//   transform(chunk, encoding, callback) {
//     this.push(JSON.stringify(chunk) + '\n');
//     callback();
//   },
// });
// const readStream = fs.createReadStream('./input/input.txt');
// const writeStream = fs.createWriteStream('output.txt');

// readStream
//   .pipe(commaSplitter)
//   .on('data', () => process.stdout.write('.'))
//   .pipe(arrayToObject)
//   .pipe(objectToString)
//   .pipe(writeStream);
// for (var i = 0; i < 5; i++) {
//   (function (index) {
//     setTimeout(function () {
//       console.log(index);
//     }, 1000);
//   })(i);
// }

// Node.js program to demonstrate the
// pipe event

// Create a readable stream
const readableStream = fs.createReadStream('./input/input.txt')

// Create a writable stream
const writableStream = fs.createWriteStream('output.txt')

const server = require('http').createServer()

server.on('request', (req, res) => {
  readableStream.on('data', (chunk) => {
    res.write(chunk)
  })
  readableStream.on('end', () => res.end())
  readableStream.on('error', (err) => console.log(err))
})

let x = 'Fuck em đi. aaaa'
writableStream.write(x)
writableStream.end()
writableStream.on('error', (err) => console.log(err))
writableStream.on('finish', () => console.log('Ghi dữ liệu thành công'))

server.listen(8000, '127.0.0.1', () => console.log('Listen port 8000'))

// ghi vào tệp hoặc là phản hồi về cho client
//1. ghi vào tệp : tạo createWriteStream('path', endingcode)
//2. trả về cho client thì đc bọc bởi. server.on('request', (req, res)=> { ... }) hoặc ...
//3. Sử dụng 3 sự kiện: data--> chunk, end() --> res.end()/ writeStream.end(), error--> res.err
//4. Để ghi từng phần dữ liệu ---> dùng res.write(chunk)
