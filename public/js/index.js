/* eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { handleLogin, handleLogout } from './login';
import { displayMap } from './map';
import { updateDataUserApi } from './updateSettings';
import { bookTour } from './stripe';

// Login and Logout
const loginForm = document.querySelector('.form__login');
const logoutBtn = document.querySelector('.nav__el--logout');
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// Map Box
const mapDiv = document.getElementById('map');
let locationsCurrent;
if (mapDiv) {
  locationsCurrent = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locationsCurrent);
}
// Update Data User - Call Api
const updateInforDataUser = document.querySelector('.form-user-data');
const updatePwdUser = document.querySelector('.form-user-settings');

// Update Imgage befor the Submiting
document.addEventListener('DOMContentLoaded', function() {
  const inputImg = document.getElementById('photo');
  const imgUpdate = document.querySelector('.form__user-photo');
  if (inputImg) {
    inputImg.addEventListener('change', function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      if (file) reader.readAsDataURL(file);
      reader.onload = e => (imgUpdate.src = reader.result);
    });
  }
});

if (updateInforDataUser) {
  updateInforDataUser.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateDataUserApi(form, 'data');
  });
}

if (updatePwdUser) {
  updatePwdUser.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const passwordNew = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    document.querySelector('.btn--savePwd').textContent = 'Updating ...';
    await updateDataUserApi(
      { passwordCurrent, passwordNew, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--savePwd').textContent = 'Save password';
  });
}

// Booking Tour
const btnBooking = document.getElementById('book-tour');
if (btnBooking) {
  btnBooking.addEventListener('click', async e => {
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}
