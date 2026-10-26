document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calc-btn');
    const totalDisplay = document.getElementById('total-display');
    const depositDisplay = document.getElementById('deposit-display');

    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', async () => {
        // قراءة المدخلات من الشاشة
        const projName = document.getElementById('proj-name').value.trim() || "مشروع جديد";
        const clientName = document.getElementById('client-name').value.trim() || "عميل مميز";
        const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 25;

        // تغيير حالة الزر أثناء المعالجة
        calculateBtn.innerText = "جاري الحساب... ⏳";
        calculateBtn.disabled = true;

        const payload = {
            project_name: projName,
            client_name: clientName,
            base_rate: hourlyRate,
            contingency_percent: 15.0,
            features: [
                { name: "تصميم الواجهة", hours: 10, rate: hourlyRate },
                { name: "تطوير الباك إند", hours: 15, rate: hourlyRate }
            ]
        };

        try {
            // الاتصال بخادم البايثون على Vercel
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                totalDisplay.innerText = `$${data.total_price}`;
                depositDisplay.innerText = `الدفعة المقدمة المطلوبة (50%): $${data.recommended_deposit}`;
            } else {
                throw new Error("السيرفر لم يستجب، سيتم الحساب محلياً");
            }
        } catch (error) {
            console.warn("تم التحويل للحساب المحلي:", error);
            // حساب احتياطي فوري لضمان عدم توقف الزر مطلقاً
            const subtotal = (10 * hourlyRate) + (15 * hourlyRate);
            const contingency = subtotal * 0.15;
            const total = subtotal + contingency;
            const deposit = total * 0.5;

            totalDisplay.innerText = `$${total.toFixed(2)}`;
            depositDisplay.innerText = `الدفعة المقدمة المطلوبة (50%): $${deposit.toFixed(2)}`;
        } finally {
            calculateBtn.innerText = "حساب التكلفة التقديرية 🚀";
            calculateBtn.disabled = false;
        }
    });
});
