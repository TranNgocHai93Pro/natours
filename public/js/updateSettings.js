/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
import axios from 'axios';
const { showAlert } = require('./alerts.js');

// type is either 'password' or 'data'

export const updateDataUserApi = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/users/updateMyPassword'
      : '/api/v1/users/updateMe';
  try {
    const result = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (result.data.status === 'success') {
      showAlert('success', `Update ${type.toUpperCase()} successful.`);
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';

      window.setTimeout(() => location.reload(), 2000);
    } else {
      showAlert('error', 'Update data User Fail.');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
