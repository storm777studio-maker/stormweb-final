// --- الإعدادات العامة ---
const ADMIN_PASSWORD = "stu777dio"; // كود الأدمن الخاص بك
let videos = []; 
let isAdminMode = false;

// رابط الـ Web App الجديد الخاص بك
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyPWW0pcY9rLCEov4fYZjQoKnf-0Pw2GTnLqvdiuDo6hKIf437HSKxpRFwlj-q8PzSutA/exec";

// --- 1. جلب البيانات عند تحميل الصفحة ---
// هذه الوظيفة تجعل الفيديوهات تظهر للجميع فور فتح الموقع
async function loadVideos() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        // تحويل البيانات القادمة من Google Sheets إلى تنسيق يفهمه الموقع
        videos = data.map(v => ({
            title: v.title,
            url: `https://drive.google.com/file/d/${v.id}/preview`,
            isDrive: true
        }));
        updateVideoList();
    } catch (e) {
        console.error("خطأ في جلب الفيديوهات:", e);
    }
}

// تشغيل جلب البيانات بمجرد تحميل الصفحة
window.onload = loadVideos;

// --- 2. وظائف التحكم بالأدمن ---
function scrollToAdminLogin() {
    const adminLoginForm = document.getElementById("adminLoginForm");
    adminLoginForm.style.display = "block";
    adminLoginForm.scrollIntoView({ behavior: 'smooth' });
}

function checkAdmin() {
    const password = document.getElementById("adminPassword").value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById("adminPanel").style.display = "block";
        isAdminMode = true;
        alert("تم تسجيل الدخول بنجاح! يمكنك الآن الرفع للسحابة.");
        updateVideoList();
    } else {
        alert("كود الأدمن خاطئ!");
    }
}

// --- 3. وظيفة الرفع إلى Google Drive و Sheets ---
async function uploadVideo() {
    const title = document.getElementById("videoTitle").value;
    const fileInput = document.getElementById("videoUpload");
    const file = fileInput.files[0];

    if (!title || !file) {
        alert("يرجى إدخال عنوان واختيار ملف فيديو!");
        return;
    }

    alert("بدأ الرفع إلى Storm Drive.. قد يستغرق الأمر لحظات، يرجى عدم إغلاق الصفحة.");

    const reader = new FileReader();
    reader.readAsDataURL(file); // تحويل الملف لصيغة Base64 لإرساله
    
    reader.onload = async function () {
        const base64Data = reader.result.split(',')[1];
        
        const payload = {
            base64: base64Data,
            type: file.type,
            name: title
        };

        try {
            // إرسال البيانات إلى Google Apps Script
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // لتجاوز قيود الحماية في المتصفح
                body: JSON.stringify(payload)
            });

            alert("تم إرسال الفيديو بنجاح! سيتم تحديث القائمة تلقائياً للجميع خلال دقيقة.");
            
            // إضافة فيديو مؤقت للقائمة الحالية
            videos.push({ title: title, url: "#", isDrive: true });
            updateVideoList();
            
            // تفريغ الحقول
            document.getElementById("videoTitle").value = "";
            document.getElementById("videoUpload").value = "";

        } catch (error) {
            console.error("خطأ:", error);
            alert("حدث خطأ في الرفع، تأكد من حجم الملف (يفضل أقل من 50 ميجابايت).");
        }
    };
}

// --- 4. تحديث عرض القائمة ---
function updateVideoList() {
    const videoList = document.getElementById("videoList");
    videoList.innerHTML = "";

    videos.forEach((video, index) => {
        const videoItem = document.createElement("div");
        videoItem.className = "video-item";
        if (isAdminMode) videoItem.classList.add("admin-mode");

        let videoContent = "";
        if (video.isDrive && video.url !== "#") {
            // عرض الفيديو باستخدام iframe من جوجل درايف
            videoContent = `<iframe src="${video.url}" width="100%" height="200" allow="autoplay" frameborder="0"></iframe>`;
        } else {
            // حالة المعالجة أو الرفع المحلي
            videoContent = `<div style="background:#000; color:#4CAF50; height:200px; display:flex; align-items:center; justify-content:center; border-radius:8px; text-align:center; padding:10px;">
                                جاري معالجة الفيديو في السحابة... سيظهر هنا قريباً
                            </div>`;
        }

        videoItem.innerHTML = `
            <h4>${video.title}</h4>
            ${videoContent}
            ${isAdminMode ? `<button class="delete-button" onclick="deleteVideo(${index})">حذف</button>` : ''}
        `;
        videoList.appendChild(videoItem);
    });
}

function deleteVideo(index) {
    if (confirm("هل تريد حذف هذا الفيديو من القائمة؟ (ملاحظة: سيحذف من العرض فقط)")) {
        videos.splice(index, 1);
        updateVideoList();
    }
}