/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';

// export const login = async (email, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: '/api/v1/users/login',
//       data: {
//         email,
//         password
//       }
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'Logged in successfully!');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: '/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };

// Định nghĩa hàm xử lý sự kiện khi form đăng nhập được gửi

// Đăng ký sự kiện khi form đăng nhập được gửi

import axios from 'axios';
import { showAlert } from './alerts';

export async function handleLogin(e) {
  e.preventDefault(); // Ngăn chặn việc gửi form mặc định

  // Lấy giá trị từ các trường nhập liệu
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  //Gửi yêu cầu đăng nhập đến máy chủ
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    console.log('result', result);
    if (result.status === 200) {
      // Đăng nhập thành công, chuyển hướng đến trang chính
      showAlert('success', 'Login successful! Come to Home page.');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    } else {
      // Đăng nhập thất bại, hiển thị thông báo lỗi
      showAlert('error', result.message);
    }
  } catch (error) {
    console.error(
      'Lỗi khi gửi yêu cầu đăng nhập:',
      error.response.data.message
    );
    showAlert('error', error.response.data.message);
  }
}

export async function handleLogout() {
  const result = await axios({
    method: 'GET',
    url: '/api/v1/users/logout'
  });

  if (result.status === 200) {
    showAlert('success', 'You logouted!');
    window.setTimeout(() => location.assign('/'), 1000);
  } else {
    showAlert(
      'error',
      'You propraly get a error when logging out. Please try again!'
    );
  }
}
