/**
 * ניהול תמונות הגלריה בפאנל הניהול
 */
(function () {
    window.GalleryAdmin = window.GalleryAdmin || {};

    var uploadedFile = null;
    var editingImage = null;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * רנדור ממשק ניהול התמונות
     */
    function renderImageManager(pin) {
        if (!window.AI_GALLERY || !Array.isArray(window.AI_GALLERY.images)) {
            return '<div class="ap-loading">טוען תמונות...</div>';
        }

        var images = window.AI_GALLERY.images;
        var html = '';

        // טופס הוספת תמונה חדשה
        html += '<div class="ap-card" id="ap-image-upload-form">';
        html += '<h3>הוספת תמונה חדשה</h3>';
        html += '<form id="ap-upload-form" class="ap-fields">';
        
        html += '<label class="ap-field ap-span">';
        html += '<span>קובץ תמונה</span>';
        html += '<input type="file" id="ap-image-file" accept="image/*" required>';
        html += '<p class="ap-help">JPG, PNG או WEBP. מומלץ תמונה לרוחב.</p>';
        html += '</label>';

        html += '<label class="ap-field">';
        html += '<span>שבוע</span>';
        html += '<input type="number" id="ap-image-week" min="1" max="20" value="1" required>';
        html += '</label>';

        html += '<label class="ap-field">';
        html += '<span>קרדיט (אופציונלי)</span>';
        html += '<input type="text" id="ap-image-credit" placeholder="שם | סניף">';
        html += '</label>';

        html += '<label class="ap-field ap-check">';
        html += '<input type="checkbox" id="ap-image-open" checked>';
        html += '<span>פתוח לניחושים</span>';
        html += '</label>';

        html += '<div class="ap-field ap-span">';
        html += '<button type="submit" class="ap-primary">העלאה והוספה לגלריה</button>';
        html += '</div>';

        html += '<p id="ap-upload-status" class="ap-help" style="display:none;"></p>';
        html += '<p id="ap-upload-error" class="ap-error" style="display:none;"></p>';
        
        html += '</form>';
        html += '</div>';

        // רשימת תמונות קיימות
        html += '<div class="ap-card">';
        html += '<h3>תמונות קיימות (' + images.length + ')</h3>';
        
        if (images.length === 0) {
            html += '<p class="ap-empty">עדיין אין תמונות</p>';
        } else {
            html += '<div class="ap-gallery-grid">';
            
            images.forEach(function (image) {
                html += '<div class="ap-gallery-card" data-id="' + escapeHtml(image.id) + '">';
                html += '<div class="ap-gallery-card__image">';
                html += '<img src="' + escapeHtml(image.src) + '" alt="' + escapeHtml(image.id) + '" loading="lazy">';
                html += '</div>';
                html += '<div class="ap-gallery-card__body">';
                html += '<p class="ap-gallery-card__id">' + escapeHtml(image.id) + '</p>';
                html += '<p class="ap-gallery-card__meta">';
                html += 'שבוע ' + image.week;
                if (image.credit) html += ' · ' + escapeHtml(image.credit);
                html += '</p>';
                html += '<p class="ap-gallery-card__status">';
                html += image.open ? '✅ פתוח לניחושים' : '🔒 סגור';
                html += '</p>';
                html += '<div class="ap-gallery-card__actions">';
                html += '<button type="button" class="ap-ghost" data-edit="' + escapeHtml(image.id) + '">עריכה</button>';
                html += '<button type="button" class="ap-danger" data-delete="' + escapeHtml(image.id) + '">מחיקה</button>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            });
            
            html += '</div>';
        }
        
        html += '</div>';

        return html;
    }

    /**
     * טיפול בהעלאת קובץ
     */
    function handleFileSelect(event) {
        var file = event.target.files[0];
        if (!file) {
            uploadedFile = null;
            return;
        }

        // בדיקה שזו תמונה
        if (!file.type.startsWith('image/')) {
            showUploadError('נא לבחור קובץ תמונה');
            event.target.value = '';
            return;
        }

        // בדיקת גודל (מקסימום 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showUploadError('גודל התמונה מוגבל ל-5MB');
            event.target.value = '';
            return;
        }

        uploadedFile = file;
        showUploadStatus('תמונה נבחרה: ' + file.name);
    }

    /**
     * העלאת תמונה ל-Drive והוספה לגלריה
     */
    function submitUploadForm(event, pin) {
        event.preventDefault();

        if (!uploadedFile) {
            showUploadError('נא לבחור קובץ תמונה');
            return;
        }

        var week = parseInt(document.getElementById('ap-image-week').value, 10);
        var credit = document.getElementById('ap-image-credit').value.trim();
        var open = document.getElementById('ap-image-open').checked;

        showUploadStatus('מעלה תמונה ל-Google Drive...');
        
        var button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;

        // קריאת הקובץ כ-base64
        var reader = new FileReader();
        reader.onload = function (e) {
            var base64Data = e.target.result.split(',')[1];
            
            // העלאה ל-Drive דרך Apps Script
            uploadToDrive(base64Data, uploadedFile.name, uploadedFile.type)
                .then(function (driveId) {
                    showUploadStatus('מוסיף לגלריה...');
                    
                    return fetchFromAPI('addAiImage', 'GET', {
                        pin: pin,
                        image: JSON.stringify({
                            driveId: driveId,
                            week: week,
                            credit: credit,
                            open: open
                        })
                    });
                })
                .then(function (result) {
                    if (!result || result.error) {
                        throw new Error(result.error || 'שגיאה בהוספת התמונה');
                    }
                    
                    showUploadStatus('התמונה נוספה בהצלחה!');
                    
                    // איפוס הטופס
                    document.getElementById('ap-upload-form').reset();
                    uploadedFile = null;
                    
                    // רענון הגלריה
                    setTimeout(function () {
                        if (typeof window.reloadGalleryAdmin === 'function') {
                            window.reloadGalleryAdmin(pin);
                        }
                    }, 1000);
                })
                .catch(function (err) {
                    showUploadError(err.message || 'שגיאה בהעלאת התמונה');
                })
                .finally(function () {
                    button.disabled = false;
                });
        };
        
        reader.onerror = function () {
            showUploadError('שגיאה בקריאת הקובץ');
            button.disabled = false;
        };
        
        reader.readAsDataURL(uploadedFile);
    }

    /**
     * העלאה ל-Drive (בגרסה זו: העלאה ידנית + הדבקת ID)
     */
    function uploadToDrive(base64Data, fileName, mimeType) {
        return new Promise(function (resolve, reject) {
            // הצגת הודעה ידידותית למשתמש
            var instructions = 
                '📷 העלאת תמונה:\n\n' +
                '1. פתח את Google Drive שלך בטאב חדש\n' +
                '2. עבור לתיקייה "AI Gallery Images"\n' +
                '3. העלה את התמונה (גרור או לחץ "New" → File upload)\n' +
                '4. לחץ ימין על הקובץ → "Get link"\n' +
                '5. העתק את מזהה הקובץ מה-URL\n' +
                '   (החלק שאחרי /d/ או /file/d/)\n' +
                '   לדוגמה: 1Abc123XyZ...\n\n' +
                'הדבק כאן את המזהה:';
            
            var driveId = prompt(instructions);
            
            if (!driveId) {
                reject(new Error('לא הוזן מזהה קובץ'));
                return;
            }
            
            // ניקוי המזהה אם המשתמש הדביק URL שלם
            driveId = driveId.trim();
            
            // אם זה URL מלא, חלץ את ה-ID
            var idMatch = driveId.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (idMatch) {
                driveId = idMatch[1];
            }
            
            // הסרת תווים מיותרים
            driveId = driveId.replace(/[^a-zA-Z0-9_-]/g, '');
            
            if (driveId.length < 10) {
                reject(new Error('המזהה נראה לא תקין. הוא צריך להיות ארוך יותר.'));
                return;
            }
            
            resolve(driveId);
        });
    }

    /**
     * עריכת תמונה
     */
    function editImage(imageId, pin) {
        var image = window.AI_GALLERY.images.find(function (img) {
            return img.id === imageId;
        });

        if (!image) return;

        editingImage = image;

        var newWeek = prompt('שבוע חדש:', image.week);
        if (newWeek === null) return;

        var newCredit = prompt('קרדיט חדש:', image.credit);
        if (newCredit === null) return;

        var newOpen = confirm('האם התמונה פתוחה לניחושים?');

        var button = document.querySelector('[data-edit="' + imageId + '"]');
        if (button) button.disabled = true;

        fetchFromAPI('updateAiImage', 'GET', {
            pin: pin,
            image: JSON.stringify({
                id: imageId,
                week: parseInt(newWeek, 10) || image.week,
                credit: newCredit,
                open: newOpen
            })
        })
            .then(function (result) {
                if (!result || result.error) {
                    throw new Error(result.error || 'שגיאה בעדכון התמונה');
                }

                alert('התמונה עודכנה בהצלחה');
                
                if (typeof window.reloadGalleryAdmin === 'function') {
                    window.reloadGalleryAdmin(pin);
                }
            })
            .catch(function (err) {
                alert(err.message || 'שגיאה בעדכון התמונה');
            })
            .finally(function () {
                if (button) button.disabled = false;
            });
    }

    /**
     * מחיקת תמונה
     */
    function deleteImage(imageId, pin) {
        if (!confirm('האם אתה בטוח שברצונך למחוק את התמונה? פעולה זו היא בלתי הפיכה.')) {
            return;
        }

        var button = document.querySelector('[data-delete="' + imageId + '"]');
        if (button) button.disabled = true;

        fetchFromAPI('deleteAiImage', 'GET', {
            pin: pin,
            imageId: imageId
        })
            .then(function (result) {
                if (!result || result.error) {
                    throw new Error(result.error || 'שגיאה במחיקת התמונה');
                }

                alert('התמונה נמחקה בהצלחה');
                
                if (typeof window.reloadGalleryAdmin === 'function') {
                    window.reloadGalleryAdmin(pin);
                }
            })
            .catch(function (err) {
                alert(err.message || 'שגיאה במחיקת התמונה');
            })
            .finally(function () {
                if (button) button.disabled = false;
            });
    }

    function showUploadStatus(message) {
        var status = document.getElementById('ap-upload-status');
        var error = document.getElementById('ap-upload-error');
        if (status) {
            status.textContent = message;
            status.style.display = 'block';
        }
        if (error) {
            error.style.display = 'none';
        }
    }

    function showUploadError(message) {
        var status = document.getElementById('ap-upload-status');
        var error = document.getElementById('ap-upload-error');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
        if (status) {
            status.style.display = 'none';
        }
    }

    // Export functions
    window.GalleryAdmin.render = renderImageManager;
    window.GalleryAdmin.handleFileSelect = handleFileSelect;
    window.GalleryAdmin.submitUploadForm = submitUploadForm;
    window.GalleryAdmin.editImage = editImage;
    window.GalleryAdmin.deleteImage = deleteImage;
})();
