export function initUploadMechanism() {
    const btn = document.getElementById('btnCreateFlashcard');
    const input = document.getElementById('fileUpload');
    
    btn.addEventListener('click', () => input.click());
    
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log("Đang gửi file cho AI:", file.name);
        // Sau này thay thế bằng fetch('/api/ai/generate')
        alert("Đang phân tích tài liệu, vui lòng đợi...");
    });
}