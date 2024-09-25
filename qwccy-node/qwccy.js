const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3007;

const corsOptions = {
    origin: ['https://telegram.welikescwl.top/qwccy', 'https://telegram.welikescwl.top', 'https://192.168.0.142:5173', 'http://192.168.0.142:5173/qwccy'], // 允许的域名列表
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true, // 允许发送凭证（如 cookies）
    optionsSuccessStatus: 200 // 对于旧版浏览器的支持
};
app.use(cors(corsOptions));
app.use(express.json());
// 添加自定义的错误处理中间件
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: '无效的 JSON 格式', details: err.message });
    }
    next();
});

// 创建连接池而不是单个连接
const pool = mysql.createPool({
    host: '107.172.20.179',
    user: 'game',
    password: '115268.zz',
    database: 'qwccy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 封装查询函数
function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }
            connection.query(sql, params, (error, results) => {
                connection.release();
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });
    });
}
function parseInvitedUsers(invitedUsers) {
    if (Array.isArray(invitedUsers)) {
        return invitedUsers.map(Number);
    }
    if (typeof invitedUsers === 'string') {
        try {
            const parsed = JSON.parse(invitedUsers);
            return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch (error) {
            console.error('解析invited_users字符串时出错:', error);
            return invitedUsers.match(/\d+/g)?.map(Number) || [];
        }
    }
    console.error('无法解析invited_users:', invitedUsers);
    return [];
}
// 1. 添加用户
app.post('/add_users', async (req, res) => {
    console.log(req.body)
    const { id, first_name, last_name, username, language_code } = req.body;
    const insertSql = 'INSERT INTO Users (user_id, first_name, last_name, username, language_code, token_balance) VALUES (?, ?, ?, ?, ?, ?)';

    try {
        await query(insertSql, [id, first_name, last_name, username, language_code, 0]); // 添加默认的 token_balance 值
        res.status(200).json({ message: '用户添加成功', user_id: id });
    } catch (error) {
        res.status(201).json({ error: error.message });
    }
});

// 修改 /add_invitee 路由
app.post('/add_invitee', async (req, res) => {
    console.log(req.body);
    try {
        const { inviter_id, invitee_id } = req.body;

        if (!inviter_id || !invitee_id) {
            return res.status(400).json({ error: '缺少必要的参数' });
        }

        const checkSql = 'SELECT invited_users FROM Users WHERE user_id = ?';
        const updateSql = 'UPDATE Users SET invited_users = ? WHERE user_id = ?';
        const updateInviteeSql = 'UPDATE Users SET invited_by = ? WHERE user_id = ? AND invited_by IS NULL';

        // 检查邀请关系是否已存在
        const inviterResult = await query(checkSql, [inviter_id]);
        let invitedUsers = [];
        if (inviterResult && inviterResult.length > 0) {
            invitedUsers = parseInvitedUsers(inviterResult[0].invited_users);
        }

        if (!invitedUsers.includes(Number(invitee_id))) {
            invitedUsers.push(Number(invitee_id));

            // 更新邀请者的invited_users
            const updatedInvitedUsers = JSON.stringify(invitedUsers);
            await query(updateSql, [updatedInvitedUsers, inviter_id]);

            // 更新被邀请者的invited_by
            await query(updateInviteeSql, [inviter_id, invitee_id]);

            res.status(200).json({ message: '被邀请人添加成功' });
        } else {
            res.status(200).json({ message: '邀请关系已存在' });
        }
    } catch (error) {
        console.error('处理 /add_invitee 请求时出错:', error);
        res.status(422).json({ error: '处理请求时出错', details: error.message });
    }
});
// 3. 获取所有用户列表
app.get('/users', async (req, res) => {
    const selectSql = 'SELECT * FROM Users';

    try {
        const users = await query(selectSql);
        // 解析JSON字段
        users.forEach(user => {
            user.invited_users = parseInvitedUsers(user.invited_users);
            console.log(`用户 ${user.user_id} 的 invited_users:`, user.invited_users);
        });
        res.json(users);
    } catch (error) {
        console.error('获取用户列表时出错:', error);
        res.status(500).json({ error: error.message });
    }
});

// 通过user_id查询用户信息
app.get('/check_users', async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: '缺少user_id参数' });
    }
    const selectSql = 'SELECT * FROM Users WHERE user_id = ?';

    try {
        const users = await query(selectSql, [user_id]);
        if (users.length > 0) {
            const user = users[0];
            // 处理 invited_users
            user.invited_users = parseInvitedUsers(user.invited_users);
            res.json(user);
        } else {
            res.status(404).json({ error: '未找到指定的用户' });
        }
    } catch (error) {
        console.error('查询用户时出错:', error);
        res.status(500).json({ error: error.message });
    }
});

// 更新用户信息（支持部分字段更新）
app.put('/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { wallet_address, token_balance, highest_score } = req.body;

    // 构建动态 SQL 更新语句
    const updateParts = [];
    const values = [];

    if (wallet_address !== undefined) {
        updateParts.push('wallet_address = ?');
        values.push(wallet_address);
    }

    if (token_balance !== undefined) {
        updateParts.push('token_balance = token_balance + ?');
        values.push(token_balance);
    }

    if (highest_score !== undefined) {
        updateParts.push('highest_score = ?');
        values.push(highest_score);
    }

    if (updateParts.length === 0) {
        return res.status(400).json({ error: '没有提供有效的更新字段' });
    }

    const updateSql = `UPDATE Users SET ${updateParts.join(', ')} WHERE user_id = ?`;
    values.push(user_id);

    try {
        console.log('执行的 SQL:', updateSql);
        console.log('使用的值:', values);

        const result = await query(updateSql, values);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: '未找到指定的用户ID' });
        } else {
            // 查询更新后的用户信息
            const selectSql = 'SELECT * FROM Users WHERE user_id = ?';
            const updatedUser = await query(selectSql, [user_id]);
            console.log('更新后的用户信息:', updatedUser);

            res.json({ message: '用户信息更新成功', user: updatedUser });
        }
    } catch (error) {
        console.error('更新用户信息时出错:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function parseInvitedUsers(invitedUsers) {
    if (Array.isArray(invitedUsers)) {
        return invitedUsers.map(Number);
    }
    if (typeof invitedUsers === 'string') {
        try {
            const parsed = JSON.parse(invitedUsers);
            return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch (error) {
            console.error('解析invited_users字符串时出错:', error);
            return invitedUsers.match(/\d+/g)?.map(Number) || [];
        }
    }
    console.error('无法解析invited_users:', invitedUsers);
    return [];
}