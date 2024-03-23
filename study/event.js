const EventEmitter = require('events');

console.log(EventEmitter);
class Person extends EventEmitter {
  constructor() {
    super();
  }
}
const myEmitter = new Person();

// B3: đăng ký sự kiện
myEmitter.on('firstEvent', (x) => {
  console.log('first Event', x);
});

myEmitter.on('firstEvent', () => {
  console.log('task 1 complete');
});

myEmitter.on('firstEvent', (data) => {
  console.log(`data is ${data}`);
});
// B4: Lăng nghe sự kiện và thực thi hàm callback

myEmitter.emit('firstEvent', 9);

//Streams              Describe            Example                Event           function
//1. ReadStrems:Luồng đọc dữ liệu ---> Http request, fs file ---> data, end ---> pipe(), read()
