function encryptImage() {
    const fileInput = document.getElementById('uploadImage');
    const message = document.getElementById('secretMessage').value;
    const password = document.getElementById('encryptionPassword').value;

    if (!fileInput.files.length || !message || !password) {
        alert('Please select an image, enter a message, and set a password.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imgData.data;

            // Combine password and message, then encode
            const encodedMessage = btoa(encodeURIComponent(password + ':' + message));

            // Check if the message fits in the image
            if (encodedMessage.length * 4 > data.length) {
                alert('Message is too long for the selected image.');
                return;
            }

            // Embed the message in the image
            for (let i = 0; i < encodedMessage.length; i++) {
                const charCode = encodedMessage.charCodeAt(i);
                data[i * 4] = charCode; // Store in the red channel
            }

            ctx.putImageData(imgData, 0, 0);

            // Provide the encrypted image for download
            const encryptedData = canvas.toDataURL('image/png');
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = encryptedData;
            downloadLink.download = 'encrypted_image.png';
            downloadLink.style.display = 'block';
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function decryptImage() {
    const fileInput = document.getElementById('decryptImage');
    const password = document.getElementById('decryptionPassword').value;

    if (!fileInput.files.length || !password) {
        alert('Please select an image and enter a password.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imgData.data;

            let extractedMessage = '';
            for (let i = 0; i < data.length; i += 4) {
                const charCode = data[i];
                if (charCode === 0) break; 
                extractedMessage += String.fromCharCode(charCode);
            }

            try {
                const decodedMessage = decodeURIComponent(atob(extractedMessage));
                if (decodedMessage.startsWith(password + ':')) {
                    document.getElementById('outputMessage').innerText = 'Decrypted Message: ' + decodedMessage.split(':')[1];
                } else {
                    document.getElementById('outputMessage').innerText = 'Incorrect password';
                }
            } catch (error) {
                document.getElementById('outputMessage').innerText = 'Failed to decrypt message. The image may not contain a valid message.';
            }
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Show tickmark when a file is uploaded
document.getElementById('uploadImage').addEventListener('change', function () {
    const statusDiv = document.getElementById('encryptUploadStatus');
    statusDiv.innerHTML = '<div class="tick"></div>';
});

document.getElementById('decryptImage').addEventListener('change', function () {
    const statusDiv = document.getElementById('decryptUploadStatus');
    statusDiv.innerHTML = '<div class="tick"></div>';
});