/* eslint-disable */

//1. GET DATA FROM ELEMENT

export function displayMap(locationsCurrent) {
  //2. Convert from [lat, lng] to [lng, lat]
  let markers = [];
  locationsCurrent.forEach(el => {
    const [lat, lng] = el.coordinates;
    markers.push({
      coordinates: [lng, lat],
      description: el.description,
      day: el.day
    });
  });

  //3. Initial locations map
  let map = L.map('map').setView(markers[0].coordinates, 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markers.forEach(marker => {
    const tooltip = L.tooltip({
      direction: 'top', // Hướng hiển thị của tooltip
      permanent: true, // Hiển thị tooltip luôn, không biến mất sau khi di chuột ra khỏi marker
      className: 'custom-tooltip', // Class CSS tùy chỉnh cho tooltip
      offset: [0, -20] // Dịch chuyển vị trí của tooltip so với marker
    }).setContent(`${marker.description}- ${marker.day} day`);

    L.marker(marker.coordinates)
      .addTo(map)
      .bindTooltip(tooltip)
      .openTooltip();
  });

  function handleLogin(e) {
    console.log('hi');
    e.preventDefault(); // Ngăn chặn việc gửi form mặc định

    // Lấy giá trị từ các trường nhập liệu
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('data', { email, password });
    //Gửi yêu cầu đăng nhập đến máy chủ
    fetch('/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(response => {
        if (response.status === 'success') {
          // Đăng nhập thành công, chuyển hướng đến trang chính
          console.log(response);
          window.location.href = '/';
        } else {
          // Đăng nhập thất bại, hiển thị thông báo lỗi
          alert(
            'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.'
          );
        }
      })
      .catch(error => {
        console.error('Lỗi khi gửi yêu cầu đăng nhập:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      });
  }
}
