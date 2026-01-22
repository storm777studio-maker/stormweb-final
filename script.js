// --- متغيرات الحالة ---
const ADMIN_PASSWORD = "stu777dio"; 
let videos = []; 
let isAdminMode = false; 

// الرابط الخاص بك (Google Apps Script) الذي يربط الموقع بـ Google Drive
const scriptURL = "https://script.google.com/macros/s/AKfycbzFBe5JQnbBAKkYDQc1Gjt7Tiu1L755eacKBJUjV3mAfRDVOclGp2_f4MYOrlmtS66VlQ/exec";

// --- 1. وظائف التحكم بالأدمن ---
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
        alert("تم تسجيل الدخول بنجاح! يمكنك الآن الرفع إلى Google Drive.");
        updateVideoList();
    } else {
        alert("كود الأدمن خاطئ!");
    }
}

// --- 2. وظيفة الرفع باستخدام رابط الـ Web App الخاص بك ---
async function uploadVideo() {
    const title = document.getElementById("videoTitle").value;
    const fileInput = document.getElementById("videoUpload");
    const file = fileInput.files[0];

    if (!title || !file) {
        alert("يرجى إدخال عنوان الفيديو واختيار ملف!");
        return;
    }

    // تنبيه الأدمن ببدء العملية
    alert("بدأ الرفع إلى Google Drive... قد يستغرق الأمر دقيقة حسب حجم الفيديو.");

    const reader = new FileReader();
    reader.readAsDataURL(file); // تحويل الملف لصيغة قابلة للإرسال

    reader.onload = async function () {
        const base64 = reader.result.split(',')[1];
        
        const payload = {
            base64: base64,
            type: file.type,
            name: title
        };

        try {
            // إرسال البيانات إلى الرابط الخاص بك
            await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors', // لضمان العمل في عمان وتخطي حواجز الحماية
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // إشعار بالنجاح (بسبب no-cors لا يمكننا استلام رد ID الملف مباشرة)
            alert("تم إرسال الفيديو بنجاح! سيظهر في حساب الاستوديو storm.777.studio@gmail.com قريباً.");
            
            // إضافة مؤقتة للقائمة لعرضها أمام الأدمن
            videos.push({ title: title, url: "#", isDrive: true });
            updateVideoList();
            
        } catch (error) {
            console.error("خطأ في الرفع:", error);
            alert("حدث خطأ، تأكد من أن حجم الملف لا يتجاوز 50 ميجابايت.");
        }
    };
}

// --- 3. تحديث عرض الفيديوهات ---
function updateVideoList() {
    const videoList = document.getElementById("videoList");
    videoList.innerHTML = ""; 

    videos.forEach((video, index) => {
        const videoItem = document.createElement("div");
        videoItem.className = "video-item";
        if (isAdminMode) videoItem.classList.add("admin-mode"); 

        // عرض الفيديو: إذا كان الرابط متاحاً يستخدم iframe، وإلا يظهر رسالة معالجة
        let videoEmbed = "";
        if (video.isDrive) {
            if (video.url === "#") {
                videoEmbed = `<div style="padding:20px; background:#ddd; border-radius:8px; text-align:center;">جاري معالجة الفيديو في Google Drive...</div>`;
            } else {
                videoEmbed = `<iframe src="${video.url}" width="100%" height="200" allow="autoplay" frameborder="0"></iframe>`;
            }
        } else {
            videoEmbed = `<video controls><source src="${video.url}" type="video/mp4"></video>`;
        }

        videoItem.innerHTML = `
            <h4>${video.title}</h4>
            ${videoEmbed}
            ${isAdminMode ? `<button class="delete-button" onclick="deleteVideo(${index})">حذف</button>` : ''}
        `; 
        videoList.appendChild(videoItem);
    });
}

function deleteVideo(index) {
    if (confirm("هل أنت متأكد من حذف هذا الفيديو من القائمة؟")) {
        videos.splice(index, 1);
        updateVideoList();
    }
}