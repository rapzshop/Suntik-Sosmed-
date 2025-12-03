// ==================== PAYMENT MANAGEMENT ====================
const Payment = {
    // Create Midtrans payment
    createMidtransPayment: async function(orderId, amount, serviceName) {
        // Simulasi pembayaran Midtrans
        const paymentData = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: Config.currentUser.displayName,
                email: Config.currentUser.email,
                phone: Config.currentUser.phone || ''
            },
            item_details: [
                {
                    id: Config.selectedService.id,
                    price: Config.selectedService.price,
                    quantity: Math.ceil(
                        parseInt(document.getElementById('orderQuantity').value) / 
                        parseInt(Config.selectedService.per.split(' ')[0])
                    ),
                    name: serviceName
                }
            ]
        };

        // Generate QR data
        const qrData = `midtrans:${orderId}:${amount}:${Date.now()}:${Config.selectedService.provider}`;
        return qrData;
    },
    
    // Generate QR Code
    generateQRCode: async function() {
        const container = document.getElementById('qrCode');
        container.innerHTML = '';
        
        if (!Config.selectedService || !Config.currentUser) return;
        
        // Generate unique order ID
        const orderId = Utils.generateOrderId();
        const quantity = parseInt(document.getElementById('orderQuantity').value) || Config.selectedService.min;
        const total = Utils.calculateTotal(Config.selectedService, quantity);
        
        // Create Midtrans payment QR data
        const qrData = await this.createMidtransPayment(orderId, total, Config.selectedService.name);
        
        QRCode.toCanvas(container, qrData, {
            width: 200,
            height: 200,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    },
    
    // Process payment
    processPayment: async function() {
        const target = document.getElementById('orderTarget').value.trim();
        const quantity = parseInt(document.getElementById('orderQuantity').value);
        
        if (!target) {
            UI.showAlert('Harap masukkan target/username!', 'warning');
            return;
        }
        
        if (!Config.selectedService || !Config.currentUser) return;
        
        const total = Utils.calculateTotal(Config.selectedService, quantity);
        
        // Check balance
        if (Config.currentBalance < total) {
            UI.showAlert('Saldo tidak cukup! Silakan hubungi admin untuk top up.', 'danger');
            UI.closeOrderModal();
            return;
        }
        
        UI.showLoading();
        
        try {
            const newBalance = Config.currentBalance - total;
            const balanceUpdated = await Auth.updateUserBalance(Config.currentUser.id, newBalance);
            
            if (!balanceUpdated) {
                throw new Error('Gagal memperbarui saldo');
            }
            
            const orderData = {
                service: Config.selectedService.name,
                serviceId: Config.selectedService.id,
                target: target,
                quantity: quantity,
                price: total,
                unitPrice: Config.selectedService.price,
                profit: Config.selectedService.profit,
                category: Config.selectedCategory,
                subcategory: Config.selectedSubcategory,
                provider: Config.selectedService.provider,
                status: 'processing'
            };
            
            const orderId = await Auth.saveOrder(orderData);
            
            if (!orderId) {
                throw new Error('Gagal menyimpan pesanan');
            }
            
            // Send to Undctrl API
            await this.sendToUndctrlAPI(orderData);
            
            // Update local state
            Config.currentBalance = newBalance;
            
            // Update UI
            document.getElementById('userBalance').textContent = Utils.formatRupiah(Config.currentBalance);
            document.getElementById('currentBalance').textContent = Utils.formatRupiah(Config.currentBalance);
            
            UI.showAlert(`Pesanan berhasil! ID: ${orderId}\nStatus: Sedang diproses`, 'success');
            
            UI.closeOrderModal();
            UI.loadRecentOrders();
            
        } catch (error) {
            console.error('Payment error:', error);
            UI.showAlert(`Error: ${error.message}`, 'danger');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Send order to Undctrl API
    sendToUndctrlAPI: async function(orderData) {
        // Simulasi pengiriman ke API Undctrl
        const apiData = {
            api_key: Config.UNDCTRL_API_KEY,
            service: orderData.serviceId,
            target: orderData.target,
            quantity: orderData.quantity,
            action: "add"
        };
        
        // Log untuk debugging
        console.log('Mengirim ke Undctrl API:', apiData);
        
        // Dalam implementasi nyata, gunakan fetch untuk mengirim ke API
        // try {
        //     const response = await fetch(Config.UNDCTRL_API_URL, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(apiData)
        //     });
        //     
        //     const result = await response.json();
        //     return result;
        // } catch (error) {
        //     console.error('Error sending to Undctrl:', error);
        //     throw error;
        // }
        
        // Simulasi delay
        return new Promise(resolve => setTimeout(resolve, 1500));
    },
    
    // Check payment status (untuk real-time monitoring)
    checkPaymentStatus: async function(orderId) {
        // Simulasi pengecekan status pembayaran
        try {
            // Dalam implementasi nyata, ini akan memanggil API Midtrans
            const status = Math.random() > 0.3 ? 'success' : 'pending';
            return status;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return 'failed';
        }
    },
    
    // Refund process (jika diperlukan)
    processRefund: async function(orderId, amount) {
        // Simulasi proses refund
        console.log(`Processing refund for order ${orderId}: ${Utils.formatRupiah(amount)}`);
        
        // Dalam implementasi nyata, ini akan memanggil API Midtrans atau sistem refund
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Refund berhasil diproses'
                });
            }, 2000);
        });
    }
};

// Export untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Payment;
}
