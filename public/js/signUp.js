/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts.js';

export async function handleSignUp(e) {
  e.preventDefault(); // Ngăn chặn việc gửi form mặc định

  // Lấy giá trị từ các trường nhập liệu
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  //Gửi yêu cầu đăng nhập đến máy chủ
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signUp',
      data: {
        name,
        email,
        password,
        confirmPassword
      }
    });
    console.log('result', result);
    if (result.status === 201) {
      // Đăng nhập thành công, chuyển hướng đến trang chính
      showAlert('success', 'SignUp successful! Come to Home page.');
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
