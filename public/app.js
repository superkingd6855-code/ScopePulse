document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calc-btn');
    const resultBox = document.getElementById('total-display');

    calculateBtn.addEventListener('click', async () => {
        calculateBtn.classList.add('loading');
        
        const payload = {
            project_name: document.getElementById('proj-name').value || "مشروع جديد",
            client_name: document.getElementById('client-name').value || "عميل مميز",
            base_rate: parseFloat(document.getElementById('hourly-rate').value) || 25.0,
            contingency_percent: 15.0,
            features: [
                { name: "تصميم الواجهة", hours: 10, rate: 25.0 },
                { name: "تطوير الباك إند بلغة بايثون", hours: 15, rate: 30.0 }
            ]
        };

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if(data.status === 'success') {
                resultBox.innerText = `$${data.total_price}`;
                document.getElementById('deposit-display').innerText = `الدفعة المقدمة المطلوبة: $${data.recommended_deposit}`;
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالخادم:", error);
        } finally {
            calculateBtn.classList.remove('loading');
        }
    });
});
