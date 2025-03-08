document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadButton = document.getElementById('uploadButton');
    const listingId = document.getElementById('listingId');
    const imageNumber = document.getElementById('imageNumber');
    const results = document.getElementById('results');
    const imageUrl = document.getElementById('imageUrl');
    const htmlTag = document.getElementById('htmlTag');
    const resultPreview = document.getElementById('resultPreview');
    const imageGrid = document.getElementById('imageGrid');

    // Obsługa przeciągania plików
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    });

    // Obsługa kliknięcia w strefę upuszczania
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Obsługa wyboru pliku
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Obsługa zmiany ID aukcji
    listingId.addEventListener('input', () => {
        validateForm();
        if (listingId.value) {
            loadImages(listingId.value);
        } else {
            imageGrid.innerHTML = '';
        }
    });

    // Obsługa zmiany numeru zdjęcia
    imageNumber.addEventListener('input', validateForm);

    // Funkcja walidacji formularza
    function validateForm() {
        const isValid = listingId.value && 
                       imageNumber.value && 
                       parseInt(imageNumber.value) >= 1 && 
                       parseInt(imageNumber.value) <= 12 &&
                       imagePreview.src;
        uploadButton.disabled = !isValid;
    }

    // Funkcja obsługi wybranego pliku
    function handleFileSelect(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            validateForm();
        };
        reader.readAsDataURL(file);
    }

    // Funkcja przesyłania pliku
    uploadButton.addEventListener('click', async () => {
        const file = fileInput.files[0] || dataURLtoFile(imagePreview.src, 'image.jpg');
        const formData = new FormData();
        formData.append('image', file);
        formData.append('listingId', listingId.value);
        formData.append('imageNumber', imageNumber.value);

        try {
            uploadButton.disabled = true;
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                showResults(data);
                loadImages(listingId.value);
            } else {
                alert('Błąd podczas przesyłania: ' + data.error);
            }
        } catch (error) {
            console.error('Błąd:', error);
            alert('Wystąpił błąd podczas przesyłania');
        } finally {
            uploadButton.disabled = false;
        }
    });

    // Funkcja pokazująca wyniki
    function showResults(data) {
        imageUrl.value = data.imageUrl;
        htmlTag.value = data.htmlTag;
        resultPreview.src = data.imageUrl;
        results.classList.remove('hidden');
    }

    // Funkcja ładująca listę zdjęć
    async function loadImages(listingId) {
        try {
            const response = await fetch(`/images/${listingId}`);
            const data = await response.json();
            
            imageGrid.innerHTML = data.images
                .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                .map(image => `
                    <div class="p-4 bg-gray-800 rounded">
                        <img src="${image.url}" alt="Zdjęcie ${image.number}" class="w-full h-48 object-contain mb-2">
                        <div class="flex items-center space-x-2">
                            <input type="text" value="${image.url}" class="flex-1 p-2 rounded dark-input text-sm" readonly>
                            <button onclick="copyToClipboard(this.previousElementSibling)" class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                                Kopiuj
                            </button>
                        </div>
                    </div>
                `).join('');
        } catch (error) {
            console.error('Błąd podczas ładowania zdjęć:', error);
        }
    }
});

// Funkcja kopiowania do schowka
function copyToClipboard(element) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    element.select();
    document.execCommand('copy');
    
    const button = element.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Skopiowano!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 1000);
}

// Funkcja konwertująca Data URL do File
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}