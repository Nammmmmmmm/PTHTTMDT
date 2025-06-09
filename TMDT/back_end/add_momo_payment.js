require('dotenv').config();
const db = require('./src/models');

async function addMomoPayment() {
  try {
    console.log('Connecting to database with URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    await db.connectDB();
    console.log('Connected to database');

    const Payment = db.payment;
    
    // Kiểm tra xem đã có phương thức thanh toán MoMo chưa
    const existingMomo = await Payment.findOne({ name: 'Thanh toán MoMo', is_delete: false });
    
    if (existingMomo) {
      console.log('MoMo payment method already exists!');
      console.log('Existing MoMo payment:', existingMomo);
      process.exit(0);
    }

    // Tạo phương thức thanh toán MoMo mới
    const momoPayment = new Payment({
      id: `PAY-MOMO-${Date.now()}`,
      name: 'Thanh toán MoMo',
      is_active: true,
      is_delete: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    await momoPayment.save();
    console.log('MoMo payment method added successfully!');
    console.log('Payment ID:', momoPayment.id);
    console.log('Payment Name:', momoPayment.name);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding MoMo payment method:', error);
    process.exit(1);
  }
}

addMomoPayment(); 