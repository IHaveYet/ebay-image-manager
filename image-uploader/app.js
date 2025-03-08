document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const listingId = document.getElementById('listingId');
    const results = document.getElementById('results');
    const resultsContainer = document.getElementById('resultsContainer');
    const imageGrid = document.getElementById('imageGrid');
    const previewContainer = document.getElementById('previewContainer');

    let selectedFiles = [];

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
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            handleFilesSelect(files);
        }
    });

    // Obsługa kliknięcia w strefę upuszczania
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Obsługa wyboru plików
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFilesSelect(files);
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

    // Funkcja walidacji formularza
    function validateForm() {
        const isValid = listingId.value && selectedFiles.length > 0;
        uploadButton.disabled = !isValid;
    }

    // Funkcja obsługi wybranych plików
    function handleFilesSelect(files) {
        const remainingSlots = 12 - selectedFiles.length;
        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageNumber = selectedFiles.length + 1;
                selectedFiles.push({
                    file: file,
                    dataUrl: e.target.result,
                    number: imageNumber
                });
                updatePreview();
                validateForm();
            };
            reader.readAsDataURL(file);
        });
    }

    // Funkcja aktualizacji podglądu
    function updatePreview() {
        previewContainer.innerHTML = selectedFiles
            .map((file, index) => `
                <div class="preview-item" data-index="${index}">
                    <img src="${file.dataUrl}" alt="Podgląd ${file.number}">
                    <span class="image-number">${file.number}</span>
                    <button class="remove-button" onclick="removeImage(${index})">×</button>
                </div>
            `).join('');
    }

    // Funkcja usuwania zdjęcia
    window.removeImage = (index) => {
        selectedFiles.splice(index, 1);
        // Aktualizacja numerów pozostałych zdjęć
        selectedFiles.forEach((file, i) => {
            file.number = i + 1;
        });
        updatePreview();
        validateForm();
    };

    // Funkcja przesyłania plików
    uploadButton.addEventListener('click', async () => {
        try {
            uploadButton.disabled = true;
            const results = await Promise.all(selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file.file);
                formData.append('listingId', listingId.value);
                formData.append('imageNumber', file.number);

                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                return await response.json();
            }));

            showResults(results);
            loadImages(listingId.value);
            
            // Czyszczenie formularza
            selectedFiles = [];
            updatePreview();
            validateForm();
        } catch (error) {
            console.error('Błąd:', error);
            alert('Wystąpił błąd podczas przesyłania');
        } finally {
            uploadButton.disabled = false;
        }
    });

    // Funkcja pokazująca wyniki
    function showResults(results) {
        resultsContainer.innerHTML = results.map(result => `
            <div class="p-4 bg-gray-800 rounded">
                <h3 class="font-medium mb-2">Zdjęcie ${result.imageNumber}:</h3>
                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm mb-1">Link do zdjęcia:</h4>
                        <div class="flex items-center space-x-2">
                            <input type="text" value="${result.imageUrl}" class="flex-1 p-2 rounded dark-input" readonly>
                            <button onclick="copyToClipboard(this.previousElementSibling)" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                Kopiuj
                            </button>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm mb-1">Tag HTML:</h4>
                        <div class="flex items-center space-x-2">
                            <input type="text" value="${result.htmlTag}" class="flex-1 p-2 rounded dark-input" readonly>
                            <button onclick="copyToClipboard(this.previousElementSibling)" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                Kopiuj
                            </button>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm mb-1">Podgląd:</h4>
                        <img src="${result.imageUrl}" alt="Podgląd" class="max-w-full h-48 object-contain rounded border border-gray-600">
                    </div>
                </div>
            </div>
        `).join('');
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