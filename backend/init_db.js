const mysql = require('mysql2/promise');

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Connected to MySQL server.');

        await connection.query('CREATE DATABASE IF NOT EXISTS swms_db');
        console.log('Database swms_db created or already exists.');

        await connection.query('USE swms_db');

        const createUsersQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createUsersQuery);
        
        const [userRows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (userRows.length === 0) {
            await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', 'admin123', 'admin']);
        }

        const createProductsQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                sku VARCHAR(50) UNIQUE NOT NULL,
                category VARCHAR(50) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                price DECIMAL(15, 2) NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createProductsQuery);
        console.log('Table products created or already exists.');

        const [prodRows] = await connection.query('SELECT COUNT(*) as count FROM products');
        if (prodRows[0].count === 0) {
            const dummyProducts = [
                ['Pioneer AVH-Z9280BT', 'Head Unit Audio Mobil', 'PAVH-9280', 'audio', 34, 1500000, 'aman', null],
                ['JBL Club 6500C', 'Speaker Mobil 6.5"', 'JCLUB-6500', 'audio', 12, 1500000, 'menipis', null],
                ['Michelin Pilot Sport 4', 'Ban Performansi 205/55R16', 'MPS4-205', 'ban', 2, 1200000, 'kritis', null],
                ['Enkei RP-F1', 'Velg Alloy 17" Silver', 'ENKF1-17', 'velg', 18, 2500000, 'aman', null],
                ['Hella Projector H7', 'Lampu Projector LED H7', 'HELLA-H7', 'lampu', 8, 350000, 'menipis', null],
                ['TRD Body Kit', 'Body Kit Aerodinamis Toyota', 'TRD-BK001', 'bodykit', 5, 8500000, 'kritis', null]
            ];

            for (const p of dummyProducts) {
                await connection.query(
                    'INSERT INTO products (name, description, sku, category, stock, price, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    p
                );
            }
            console.log('Dummy products inserted into database.');
        } else {
            console.log('Products table already has data.');
        }
        const createTransactionsQuery = `
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                type ENUM('in', 'out') NOT NULL,
                quantity INT NOT NULL,
                total_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
                supplier VARCHAR(100),
                destination VARCHAR(100),
                notes TEXT,
                admin VARCHAR(50) DEFAULT 'Admin User',
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createTransactionsQuery);
        console.log('Table transactions created or already exists.');

        const [txRows] = await connection.query('SELECT COUNT(*) as count FROM transactions');
        if (txRows[0].count === 0) {
            const [prods] = await connection.query('SELECT id, price FROM products');
            if (prods.length > 0) {
                const now = new Date();
                const txData = [];

                for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - dayOffset);
                    const dateStr = d.toISOString().slice(0, 10);

                    const inCount = Math.floor(Math.random() * 15) + 8;
                    const outCount = Math.floor(Math.random() * 12) + 5;

                    for (let i = 0; i < inCount; i++) {
                        const prod = prods[Math.floor(Math.random() * prods.length)];
                        const qty = Math.floor(Math.random() * 5) + 1;
                        const hour = String(Math.floor(Math.random() * 10) + 8).padStart(2, '0');
                        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                        txData.push([prod.id, 'in', qty, qty * parseFloat(prod.price), `${dateStr} ${hour}:${min}:00`]);
                    }

                    for (let i = 0; i < outCount; i++) {
                        const prod = prods[Math.floor(Math.random() * prods.length)];
                        const qty = Math.floor(Math.random() * 3) + 1;
                        const hour = String(Math.floor(Math.random() * 10) + 8).padStart(2, '0');
                        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                        txData.push([prod.id, 'out', qty, qty * parseFloat(prod.price), `${dateStr} ${hour}:${min}:00`]);
                    }
                }

                for (const tx of txData) {
                    await connection.query(
                        'INSERT INTO transactions (product_id, type, quantity, total_price, date) VALUES (?, ?, ?, ?, ?)',
                        tx
                    );
                }
                console.log(`Inserted ${txData.length} dummy transactions.`);
            }
        } else {
            console.log('Transactions table already has data.');
        }

        await connection.end();
        console.log('Database initialization completed successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initDB();
