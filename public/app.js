document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    const addFeatureBtn = document.getElementById('add-feature-btn');
    const featuresList = document.getElementById('features-list');
    const copyPayBtn = document.getElementById('copy-pay-btn');

    // 1. إضافة صف بنود خدمة جديد
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'feature-row';
            row.innerHTML = `
                <input type="text" class="feat-name" placeholder="اسم البند الخادمي">
                <input type="number" class="feat-hours" placeholder="الساعات" value="5">
                <input type="number" class="feat-rate" placeholder="السعر/ساعة" value="25">
            `;
            featuresList.appendChild(row);
        });
    }

    // 2. معالجة زر حساب التكلفة
    if (calcBtn) {
        calcBtn.addEventListener('click', async () => {
            calcBtn.innerText = "جاري الحساب بدقة... ⏳";
            calcBtn.disabled = true;

            const projName = document.getElementById('proj-name').value.trim();
            const clientName = document.getElementById('client-name').value.trim();
            const baseRate = parseFloat(document.getElementById('hourly-rate').value) || 25;
            const contingencyPercent = parseFloat(document.getElementById('contingency').value) || 10;

            // جمع بيانات الصفوف
            const featureRows = document.querySelectorAll('.feature-row');
            const features = [];
            featureRows.forEach(row => {
                const name = row.querySelector('.feat-name').value.trim() || "خدمة برمجة/تصميم";
                const hours = parseFloat(row.querySelector('.feat-hours').value) || 0;
                const rate = parseFloat(row.querySelector('.feat-rate').value) || baseRate;
                if (hours > 0) features.push({ name, hours, rate });
            });

            const payload = {
                project_name: projName,
                client_name: clientName,
                base_rate: baseRate,
                contingency_percent: contingencyPercent,
                features: features
            };

            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    updateUI(data.subtotal, data.contingency, data.total_price, data.recommended_deposit);
                } else {
                    throw new Error("استجابة غير صالحة من السيرفر");
                }
            } catch (err) {
                console.warn("استخدام المحرك المحلي الاحتياطي:", err);
                let subtotal = 0;
                if (features.length > 0) {
                    subtotal = features.reduce((sum, f) => sum + (f.hours * f.rate), 0);
                } else {
                    subtotal = baseRate * 10;
                }
                const contingency = subtotal * (contingencyPercent / 100);
                const total = subtotal + contingency;
                const deposit = total * 0.5;

                updateUI(subtotal, contingency, total, deposit);
            } finally {
                calcBtn.innerText = "حساب التكلفة التقديرية بدقة 🚀";
                calcBtn.disabled = false;
            }
        });
    }

    function updateUI(subtotal, contingency, total, deposit) {
        document.getElementById('total-display').innerText = `$${total.toFixed(2)}`;
        document.getElementById('subtotal-display').innerText = `المجموع الفرعي: $${subtotal.toFixed(2)}`;
        document.getElementById('contingency-display').innerText = `هامش الطوارئ: $${contingency.toFixed(2)}`;
        document.getElementById('deposit-display').innerText = `الدفعة المقدمة المطلوبة (50%): $${deposit.toFixed(2)}`;
    }

    // 3. نسخ بيانات إنستاباي وميزة في مصر
    if (copyPayBtn) {
        copyPayBtn.addEventListener('click', () => {
            const ipa = document.getElementById('instapay-ipa').innerText;
            const meeza = document.getElementById('meeza-num').innerText;
            const textToCopy = `بيانات تحويل InstaPay / ميزة:\nIPA: ${ipa}\nCard/Wallet: ${meeza}`;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyPayBtn.innerText = "✅ تم النسخ إلى الحافظة!";
                setTimeout(() => copyPayBtn.innerText = "📋 نسخ بيانات التحويل", 2500);
            });
        });
    }

    // 4. التحكم بالنوافذ المنبثقة (من نحن وسياسة الخصوصية)
    const aboutModal = document.getElementById('about-modal');
    const privacyModal = document.getElementById('privacy-modal');
    
    document.getElementById('open-about')?.addEventListener('click', (e) => { e.preventDefault(); aboutModal.showModal(); });
    document.getElementById('open-privacy')?.addEventListener('click', (e) => { e.preventDefault(); privacyModal.showModal(); });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            aboutModal.close();
            privacyModal.close();
        });
    });
});
