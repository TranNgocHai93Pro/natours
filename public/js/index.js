/* eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import axios from 'axios';

import { handleLogin, handleLogout } from './login.js';
import { handleSignUp } from './signUp.js';
import { displayMap } from './map';
import { updateDataUserApi } from './updateSettings';
import { bookTour } from './stripe';

// Login and Logout
const loginForm = document.querySelector('.form__login');
const logoutBtn = document.querySelector('.nav__el--logout');
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// SignUp
const signUpForm = document.querySelector('.signUp__form');
if (signUpForm) signUpForm.addEventListener('submit', handleSignUp);

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
const inputImg = document.getElementById('photo');
const imgUpdate = document.querySelector('.form__user-photo');
const btnSave = document.querySelector('.save-button');
const btnCrop = document.querySelector('.crop-button');
const image = document.getElementById('image');
const croppedImageResult = document.getElementById('cropped_image_result');
let checkChangeImage = false;
document.addEventListener('DOMContentLoaded', function() {
  if (inputImg) {
    inputImg.addEventListener('change', async function(e) {
      const modal = document.getElementById('modal');
      if (modal) modal.classList.remove('hidden');
      const file = e.target.files[0];
      console.log('file', file);
      const reader = new FileReader();
      if (file) await reader.readAsDataURL(file);
      reader.onload = async () => {
        imgUpdate.src = reader.result;

        const roundedImage = document.createElement('img');
        roundedImage.src = '/img/users/default.jpg';
        roundedImage.setAttribute('id', 'img-preview');
        croppedImageResult.innerHTML = '';
        croppedImageResult.appendChild(roundedImage);

        if (cropper) cropper.replace(reader.result);
      };
    });
  }
});

// Create Cropper instance
let cropper;
if (image) {
  cropper = new Cropper(image, {
    aspectRatio: 1 / 1, // Square aspect ratio for a circle
    viewMode: 1, // 1:1 ratio
    autoCropArea: 1, // Crop the entire image
    dragMode: 'move', // Disable dragging
    cropBoxMovable: false, // Disable crop box movement
    cropBoxResizable: true // Disable crop box resizing
  });
}
if (btnCrop) {
  btnCrop.addEventListener('click', e => {
    e.preventDefault();
    const croppedCanvas = cropper.getCroppedCanvas();
    const roundedCanvas = getRoundedCanvas(croppedCanvas);
    const roundedImage = document.createElement('img');

    roundedImage.src = roundedCanvas.toDataURL();

    roundedImage.setAttribute('id', 'img-preview');

    croppedImageResult.innerHTML = '';
    croppedImageResult.appendChild(roundedImage);
  });
}

if (btnSave) {
  btnSave.addEventListener('click', e => {
    e.preventDefault();
    const roundedImage = document.getElementById('img-preview');
    if (roundedImage) imgUpdate.src = roundedImage.src;
    const modal = document.getElementById('modal');
    checkChangeImage = true;
    if (modal) modal.classList.add('hidden');
  });
}

// Get data Canvas
function getRoundedCanvas(sourceCanvas) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const width = sourceCanvas.width * 2;
  const height = sourceCanvas.height * 2;

  canvas.width = width;
  canvas.height = height;

  context.imageSmoothingEnabled = true;
  context.drawImage(sourceCanvas, 0, 0, width, height);

  context.globalCompositeOperation = 'destination-in';
  context.beginPath();
  context.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    2 * Math.PI,
    true
  );
  context.fill();

  return canvas;
}
// Send data to Cloudinary, get URL's image and save to DB
if (updateInforDataUser) {
  updateInforDataUser.addEventListener('submit', async e => {
    e.preventDefault();

    const url = 'https://api.cloudinary.com/v1_1/dh6f8ub3q/image/upload';
    const formData = new FormData();
    console.log(checkChangeImage);
    if (checkChangeImage) {
      document.querySelector('.btn--saveSet').textContent = 'Updating ...';
      async function uploadFiles() {
        const roundedImage = document.getElementById('img-preview');

        formData.append('file', roundedImage.src);
        formData.append('upload_preset', 'user-photo');

        try {
          const res = await axios({
            url,
            method: 'POST',
            data: formData
          });
          return res;
        } catch (error) {
          console.error(`Error uploading file :`, error);
        }
      }
      uploadFiles().then(async result => {
        console.log('result--', result);
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const photo = result.data.secure_url;
        const dataForm = {
          name,
          email,
          photo
        };

        await updateDataUserApi(dataForm, 'data');
        document.querySelector('.btn--saveSet').textContent = 'Save settings';
        checkChangeImage = fasle;
      });
    } else {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const dataForm = {
        name,
        email
      };
      document.querySelector('.btn--saveSet').textContent = 'Updating ...';
      await updateDataUserApi(dataForm, 'data');
      document.querySelector('.btn--saveSet').textContent = 'Save settings';
    }
  });
}
// Open Modal
const openModalButton = document.querySelector('.open-modal');
const modal = document.querySelector('.container');

if (openModalButton) {
  openModalButton.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  });
}

if (modal) {
  modal.addEventListener('click', e => {
    e.preventDefault();
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

// Update Password
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
