/* eslint-disable */
const browseImageInput = document.getElementById('browse_image');
const displayImageDiv = document.getElementById('display_image_div');
const cropButton = document.getElementById('crop_button');
const croppedImageResult = document.getElementById('cropped_image_result');
const saveImg = document.getElementById('saveEdit_button');
const avatar = document.querySelector('.form__user-photo');

console.log(browseImageInput);
browseImageInput.addEventListener('change', async event => {
  const files = event.target.files;
  console.log(event.target);
  const [file] = files;

  const url = await getImageUrlFromFile(file);
  console.log('url-', url);
  displayImageDiv.innerHTML = `<img id="display_image_data" src="${url}" alt="Uploaded Picture">`;

  const image = document.getElementById('display_image_data');
  const cropper = new Cropper(image, {
    aspectRatio: 1,
    viewMode: 1
  });

  cropButton.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    const roundedCanvas = getRoundedCanvas(croppedCanvas);
    const roundedImage = document.createElement('img');

    roundedImage.src = roundedCanvas.toDataURL();
    croppedImageResult.innerHTML = '';
    croppedImageResult.appendChild(roundedImage);
  });

  // saveImg.addEventListener('click', () => {
  //   if (roundedImage) avatar.src = roundedImage.src;
  // });
});

async function getImageUrlFromFile(file) {
  //   if (URL.createObjectURL) {
  //     console.log(URL.createObjectURL(file));
  //     return URL.createObjectURL(file);
  //   }

  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

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

// Download image
function downloadImage(imageUrl, filename) {
  // Tạo element 'a' mới
  const anchorElement = document.createElement('a');

  // Set thuộc tính 'href' bằng URL ảnh
  anchorElement.href = imageUrl;

  // Set thuộc tính 'download' bằng tên file mong muốn
  anchorElement.download = filename;

  // Thêm element 'a' vào body
  document.body.appendChild(anchorElement);

  // Simulate click event để kích hoạt tải xuống
  anchorElement.click();

  // Xóa element 'a' sau khi tải xuống (tùy chọn)
  anchorElement.remove();
}
